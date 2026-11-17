"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartBadge() {
  const { count, wishlist } = useCart();
  return (
    <div className="flex items-center gap-4">
      <Link href="/wishlist" className="hover:text-rose-600" aria-label="Wishlist">
        ♡ <span className="text-xs">{wishlist.length}</span>
      </Link>
      <Link href="/cart" className="relative hover:text-rose-600" aria-label="Cart">
        🛒
        {count > 0 && (
          <span className="absolute -right-3 -top-2 rounded-full bg-rose-600 px-1.5 text-xs text-white">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}
