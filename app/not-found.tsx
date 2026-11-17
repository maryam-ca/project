import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-bold text-rose-600">404</p>
      <p className="mt-2 text-lg">Ye page nahi mila.</p>
      <Link href="/" className="mt-6 inline-block rounded bg-rose-600 px-6 py-2 text-white">Home par jayein</Link>
    </div>
  );
}
