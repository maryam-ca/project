"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { inputCls } from "@/components/ActionForm";
import { placeOrderAction, previewCoupon } from "@/app/actions/orders";
import { money, shippingFor } from "@/lib/utils";

export function CheckoutForm({ user }: { user: { name: string; email: string; phone: string } | null }) {
  const { items, subtotal, ready } = useCart();
  const [state, action, pending] = useActionState(placeOrderAction, undefined);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  if (!ready) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  if (items.length === 0)
    return (
      <p className="py-20 text-center">
        Cart khali hai. <Link href="/products" className="text-rose-600 underline">Shopping karein</Link>
      </p>
    );

  const discount = applied?.discount ?? 0;
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  const applyCoupon = async () => {
    const r = await previewCoupon(code, subtotal);
    if (r.ok) {
      setApplied({ code: r.code, discount: r.discount });
      setCouponMsg(`Coupon lag gaya: -${money(r.discount)}`);
    } else {
      setApplied(null);
      setCouponMsg(r.error);
    }
  };

  const payload = JSON.stringify(
    items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color }))
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-8 md:grid-cols-[1fr_340px]"
    >
      <input type="hidden" name="items" value={payload} />
      <input type="hidden" name="couponCode" value={applied?.code ?? ""} />

      <div className="space-y-4">
        {!user && (
          <p className="rounded bg-gray-50 p-3 text-sm">
            Account hai? <Link href="/login?next=/checkout" className="text-rose-600 underline">Login karein</Link> ya neeche guest ke taur par order karein.
          </p>
        )}
        <h2 className="font-semibold">Delivery Details</h2>
        <input name="customerName" defaultValue={user?.name} placeholder="Poora naam" className={inputCls} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="email" type="email" defaultValue={user?.email} placeholder="Email" className={inputCls} required />
          <input name="phone" defaultValue={user?.phone} placeholder="Mobile (03XXXXXXXXX)" className={inputCls} required />
        </div>
        <input name="city" placeholder="City" className={inputCls} required />
        <textarea name="address" rows={3} placeholder="Mukammal address (ghar/street/area)" className={inputCls} required />
        <h2 className="pt-2 font-semibold">Payment Method</h2>
        <label className="flex items-center gap-2 rounded border border-rose-600 bg-rose-50 p-3 text-sm">
          <input type="radio" checked readOnly /> Cash on Delivery (COD)
        </label>
        <p className="text-xs text-gray-500">Online payment (JazzCash / Easypaisa / card) jald available hogi.</p>
      </div>

      <aside className="h-fit space-y-3 rounded border p-4 text-sm">
        <h2 className="font-semibold">Order Summary</h2>
        <ul className="space-y-1 text-gray-600">
          {items.map((i) => (
            <li key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between gap-2">
              <span>{i.name} × {i.quantity}</span>
              <span>{money(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 border-t pt-3">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className={inputCls} />
          <button type="button" onClick={applyCoupon} className="rounded bg-gray-900 px-3 text-white">Apply</button>
        </div>
        {couponMsg && <p className={`text-xs ${applied ? "text-green-600" : "text-red-600"}`}>{couponMsg}</p>}
        <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{money(discount)}</span></div>}
        <div className="flex justify-between"><span>Delivery</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(total)}</span></div>
        {state?.error && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-red-700">{state.error}</p>}
        <button disabled={pending} className="w-full rounded bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:opacity-60">
          {pending ? "Order place ho raha hai..." : "Place Order"}
        </button>
        <p className="text-xs text-gray-500">Final price aur stock server par dobara verify hota hai.</p>
      </aside>
    </form>
  );
}
