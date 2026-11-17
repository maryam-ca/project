import Link from "next/link";
import { ActionForm, inputCls } from "@/components/ActionForm";
import { registerAction } from "@/app/actions/auth";

export const metadata = { title: "Create Account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Account Banayein</h1>
      <ActionForm action={registerAction} submitLabel="Register">
        {next && <input type="hidden" name="next" value={next} />}
        <input name="name" placeholder="Poora naam" autoComplete="name" className={inputCls} required />
        <input name="email" type="email" placeholder="Email" autoComplete="email" className={inputCls} required />
        <input name="phone" placeholder="Mobile (03XXXXXXXXX) - optional" autoComplete="tel" className={inputCls} />
        <input name="password" type="password" placeholder="Password (8+ characters, letter + number)" autoComplete="new-password" className={inputCls} required />
      </ActionForm>
      <p className="mt-4 text-sm text-gray-600">
        Pehle se account hai? <Link href="/login" className="text-rose-600 underline">Login</Link>
      </p>
    </div>
  );
}
