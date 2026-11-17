import { db } from "./db";

export async function evaluateCoupon(code: string, subtotal: number) {
  const c = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!c || !c.active) return { ok: false as const, error: "Invalid coupon code" };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false as const, error: "Coupon expired" };
  if (c.usageLimit !== null && c.used >= c.usageLimit)
    return { ok: false as const, error: "Coupon usage limit reached" };
  if (subtotal < c.minOrder)
    return { ok: false as const, error: `Minimum order Rs. ${c.minOrder} required` };
  const discount =
    c.type === "PERCENT" ? Math.floor((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  return { ok: true as const, discount, code: c.code };
}
