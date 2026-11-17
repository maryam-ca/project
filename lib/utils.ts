export const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
export const effectivePrice = (p: { price: number; discountPrice: number | null }) =>
  p.discountPrice ?? p.price;
export const parseList = (s: string): string[] => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const FREE_SHIPPING_ABOVE = 5000;
export const SHIPPING_FEE = 250;
export const shippingFor = (subtotalAfterDiscount: number) =>
  subtotalAfterDiscount >= FREE_SHIPPING_ABOVE || subtotalAfterDiscount === 0 ? 0 : SHIPPING_FEE;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
] as const;
