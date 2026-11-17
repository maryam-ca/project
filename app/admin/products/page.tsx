import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";
import { deleteProductAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await db.product.findMany({ include: { category: true }, orderBy: { id: "desc" } });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="rounded bg-rose-600 px-4 py-2 text-sm text-white">+ Naya Product</Link>
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{money(p.discountPrice ?? p.price)}</td>
                <td className={`p-3 ${p.stock <= 5 ? "font-bold text-red-600" : ""}`}>{p.stock}</td>
                <td className="p-3">{p.active ? "Active" : "Hidden"}</td>
                <td className="flex gap-3 p-3">
                  <Link href={`/admin/products/${p.id}`} className="text-rose-600 underline">Edit</Link>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-gray-500 hover:text-red-600">Delete</button>
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
