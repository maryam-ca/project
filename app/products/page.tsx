import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop All Products" };

type SP = { q?: string; category?: string; sort?: string; min?: string; max?: string; page?: string };
const PER_PAGE = 12;

export default async function Products({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const min = Number(sp.min) || undefined;
  const max = Number(sp.max) || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(sp.q ? { OR: [{ name: { contains: sp.q } }, { description: { contains: sp.q } }] } : {}),
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(min || max ? { price: { gte: min, lte: max } } : {}),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "price_asc" ? { price: "asc" } : sp.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.product.count({ where }),
    db.category.findMany(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) if (v) p.set(k, v);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="space-y-6 text-sm">
        <div>
          <p className="mb-2 font-semibold">Categories</p>
          <ul className="space-y-1">
            <li><Link href={qs({ category: undefined, page: undefined })} className={!sp.category ? "font-bold text-rose-600" : ""}>All</Link></li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={qs({ category: c.slug, page: undefined })} className={sp.category === c.slug ? "font-bold text-rose-600" : ""}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <form className="space-y-2">
          {sp.q && <input type="hidden" name="q" value={sp.q} />}
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          <p className="font-semibold">Price (Rs.)</p>
          <div className="flex gap-2">
            <input name="min" defaultValue={sp.min} placeholder="Min" type="number" min={0} className="w-full rounded border px-2 py-1" />
            <input name="max" defaultValue={sp.max} placeholder="Max" type="number" min={0} className="w-full rounded border px-2 py-1" />
          </div>
          <button className="w-full rounded bg-gray-900 py-1.5 text-white">Apply</button>
        </form>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            {total} product{total === 1 ? "" : "s"}
            {sp.q && <> for &quot;<b>{sp.q}</b>&quot;</>}
          </p>
          <div className="flex gap-2 text-sm">
            {[["", "Newest"], ["price_asc", "Price: Low to High"], ["price_desc", "Price: High to Low"]].map(([v, l]) => (
              <Link key={v} href={qs({ sort: v || undefined, page: undefined })} className={`rounded border px-3 py-1 ${(sp.sort ?? "") === v ? "border-rose-600 text-rose-600" : ""}`}>{l}</Link>
            ))}
          </div>
        </div>
        {products.length === 0 ? (
          <p className="py-20 text-center text-gray-500">Koi product nahi mila.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={qs({ page: String(n) })} className={`rounded border px-3 py-1 text-sm ${n === page ? "bg-rose-600 text-white" : ""}`}>{n}</Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
