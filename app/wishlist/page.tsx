"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductCard } from "@/components/ProductCard";

type P = { id: number; slug: string; name: string; image: string; price: number; discountPrice: number | null; stock: number };

export default function WishlistPage() {
  const { wishlist, ready } = useCart();
  const [products, setProducts] = useState<P[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${wishlist.join(",")}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [wishlist, ready]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Wishlist</h1>
      {ready && wishlist.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Wishlist khali hai. <Link href="/products" className="text-rose-600 underline">Products dekhein</Link></p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.filter((p) => wishlist.includes(p.id)).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
