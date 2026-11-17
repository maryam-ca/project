"use client";

import { useCart } from "./CartProvider";

export function WishButton({ id, className = "absolute right-2 top-2" }: { id: number; className?: string }) {
  const { wishlist, toggleWish } = useCart();
  const on = wishlist.includes(id);
  return (
    <button
      onClick={() => toggleWish(id)}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      className={`${className} grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow ${on ? "text-rose-600" : "text-gray-500"}`}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
