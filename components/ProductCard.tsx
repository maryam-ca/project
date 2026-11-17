import Link from "next/link";
import { money } from "@/lib/utils";
import { WishButton } from "./WishButton";

type P = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPrice: number | null;
  stock: number;
};

export function ProductCard({ p }: { p: P }) {
  const off = p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white transition hover:shadow-md">
      <Link href={`/products/${p.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          {off > 0 && <span className="absolute left-2 top-2 rounded bg-rose-600 px-2 py-0.5 text-xs text-white">-{off}%</span>}
          {p.stock === 0 && <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold">Out of stock</span>}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium">{p.name}</h3>
          <p className="mt-1 text-sm">
            <span className="font-semibold text-rose-600">{money(p.discountPrice ?? p.price)}</span>
            {p.discountPrice && <span className="ml-2 text-xs text-gray-400 line-through">{money(p.price)}</span>}
          </p>
        </div>
      </Link>
      <WishButton id={p.id} />
    </div>
  );
}
