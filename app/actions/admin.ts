"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUSES, slugify } from "@/lib/utils";
import type { FormState } from "./auth";

const csv = (s: string) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))];

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(3000),
  price: z.coerce.number().int().min(1),
  discountPrice: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  image: z.string().trim().url("Image URL valid hona chahiye"),
  categoryId: z.coerce.number().int(),
  sizes: z.string().default(""),
  colors: z.string().default(""),
});

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.discountPrice && d.discountPrice >= d.price) return { error: "Discount price asli price se kam hona chahiye" };
  const data = {
    name: d.name,
    description: d.description,
    price: d.price,
    discountPrice: d.discountPrice || null,
    stock: d.stock,
    image: d.image,
    images: [d.image],
    categoryId: d.categoryId,
    sizes: csv(d.sizes),
    colors: csv(d.colors),
    featured: fd.get("featured") === "on",
    active: fd.get("active") === "on",
  };
  const id = Number(fd.get("id"));
  if (id) {
    await db.product.update({ where: { id }, data });
  } else {
    let slug = slugify(d.name);
    if (await db.product.findUnique({ where: { slug } })) slug += `-${Date.now().toString(36)}`;
    await db.product.create({ data: { ...data, slug } });
  }
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProductAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const used = await db.orderItem.count({ where: { productId: id } });
  // Orders ki history bachane ke liye delete ki jagah deactivate
  if (used > 0) await db.product.update({ where: { id }, data: { active: false } });
  else await db.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function updateOrderAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const raw = String(fd.get("status"));
  if (!(ORDER_STATUSES as readonly string[]).includes(raw)) return;
  const status = raw as OrderStatus;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;
  const restock = status === "CANCELLED" && order.status !== "CANCELLED";
  await db.$transaction([
    db.order.update({
      where: { id },
      data: {
        status,
        courier: String(fd.get("courier") ?? "").trim() || null,
        trackingId: String(fd.get("trackingId") ?? "").trim() || null,
        paymentStatus: status === "DELIVERED" ? "PAID" : status === "CANCELLED" ? "PENDING" : order.paymentStatus,
      },
    }),
    ...(restock
      ? order.items.map((i) => db.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } }))
      : []),
  ]);
  revalidatePath("/admin/orders");
}

const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(20),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().int().min(1),
  minOrder: z.coerce.number().int().min(0).default(0),
});

export async function createCouponAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.type === "PERCENT" && parsed.data.value > 90) return { error: "Percent 90 se zyada nahi ho sakta" };
  if (await db.coupon.findUnique({ where: { code: parsed.data.code } })) return { error: "Ye code pehle se hai" };
  await db.coupon.create({ data: parsed.data });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const c = await db.coupon.findUnique({ where: { id } });
  if (c) await db.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
}
