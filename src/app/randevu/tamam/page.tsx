import Link from "next/link";
import { query } from "@/lib/db";
import { BRAND, fmtDay, fmtTime } from "@/lib/utils";
import { Logo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Tamam({ searchParams }: PageProps<"/randevu/tamam">) {
  const { id } = await searchParams;
  const rows = id
    ? await query(`SELECT starts_at FROM appointments WHERE id = $1`, [Number(id)])
    : [];
  const a = rows[0];

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <Logo />
      <div className="card mt-10 p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">Randevu talebiniz alındı</h1>
        {a && (
          <p className="mt-3 text-lg font-semibold text-brand-700">
            {fmtDay(a.starts_at)} · {fmtTime(a.starts_at)}
          </p>
        )}
        <p className="mt-3 text-stone-600">
          {BRAND} randevunuzu onayladığında WhatsApp üzerinden bilgilendirileceksiniz.
        </p>
        <Link href="/randevu" className="btn-ghost mt-6">Yeni randevu</Link>
      </div>
    </div>
  );
}
