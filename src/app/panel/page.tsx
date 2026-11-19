"use client";

import { useState } from "react";
import Link from "next/link";
import { setStatus, useDB, type Appointment, type Client, type Status } from "@/lib/store";
import { confirmText, displayPhone, fmtDay, fmtTime, reminderText, slotToDate, todayIstanbul, waLink } from "@/lib/utils";
import { Skeleton, StatusBadge, WaIcon } from "@/components/ui";

const VIEWS = { yaklasan: "Yaklaşan", gecmis: "Geçmiş", tumu: "Tümü" } as const;
type View = keyof typeof VIEWS;
type Row = Appointment & { client: Client };

export default function PanelHome() {
  const db = useDB();
  const [view, setView] = useState<View>("yaklasan");
  const [error, setError] = useState<string>();

  if (!db) return <Skeleton rows={4} />;

  const todayStart = slotToDate(todayIstanbul(), "00:00").getTime();
  const todayEnd = todayStart + 86400000;
  const weekEnd = todayStart + 7 * 86400000;
  const t = (a: Appointment) => new Date(a.startsAt).getTime();
  const active = db.appointments.filter((a) => a.status !== "iptal");

  const stats = [
    { l: "Bugün", v: active.filter((a) => t(a) >= todayStart && t(a) < todayEnd).length },
    { l: "Bu hafta", v: active.filter((a) => t(a) >= todayStart && t(a) < weekEnd).length },
    { l: "Onay bekleyen", v: db.appointments.filter((a) => a.status === "beklemede" && t(a) >= todayStart).length, hl: true },
    { l: "Toplam danışan", v: db.clients.length },
  ];

  const clients = new Map(db.clients.map((c) => [c.id, c]));
  const rows: Row[] = db.appointments
    .filter((a) => (view === "yaklasan" ? t(a) >= todayStart : view === "gecmis" ? t(a) < todayStart : true))
    .sort((a, b) => (view === "yaklasan" ? t(a) - t(b) : t(b) - t(a)))
    .map((a) => ({ ...a, client: clients.get(a.clientId)! }))
    .filter((a) => a.client);

  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = fmtDay(r.startsAt);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }

  const change = (id: number, s: Status) => setError(setStatus(id, s).error);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((c) => (
          <div key={c.l} className={`card p-4 ${c.hl && c.v > 0 ? "border-amber-300 bg-amber-50" : ""}`}>
            <p className="text-sm text-stone-500">{c.l}</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Randevular</h1>
        <div className="flex rounded-xl border border-stone-200 bg-white p-1 text-sm font-semibold" role="tablist">
          {(Object.keys(VIEWS) as View[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={view === k}
              onClick={() => setView(k)}
              className={`rounded-lg px-3 py-1.5 ${view === k ? "bg-brand-600 text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {VIEWS[k]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {rows.length === 0 && (
        <div className="card p-10 text-center text-stone-500">
          Bu görünümde randevu yok.{" "}
          <Link href="/randevu" className="font-semibold text-brand-700 underline">Randevu sayfasından</Link> yeni bir randevu oluşturabilirsiniz.
        </div>
      )}

      {[...groups.entries()].map(([day, items]) => (
        <section key={day}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">{day}</h2>
          <ul className="card divide-y divide-stone-100">
            {items.map((a) => {
              const isActive = a.status === "beklemede" || a.status === "onaylandi";
              return (
                <li key={a.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                  <div className="w-16 shrink-0 text-xl font-extrabold tabular-nums text-brand-700">{fmtTime(a.startsAt)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/panel/danisanlar/${a.clientId}`} className="font-bold hover:underline">{a.client.name}</Link>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-sm text-stone-500">
                      {displayPhone(a.client.phone)}
                      {a.client.goal && ` · ${a.client.goal}`}
                    </p>
                    {a.note && <p className="mt-1 text-sm text-stone-600">“{a.note}”</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "beklemede" && (
                      <>
                        <button onClick={() => change(a.id, "onaylandi")} className="btn-primary">Onayla</button>
                        <a href={waLink(a.client.phone, confirmText(a.client.name, a.startsAt))} target="_blank" rel="noreferrer" className="btn-ghost">
                          <WaIcon /> Onay gönder
                        </a>
                      </>
                    )}
                    {a.status === "onaylandi" && (
                      <>
                        <a href={waLink(a.client.phone, reminderText(a.client.name, a.startsAt))} target="_blank" rel="noreferrer" className="btn-ghost">
                          <WaIcon /> Hatırlat
                        </a>
                        <button onClick={() => change(a.id, "tamamlandi")} className="btn-ghost">Tamamlandı</button>
                      </>
                    )}
                    <button
                      onClick={() => change(a.id, isActive ? "iptal" : "beklemede")}
                      className="btn text-stone-500 hover:bg-stone-100"
                    >
                      {isActive ? "İptal" : "Geri al"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
