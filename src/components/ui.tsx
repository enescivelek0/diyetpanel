"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";

export function SubmitButton({
  children,
  pending,
  className = "btn-primary",
}: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
}) {
  const { pending: isPending } = useFormStatus();
  return (
    <button type="submit" disabled={isPending} className={className}>
      {isPending ? (pending ?? "Kaydediliyor…") : children}
    </button>
  );
}

export function Alert({ state }: { state?: { error?: string; ok?: string } }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-3.5 py-2.5 text-sm ${
        state.error ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-700"
      }`}
    >
      {state.error ?? state.ok}
    </p>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold tracking-tight text-brand-900">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </span>
      DiyetPanel
    </Link>
  );
}
