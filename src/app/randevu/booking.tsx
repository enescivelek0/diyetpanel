"use client";

import { useState } from "react";
import Link from "next/link";
import { bookAppointment, useDB, type Result } from "@/lib/store";
import { BRAND, bookableDates, buildSlots, fmtDate, fmtDay, fmtTime, slotToDate } from "@/lib/utils";
import { Alert, Skeleton } from "@/components/ui";

export default function Booking() {
  const db = useDB();
  const [dates] = useState(bookableDates);
  const [date, setDate] = useState(dates[0]);
  const [result, setResult] = useState<Result>();
  const [done, setDone] = useState<string | null>(null);

  if (!db) return <div className="mt-6"><Skeleton rows={2} /></div>;

  if (done) {
    return (
      <div className="card mt-6 p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold">Randevu talebiniz alındı</h2>
        <p className="mt-3 text-lg font-semibold text-brand-700">{fmtDay(done)} · {fmtTime(done)}</p>
        <p className="mt-3 text-stone-600">{BRAND} randevunuzu onayladığında WhatsApp üzerinden bilgilendirileceksiniz.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/panel" className="btn-primary">Diyetisyen panelinde gör</Link>
          <button onClick={() => { setDone(null); setResult(undefined); }} className="btn-ghost">Yeni randevu</button>
        </div>
      </div>
    );
  }

  const taken = new Set(
    db.appointments.filter((a) => a.status !== "iptal").map((a) => new Date(a.startsAt).getTime()),
  );
  const slots = buildSlots(date, taken);
  const anyAvailable = slots.some((s) => s.available);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = bookAppointment(f);
    setResult(r);
    if (r.id) setDone(slotToDate(String(f.get("date")), String(f.get("time"))).toISOString());
  }

  return (
    <section className="card mt-6 p-5 sm:p-6">
      <h2 className="font-bold">1. Gün seçin</h2>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2">
        {dates.map((d) => {
          const active = d === date;
          const noon = slotToDate(d, "12:00");
          return (
            <button
              type="button"
              key={d}
              onClick={() => { setDate(d); setResult(undefined); }}
              aria-pressed={active}
              className={`flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 text-sm transition ${
                active ? "border-brand-600 bg-brand-600 text-white" : "border-stone-200 bg-white hover:border-brand-500"
              }`}
            >
              <span className="text-xs opacity-80">{fmtDate(noon, { weekday: "short" })}</span>
              <span className="text-lg font-bold leading-tight">{fmtDate(noon, { day: "numeric" })}</span>
              <span className="text-xs opacity-80">{fmtDate(noon, { month: "short" })}</span>
            </button>
          );
        })}
      </div>

      <form key={date} onSubmit={onSubmit} className="mt-6 space-y-6">
        <input type="hidden" name="date" value={date} />
        <div>
          <h2 className="font-bold">2. Saat seçin</h2>
          {anyAvailable ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {slots.map((s) => (
                <label key={s.time} className={s.available ? "cursor-pointer" : "cursor-not-allowed"}>
                  <input type="radio" name="time" value={s.time} disabled={!s.available} required className="peer sr-only" />
                  <span className="block rounded-xl border border-stone-200 py-2 text-center text-sm font-semibold transition hover:border-brand-500 peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-disabled:bg-stone-100 peer-disabled:text-stone-400 peer-disabled:line-through peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100">
                    {s.time}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
              Bu gün için boş saat kalmadı, lütfen başka bir gün seçin.
            </p>
          )}
        </div>

        <div>
          <h2 className="font-bold">3. Bilgileriniz</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="name" required minLength={3} placeholder="Ad Soyad" className="input" autoComplete="name" />
            <input name="phone" required type="tel" placeholder="Cep telefonu (05xx…)" className="input" autoComplete="tel" />
            <input name="email" type="email" placeholder="E-posta (isteğe bağlı)" className="input" autoComplete="email" />
            <select name="goal" className="input" defaultValue="" aria-label="Hedefiniz">
              <option value="">Hedefiniz (isteğe bağlı)</option>
              <option>Kilo vermek</option>
              <option>Kilo almak</option>
              <option>Sağlıklı beslenme</option>
              <option>Sporcu beslenmesi</option>
              <option>Hamilelik / emzirme</option>
            </select>
            <textarea name="note" rows={3} maxLength={500} placeholder="Eklemek istediğiniz bir not (isteğe bağlı)" className="input sm:col-span-2" />
          </div>
          <label className="mt-3 flex items-start gap-2 text-sm text-stone-600">
            <input type="checkbox" name="kvkk" required className="mt-0.5 size-4 accent-brand-600" />
            <span>
              <Link href="/kvkk" target="_blank" className="font-semibold text-brand-700 underline">KVKK Aydınlatma Metni</Link>
              &apos;ni okudum; randevu ve iletişim amacıyla bilgilerimin işlenmesine onay veriyorum.
            </span>
          </label>
        </div>

        <Alert state={result} />
        <button type="submit" className="btn-primary w-full py-3 text-base">Randevuyu oluştur</button>
      </form>
    </section>
  );
}
