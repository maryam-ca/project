import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { money } from "@/lib/utils";
import { ClearCart } from "@/components/ClearCart";
import { cancelOrderAction, requestReturnAction } from "@/app/actions/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Details", robots: { index: false } };

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const order = await db.order.findUnique({ where: { id: Number(id) || 0 }, include: { items: true } });
  if (!order) notFound();

  // Access: owner, admin, or someone who just placed / looked up this order (cookie)
  const session = await getSession();
  const cookieOk = (await cookies()).get("last_order")?.value === String(order.id);
  const allowed = cookieOk || (session && (session.role === "ADMIN" || session.id === order.userId));
  if (!allowed)
    return (
      <div className="py-20 text-center">
        <p>Is order ko dekhne ke liye <Link href="/track" className="text-rose-600 underline">Track Order</Link> use karein.</p>
      </div>
    );

  const stepIdx = STEPS.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {placed === "1" && <ClearCart />}
      {placed === "1" && (
        <div className="rounded-lg bg-green-50 p-6 text-center">
          <p className="text-3xl">🎉</p>
          <h1 className="mt-2 text-2xl font-bold text-green-700">Shukriya! Order place ho gaya</h1>
          <p className="mt-1 text-sm text-green-800">Order #{order.id} · Delivery par {money(order.total)} ada karein.</p>
          <p className="mt-1 text-xs text-gray-600">Order number aur phone number se aap kisi bhi waqt <Link href="/track" className="underline">track</Link> kar sakte hain.</p>
        </div>
      )}
      <h2 className="text-xl font-bold">Order #{order.id}</h2>

      {cancelled || order.status === "RETURN_REQUESTED" ? (
        <p className="rounded bg-amber-50 p-3 text-sm font-medium">Status: {order.status.replace("_", " ")}</p>
      ) : (
        <ol className="flex justify-between text-center text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`mx-auto mb-1 grid h-8 w-8 place-items-center rounded-full ${i <= stepIdx ? "bg-rose-600 text-white" : "bg-gray-200"}`}>{i + 1}</div>
              {s[0] + s.slice(1).toLowerCase()}
            </li>
          ))}
        </ol>
      )}

      {order.trackingId && (
        <p className="rounded bg-blue-50 p-3 text-sm">Courier: <b>{order.courier ?? "-"}</b> · Tracking ID: <b>{order.trackingId}</b></p>
      )}

      <div className="rounded border">
        <table className="w-full text-sm">
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-3">{i.name}<span className="block text-xs text-gray-500">{[i.size, i.color].filter(Boolean).join(" / ")}</span></td>
                <td className="p-3 text-center">× {i.quantity}</td>
                <td className="p-3 text-right">{money(i.price * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 p-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({order.couponCode})</span><span>-{money(order.discount)}</span></div>}
          <div className="flex justify-between"><span>Delivery</span><span>{order.shipping === 0 ? "Free" : money(order.shipping)}</span></div>
          <div className="flex justify-between border-t pt-2 font-bold"><span>Total ({order.paymentMethod})</span><span>{money(order.total)}</span></div>
        </div>
      </div>

      <div className="rounded border p-3 text-sm">
        <p className="font-semibold">Delivery Address</p>
        <p>{order.customerName} · {order.phone}</p>
        <p className="text-gray-600">{order.address}, {order.city}</p>
      </div>

      <div className="flex gap-3">
        {order.status === "PENDING" && (
          <form action={cancelOrderAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <button className="rounded border border-red-600 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Order Cancel Karein</button>
          </form>
        )}
        {order.status === "DELIVERED" && (
          <form action={requestReturnAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <button className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Return / Refund Request</button>
          </form>
        )}
        <Link href="/products" className="rounded bg-rose-600 px-4 py-2 text-sm text-white">Shopping Jari Rakhein</Link>
      </div>
    </div>
  );
}
