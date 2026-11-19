import Link from "next/link";
import { query } from "@/lib/db";
import { BRAND, bookableDates, buildSlots, fmtDate, slotToDate } from "@/lib/utils";
import { Logo } from "@/components/ui";
import BookingForm from "./booking-form";

export const dynamic = "force-dynamic";
export const metadata = { title: `Online Randevu — ${BRAND}` };

export default async function RandevuPage({ searchParams }: PageProps<"/randevu">) {
  const dates = bookableDates();
  const sp = await searchParams;
  const selected = typeof sp.tarih === "string" && dates.includes(sp.tarih) ? sp.tarih : dates[0];

  const dayStart = slotToDate(selected, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  const taken = await query(
    `SELECT starts_at FROM appointments WHERE status <> 'iptal' AND starts_at >= $1 AND starts_at < $2`,
    [dayStart.toISOString(), dayEnd.toISOString()],
  );
  const slots = buildSlots(selected, new Set(taken.map((r) => new Date(r.starts_at).getTime())));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Logo />
      <div className="mt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{BRAND}</h1>
        <p className="mt-1 text-stone-600">Beslenme danışmanlığı · Online ve yüz yüze görüşme</p>
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-bold">1. Gün seçin</h2>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2">
          {dates.map((d) => {
            const active = d === selected;
            return (
              <Link
                key={d}
                href={`/randevu?tarih=${d}`}
                scroll={false}
                className={`flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 text-sm transition ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-stone-200 bg-white hover:border-brand-500"
                }`}
              >
                <span className="text-xs opacity-80">{fmtDate(slotToDate(d, "12:00"), { weekday: "short" })}</span>
                <span className="text-lg font-bold leading-tight">{fmtDate(slotToDate(d, "12:00"), { day: "numeric" })}</span>
                <span className="text-xs opacity-80">{fmtDate(slotToDate(d, "12:00"), { month: "short" })}</span>
              </Link>
            );
          })}
        </div>

        <BookingForm key={selected} date={selected} slots={slots} />
      </section>
      <p className="mt-6 text-center text-xs text-stone-500">
        Randevunuz diyetisyen onayından sonra WhatsApp üzerinden teyit edilir.
      </p>
    </div>
  );
}
