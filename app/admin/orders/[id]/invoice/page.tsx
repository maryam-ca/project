import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice", robots: { index: false } };

export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await db.order.findUnique({ where: { id: Number(id) || 0 }, include: { items: true } });
  if (!o) notFound();
  return (
    <div className="mx-auto max-w-2xl bg-white p-4 text-sm">
      <div className="flex justify-between border-b pb-3">
        <div><p className="text-xl font-bold text-rose-600">ShopEasy</p><p>Invoice / Packing Slip</p></div>
        <div className="text-right"><p>Order #{o.id}</p><p>{o.createdAt.toLocaleDateString("en-GB")}</p></div>
      </div>
      <div className="my-3">
        <p className="font-semibold">Ship to:</p>
        <p>{o.customerName} · {o.phone}</p>
        <p>{o.address}, {o.city}</p>
      </div>
      <table className="w-full">
        <thead className="border-b text-left"><tr><th className="py-1">Item</th><th>Qty</th><th className="text-right">Price</th></tr></thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id} className="border-b"><td className="py-1">{i.name} {[i.size, i.color].filter(Boolean).join("/")}</td><td>{i.quantity}</td><td className="text-right">{money(i.price * i.quantity)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 space-y-1 text-right">
        <p>Subtotal: {money(o.subtotal)}</p>
        {o.discount > 0 && <p>Discount: -{money(o.discount)}</p>}
        <p>Delivery: {money(o.shipping)}</p>
        <p className="text-base font-bold">Total ({o.paymentMethod}): {money(o.total)}</p>
      </div>
      <PrintButton />
    </div>
  );
}
