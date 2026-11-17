import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin");
  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <nav className="flex gap-3 text-sm md:flex-col">
        {[["/admin", "Dashboard"], ["/admin/products", "Products"], ["/admin/orders", "Orders"], ["/admin/coupons", "Coupons"]].map(([h, l]) => (
          <Link key={h} href={h} className="rounded px-3 py-2 hover:bg-rose-50 hover:text-rose-600">{l}</Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
