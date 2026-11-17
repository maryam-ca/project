import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-rose-600">ShopEasy</p>
          <p className="mt-2 text-gray-600">Pakistan bhar mein Cash on Delivery. 7 din easy return.</p>
        </div>
        <div>
          <p className="font-semibold">Help</p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li><Link href="/track">Track Order</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/about">About Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Policies</p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
            <li><Link href="/returns">Return &amp; Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} ShopEasy. All rights reserved.</p>
    </footer>
  );
}
