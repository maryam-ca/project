"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/app/actions/auth";

export function ActionForm({
  action,
  children,
  submitLabel,
  className = "space-y-4",
  buttonClass = "w-full rounded bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:opacity-60",
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel: string;
  className?: string;
  buttonClass?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form
      // Submit via onSubmit (not action=) so React 19 does not reset the fields after a validation error
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className={className}
    >
      {children}
      {state?.error && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={buttonClass}>
        {pending ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}

export const inputCls = "w-full rounded border px-3 py-2 text-sm outline-none focus:border-rose-500";
