import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { effectivePrice, money, parseList } from "@/lib/utils";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { WishButton } from "@/components/WishButton";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  if (!p) return {};
  return { title: p.name, description: p.description.slice(0, 155), openGraph: { images: [p.image] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!p || !p.active) notFound();

  const session = await getSession();
  const canReview =
    !!session &&
    !!(await db.orderItem.findFirst({ where: { productId: p.id, order: { userId: session.id, status: "DELIVERED" } } })) &&
    !p.reviews.some((r) => (session ? r.userId === session.id : false));

  const related = await db.product.findMany({ where: { categoryId: p.categoryId, id: { not: p.id }, active: true }, take: 4 });
  const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;
  const price = effectivePrice(p);
  const images = parseList(p.images);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: images,
    description: p.description,
    offers: { "@type": "Offer", priceCurrency: "PKR", price, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    ...(p.reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: p.reviews.length } } : {}),
  };

  return (
    <div className="space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="text-sm text-gray-500">
        <Link href="/">Home</Link> / <Link href={`/products?category=${p.category.slug}`}>{p.category.name}</Link> / {p.name}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0] ?? p.image} alt={p.name} className="aspect-square w-full rounded-lg border object-cover" />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`${p.name} ${i + 1}`} loading="lazy" className="aspect-square rounded border object-cover" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold">{p.name}</h1>
            <WishButton id={p.id} className="relative shrink-0 border" />
          </div>
          <p className="text-sm text-gray-600">
            {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))} ({p.reviews.length} reviews)
          </p>
          <p className="text-2xl font-bold text-rose-600">
            {money(price)}
            {p.discountPrice && <span className="ml-3 text-base font-normal text-gray-400 line-through">{money(p.price)}</span>}
          </p>
          <p className="text-gray-700">{p.description}</p>
          <AddToCart
            product={{ id: p.id, slug: p.slug, name: p.name, image: p.image, price, stock: p.stock }}
            sizes={parseList(p.sizes)}
            colors={parseList(p.colors)}
          />
          <ul className="space-y-1 border-t pt-4 text-sm text-gray-600">
            <li>🚚 Cash on Delivery available</li>
            <li>↩️ 7 din easy return</li>
            <li>📦 Rs. 5,000 se upar free delivery</li>
          </ul>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Reviews</h2>
        {p.reviews.length === 0 && <p className="text-sm text-gray-500">Abhi tak koi review nahi.</p>}
        <ul className="space-y-3">
          {p.reviews.map((r) => (
            <li key={r.id} className="rounded border p-3 text-sm">
              <p className="font-medium">{r.user.name} <span className="text-amber-500">{"★".repeat(r.rating)}</span></p>
              <p className="mt-1 text-gray-700">{r.comment}</p>
            </li>
          ))}
        </ul>
        {canReview && <ReviewForm productId={p.id} />}
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
