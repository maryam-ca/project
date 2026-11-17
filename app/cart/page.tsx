"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { FREE_SHIPPING_ABOVE, money } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();
  if (!ready) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  if (items.length === 0)
    return (
      <div className="py-20 text-center">
        <p className="text-lg">Aap ka cart khali hai</p>
        <Link href="/products" className="mt-4 inline-block rounded bg-rose-600 px-6 py-2 text-white">Shopping shuru karein</Link>
      </div>
    );

  const remaining = FREE_SHIPPING_ABOVE - subtotal;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={`${i.productId}-${i.size}-${i.color}`} className="flex gap-4 rounded border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt={i.name} className="h-24 w-24 rounded object-cover" />
              <div className="flex-1">
                <Link href={`/products/${i.slug}`} className="font-medium hover:text-rose-600">{i.name}</Link>
                <p className="text-sm text-gray-500">{[i.size, i.color].filter(Boolean).join(" / ")}</p>
                <p className="mt-1 font-semibold text-rose-600">{money(i.price)}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center rounded border text-sm">
                    <button className="px-3 py-1" onClick={() => setQty(i.productId, i.quantity - 1, i.size, i.color)} aria-label="Decrease">−</button>
                    <span className="w-8 text-center">{i.quantity}</span>
                    <button className="px-3 py-1" onClick={() => setQty(i.productId, i.quantity + 1, i.size, i.color)} aria-label="Increase">+</button>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-red-600" onClick={() => remove(i.productId, i.size, i.color)}>Remove</button>
                </div>
              </div>
              <p className="font-semibold">{money(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-3 rounded border p-4">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <p className="text-xs text-gray-500">
            {remaining > 0 ? `${money(remaining)} aur khareedein aur free delivery payein` : "Aap ko free delivery mil gayi!"}
          </p>
          <Link href="/checkout" className="block rounded bg-rose-600 py-3 text-center font-medium text-white hover:bg-rose-700">Checkout</Link>
        </aside>
      </div>
    </div>
  );
}
