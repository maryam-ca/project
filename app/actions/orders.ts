"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { evaluateCoupon } from "@/lib/coupon";
import { rateLimit } from "@/lib/ratelimit";
import { effectivePrice, shippingFor } from "@/lib/utils";
import type { FormState } from "./auth";

const itemSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1).max(20),
  size: z.string().optional(),
  color: z.string().optional(),
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Naam likhein").max(80),
  email: z.string().trim().toLowerCase().email("Valid email likhein"),
  phone: z.string().trim().regex(/^(\+92|0)?3\d{9}$/, "Valid Pakistani mobile number likhein (03XXXXXXXXX)"),
  city: z.string().trim().min(2, "City likhein").max(60),
  address: z.string().trim().min(10, "Mukammal address likhein").max(300),
  couponCode: z.string().trim().optional(),
});

export async function previewCoupon(code: string, subtotal: number) {
  return evaluateCoupon(code, subtotal);
}

export async function placeOrderAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await rateLimit("order", 10, 10 * 60_000))) return { error: "Bohat zyada orders. Thori der baad try karein." };

  const parsed = checkoutSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let items: z.infer<typeof itemSchema>[];
  try {
    items = z.array(itemSchema).min(1).max(50).parse(JSON.parse(String(fd.get("items") ?? "[]")));
  } catch {
    return { error: "Cart khali hai" };
  }

  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Server-side price & stock validation (client prices are never trusted)
  const lines: { productId: number; name: string; price: number; quantity: number; size?: string; color?: string }[] = [];
  const qtyByProduct = new Map<number, number>();
  for (const it of items) {
    const p = byId.get(it.productId);
    if (!p) return { error: "Cart mein ek product ab available nahi hai" };
    if (it.size && !p.sizes.includes(it.size)) return { error: `${p.name}: invalid size` };
    if (it.color && !p.colors.includes(it.color)) return { error: `${p.name}: invalid color` };
    const total = (qtyByProduct.get(p.id) ?? 0) + it.quantity;
    qtyByProduct.set(p.id, total);
    if (total > p.stock) return { error: `${p.name}: sirf ${p.stock} stock mojood hai` };
    lines.push({ productId: p.id, name: p.name, price: effectivePrice(p), quantity: it.quantity, size: it.size, color: it.color });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  let discount = 0;
  let couponCode: string | null = null;
  if (parsed.data.couponCode) {
    const c = await evaluateCoupon(parsed.data.couponCode, subtotal);
    if (!c.ok) return { error: c.error };
    discount = c.discount;
    couponCode = c.code;
  }
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;
  const session = await getSession();

  const order = await db.$transaction(async (tx) => {
    // Atomic stock decrement; fails if stock changed meanwhile
    for (const [pid, qty] of qtyByProduct) {
      const r = await tx.product.updateMany({ where: { id: pid, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
      if (r.count === 0) throw new Error("STOCK");
    }
    if (couponCode) {
      const r = await tx.coupon.updateMany({ where: { code: couponCode, active: true }, data: { used: { increment: 1 } } });
      if (r.count === 0) throw new Error("COUPON");
    }
    return tx.order.create({
      data: {
        userId: session?.id ?? null,
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        city: parsed.data.city,
        address: parsed.data.address,
        subtotal,
        discount,
        shipping,
        total,
        couponCode,
        paymentMethod: "COD",
        items: { create: lines },
      },
    });
  }).catch((e: Error) => e);

  if (order instanceof Error) {
    return { error: order.message === "STOCK" ? "Stock tabdeel ho gaya, cart dobara check karein" : "Order place nahi ho saka" };
  }

  (await cookies()).set("last_order", String(order.id), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  redirect(`/order/${order.id}?placed=1`);
}

export async function lookupOrderAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await rateLimit("track", 15, 10 * 60_000))) return { error: "Bohat zyada koshishein" };
  const id = Number(fd.get("orderId"));
  const phone = String(fd.get("phone") ?? "").trim();
  if (!Number.isInteger(id) || !phone) return { error: "Order number aur phone number likhein" };
  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.phone !== phone) return { error: "Order nahi mila. Details check karein." };
  (await cookies()).set("last_order", String(order.id), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 });
  redirect(`/order/${order.id}`);
}

export async function requestReturnAction(fd: FormData) {
  const id = Number(fd.get("orderId"));
  const session = await getSession();
  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.status !== "DELIVERED") return;
  const allowed = (session && order.userId === session.id) || (await cookies()).get("last_order")?.value === String(id);
  if (!allowed) return;
  await db.order.update({ where: { id }, data: { status: "RETURN_REQUESTED" } });
  redirect(`/order/${id}`);
}

export async function cancelOrderAction(fd: FormData) {
  const id = Number(fd.get("orderId"));
  const session = await getSession();
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.status !== "PENDING") return;
  const allowed = (session && order.userId === session.id) || (await cookies()).get("last_order")?.value === String(id);
  if (!allowed) return;
  await db.$transaction([
    db.order.update({ where: { id }, data: { status: "CANCELLED" } }),
    ...order.items.map((i) => db.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })),
  ]);
  redirect(`/order/${id}`);
}
