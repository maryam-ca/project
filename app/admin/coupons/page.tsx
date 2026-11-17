import { db } from "@/lib/db";
import { ActionForm, inputCls } from "@/components/ActionForm";
import { createCouponAction, toggleCouponAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function Coupons() {
  const coupons = await db.coupon.findMany({ orderBy: { id: "desc" } });
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <ActionForm action={createCouponAction} submitLabel="Coupon Banayein" className="grid max-w-xl gap-3 sm:grid-cols-4" buttonClass="rounded bg-rose-600 py-2 text-white sm:col-span-4">
        <input name="code" placeholder="CODE" className={inputCls} required />
        <select name="type" className={inputCls}><option value="PERCENT">Percent %</option><option value="FIXED">Fixed Rs.</option></select>
        <input name="value" type="number" min={1} placeholder="Value" className={inputCls} required />
        <input name="minOrder" type="number" min={0} placeholder="Min order" className={inputCls} />
      </ActionForm>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Min order</th><th className="p-3">Used</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.type === "PERCENT" ? `${c.value}%` : `Rs. ${c.value}`}</td>
                <td className="p-3">Rs. {c.minOrder}</td>
                <td className="p-3">{c.used}</td>
                <td className="p-3">
                  <form action={toggleCouponAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={c.active ? "text-green-600" : "text-gray-400"}>{c.active ? "Active" : "Disabled"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
