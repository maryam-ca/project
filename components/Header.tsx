import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { CartBadge } from "./CartBadge";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-rose-600">
          ShopEasy
        </Link>
        <form action="/products" className="order-3 flex w-full flex-1 sm:order-none sm:w-auto">
          <input
            name="q"
            placeholder="Search products..."
            className="w-full rounded-l border px-3 py-2 text-sm outline-none focus:border-rose-500"
          />
          <button className="rounded-r bg-rose-600 px-4 text-sm text-white hover:bg-rose-700">Search</button>
        </form>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:text-rose-600">
            Shop
          </Link>
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="font-medium text-rose-600">
                  Admin
                </Link>
              )}
              <Link href="/account" className="hover:text-rose-600">
                {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button className="text-gray-500 hover:text-rose-600">Logout</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-rose-600">
              Login
            </Link>
          )}
          <CartBadge />
        </nav>
      </div>
    </header>
  );
}
