import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Salam, {user.name}</h1>
        <p className="text-sm text-gray-600">{user.email}{user.phone && ` · ${user.phone}`}</p>
      </div>
      <h2 className="text-lg font-semibold">Meray Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">Abhi tak koi order nahi. <Link href="/products" className="text-rose-600 underline">Shopping karein</Link></p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left"><tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3"><Link href={`/order/${o.id}`} className="text-rose-600 underline">#{o.id}</Link></td>
                  <td className="p-3">{o.createdAt.toLocaleDateString("en-GB")}</td>
                  <td className="p-3">{o.status.replace("_", " ")}</td>
                  <td className="p-3 text-right">{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
