import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ where: { active: true }, select: { slug: true } });
  const statics = ["", "/products", "/about", "/contact", "/faq", "/privacy", "/terms", "/returns"];
  return [
    ...statics.map((p) => ({ url: `${SITE}${p}` })),
    ...products.map((p) => ({ url: `${SITE}/products/${p.slug}` })),
  ];
}
