"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number; // display only; server recomputes
  quantity: number;
  stock: number;
  size?: string;
  color?: string;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (i: CartItem) => void;
  remove: (productId: number, size?: string, color?: string) => void;
  setQty: (productId: number, qty: number, size?: string, color?: string) => void;
  clear: () => void;
  wishlist: number[];
  toggleWish: (id: number) => void;
  ready: boolean;
};

const CartCtx = createContext<Ctx | null>(null);
const same = (a: CartItem, id: number, size?: string, color?: string) =>
  a.productId === id && a.size === size && a.color === color;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("cart") ?? "[]"));
      setWishlist(JSON.parse(localStorage.getItem("wishlist") ?? "[]"));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [items, wishlist, ready]);

  const add = useCallback((i: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => same(p, i.productId, i.size, i.color));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(next[idx].quantity + i.quantity, i.stock) };
        return next;
      }
      return [...prev, i];
    });
  }, []);
  const remove = useCallback(
    (id: number, size?: string, color?: string) =>
      setItems((p) => p.filter((x) => !same(x, id, size, color))),
    []
  );
  const setQty = useCallback(
    (id: number, qty: number, size?: string, color?: string) =>
      setItems((p) =>
        p.map((x) => (same(x, id, size, color) ? { ...x, quantity: Math.max(1, Math.min(qty, x.stock)) } : x))
      ),
    []
  );
  const clear = useCallback(() => setItems([]), []);
  const toggleWish = useCallback(
    (id: number) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    []
  );

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      add,
      remove,
      setQty,
      clear,
      wishlist,
      toggleWish,
      ready,
    }),
    [items, add, remove, setQty, clear, wishlist, toggleWish, ready]
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
