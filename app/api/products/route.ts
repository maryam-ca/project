import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public read-only endpoint used by the wishlist page.
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 100);
  const products = await db.product.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true, slug: true, name: true, image: true, price: true, discountPrice: true, stock: true },
  });
  return NextResponse.json(products);
}
