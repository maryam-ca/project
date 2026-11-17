import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featured, latest] = await Promise.all([
    db.category.findMany(),
    db.product.findMany({ where: { featured: true, active: true }, take: 8 }),
    db.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-14 text-white sm:px-12">
        <h1 className="text-3xl font-bold sm:text-5xl">Mega Sale - 50% tak off</h1>
        <p className="mt-3 max-w-lg text-lg">Pakistan bhar mein Cash on Delivery. Rs. 5,000 se upar free delivery.</p>
        <p className="mt-2 text-sm">
          Code <b>WELCOME10</b> se pehle order par 10% extra off.
        </p>
        <Link href="/products" className="mt-6 inline-block rounded bg-white px-6 py-3 font-semibold text-rose-600 hover:bg-rose-50">
          Shop Now
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Categories</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image ?? ""} alt={c.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-black/40 text-lg font-semibold text-white">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Featured Products</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">New Arrivals</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg bg-gray-50 p-6 text-center text-sm sm:grid-cols-3">
        <div><p className="text-2xl">🚚</p><p className="font-semibold">Cash on Delivery</p><p className="text-gray-600">Ghar par payment karein</p></div>
        <div><p className="text-2xl">↩️</p><p className="font-semibold">7 Day Returns</p><p className="text-gray-600">Aasaan return policy</p></div>
        <div><p className="text-2xl">🔒</p><p className="font-semibold">Secure Shopping</p><p className="text-gray-600">Aap ka data mehfooz</p></div>
      </section>
    </div>
  );
}
