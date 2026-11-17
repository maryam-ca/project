import { db } from "@/lib/db";
import { money, ORDER_STATUSES } from "@/lib/utils";
import { updateOrderAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const orders = await db.order.findMany({
    where: status ? { status } : {},
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>
      <form className="mb-4 text-sm">
        <select name="status" defaultValue={status ?? ""} className="rounded border px-2 py-1">
          <option value="">All</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="ml-2 rounded bg-gray-900 px-3 py-1 text-white">Filter</button>
      </form>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded border p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">#{o.id} · {o.customerName} · {o.phone}</p>
              <p className="font-semibold">{money(o.total)} ({o.paymentMethod} · {o.paymentStatus})</p>
            </div>
            <p className="text-gray-600">{o.address}, {o.city} · {o.createdAt.toLocaleString("en-GB")}</p>
            <ul className="my-2 list-disc pl-5 text-gray-700">
              {o.items.map((i) => <li key={i.id}>{i.name} × {i.quantity} {[i.size, i.color].filter(Boolean).join("/")}</li>)}
            </ul>
            <form action={updateOrderAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={o.id} />
              <select name="status" defaultValue={o.status} className="rounded border px-2 py-1">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select name="courier" defaultValue={o.courier ?? ""} className="rounded border px-2 py-1">
                <option value="">Courier</option>
                {["TCS", "Leopards", "Trax", "PostEx", "M&P"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input name="trackingId" defaultValue={o.trackingId ?? ""} placeholder="Tracking ID" className="rounded border px-2 py-1" />
              <button className="rounded bg-rose-600 px-3 py-1 text-white">Update</button>
              <a href={`/admin/orders/${o.id}/invoice`} target="_blank" className="text-rose-600 underline">Invoice</a>
            </form>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500">Koi order nahi.</p>}
      </div>
    </div>
  );
}
