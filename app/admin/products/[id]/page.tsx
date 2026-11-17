import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ActionForm, inputCls } from "@/components/ActionForm";
import { saveProductAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function ProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [p, categories] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id: Number(id) || 0 } }),
    db.category.findMany(),
  ]);
  if (!isNew && !p) notFound();

  const label = "mb-1 block text-xs font-medium text-gray-600";
  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">{isNew ? "Naya Product" : "Product Edit"}</h1>
      <ActionForm action={saveProductAction} submitLabel="Save">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div><label className={label}>Name</label><input name="name" defaultValue={p?.name} className={inputCls} required /></div>
        <div><label className={label}>Description</label><textarea name="description" rows={4} defaultValue={p?.description} className={inputCls} required /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={label}>Price (Rs.)</label><input name="price" type="number" min={1} defaultValue={p?.price} className={inputCls} required /></div>
          <div><label className={label}>Discount price</label><input name="discountPrice" type="number" min={0} defaultValue={p?.discountPrice ?? ""} className={inputCls} /></div>
          <div><label className={label}>Stock</label><input name="stock" type="number" min={0} defaultValue={p?.stock ?? 0} className={inputCls} required /></div>
        </div>
        <div><label className={label}>Image URL</label><input name="image" defaultValue={p?.image} placeholder="https://..." className={inputCls} required /></div>
        <div>
          <label className={label}>Category</label>
          <select name="categoryId" defaultValue={p?.categoryId} className={inputCls} required>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label}>Sizes (comma separated)</label><input name="sizes" defaultValue={p?.sizes.join(", ") ?? ""} placeholder="S, M, L" className={inputCls} /></div>
          <div><label className={label}>Colors (comma separated)</label><input name="colors" defaultValue={p?.colors.join(", ") ?? ""} placeholder="Black, White" className={inputCls} /></div>
        </div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} /> Active</label>
        </div>
      </ActionForm>
    </div>
  );
}
