import Link from "next/link";
import { ActionForm, inputCls } from "@/components/ActionForm";
import { loginAction } from "@/app/actions/auth";

export const metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <ActionForm action={loginAction} submitLabel="Login">
        {next && <input type="hidden" name="next" value={next} />}
        <input name="email" type="email" placeholder="Email" autoComplete="email" className={inputCls} required />
        <input name="password" type="password" placeholder="Password" autoComplete="current-password" className={inputCls} required />
      </ActionForm>
      <p className="mt-4 text-sm text-gray-600">
        Naya account? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-rose-600 underline">Register karein</Link>
      </p>
    </div>
  );
}
