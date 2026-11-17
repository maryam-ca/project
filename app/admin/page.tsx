import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [orders, revenue, customers, products, lowStock, recent] = await Promise.all([
    db.order.count(),
    db.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ["CANCELLED"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count({ where: { active: true } }),
    db.product.findMany({ where: { active: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 10 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const pending = await db.order.count({ where: { status: "PENDING" } });

  const stats = [
    ["Total Orders", orders],
    ["Pending Orders", pending],
    ["Revenue", money(revenue._sum.total ?? 0)],
    ["Customers", customers],
    ["Active Products", products],
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([l, v]) => (
          <div key={l as string} className="rounded-lg border p-4">
            <p className="text-xs text-gray-500">{l}</p>
            <p className="mt-1 text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-2 font-semibold text-amber-700">Low Stock Alerts</h2>
        {lowStock.length === 0 ? <p className="text-sm text-gray-500">Sab theek hai.</p> : (
          <ul className="space-y-1 text-sm">
            {lowStock.map((p) => (
              <li key={p.id}><Link href={`/admin/products/${p.id}`} className="text-rose-600 underline">{p.name}</Link> - {p.stock} bacha hai</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Recent Orders</h2>
        <ul className="space-y-1 text-sm">
          {recent.map((o) => (
            <li key={o.id}>#{o.id} · {o.customerName} · {money(o.total)} · {o.status}</li>
          ))}
        </ul>
        <Link href="/admin/orders" className="mt-2 inline-block text-sm text-rose-600 underline">Sab orders</Link>
      </section>
    </div>
  );
}
