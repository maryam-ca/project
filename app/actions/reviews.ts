"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { FormState } from "./auth";

const schema = z.object({
  productId: z.coerce.number().int(),
  rating: z.coerce.number().int().min(1, "Rating chunein").max(5),
  comment: z.string().trim().min(3, "Review likhein").max(500),
});

export async function addReviewAction(_: FormState, fd: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Review ke liye login karein" };
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { productId, rating, comment } = parsed.data;

  const bought = await db.orderItem.findFirst({
    where: { productId, order: { userId: session.id, status: "DELIVERED" } },
  });
  if (!bought) return { error: "Sirf delivered product ka review de sakte hain" };
  if (await db.review.findFirst({ where: { productId, userId: session.id } }))
    return { error: "Aap pehle hi review de chuke hain" };

  const p = await db.review.create({ data: { productId, userId: session.id, rating, comment }, include: { product: true } });
  revalidatePath(`/products/${p.product.slug}`);
}
