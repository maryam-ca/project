"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

type Props = {
  product: { id: number; slug: string; name: string; image: string; price: number; stock: number };
  sizes: string[];
  colors: string[];
};

export function AddToCart({ product, sizes, colors }: Props) {
  const { add } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.stock === 0;

  const doAdd = () => {
    add({ productId: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price, stock: product.stock, quantity: qty, size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const chip = (active: boolean) =>
    `rounded border px-3 py-1 text-sm ${active ? "border-rose-600 bg-rose-50 text-rose-700" : "hover:border-gray-400"}`;

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={chip(size === s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={chip(color === c)}>{c}</button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded border">
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
          <span className="w-8 text-center">{qty}</span>
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase">+</button>
        </div>
        <span className="text-sm text-gray-500">{out ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}</span>
      </div>
      <div className="flex gap-3">
        <button disabled={out} onClick={doAdd} className="flex-1 rounded bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:bg-gray-300">
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <button disabled={out} onClick={() => { doAdd(); router.push("/checkout"); }} className="flex-1 rounded border border-rose-600 py-3 font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40">
          Buy Now
        </button>
      </div>
    </div>
  );
}
