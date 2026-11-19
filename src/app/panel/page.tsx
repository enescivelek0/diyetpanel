import Link from "next/link";
import { query, type Row } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { setStatus } from "@/lib/actions";
import {
  STATUS,
  confirmText,
  displayPhone,
  fmtDay,
  fmtTime,
  reminderText,
  slotToDate,
  todayIstanbul,
  waLink,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const VIEWS = { yaklasan: "Yaklaşan", gecmis: "Geçmiş", tumu: "Tümü" } as const;

export default async function PanelHome({ searchParams }: PageProps<"/panel">) {
  await requireAuth();
  const sp = await searchParams;
  const view = (typeof sp.g === "string" && sp.g in VIEWS ? sp.g : "yaklasan") as keyof typeof VIEWS;

  const todayStart = slotToDate(todayIstanbul(), "00:00");
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const weekEnd = new Date(todayStart.getTime() + 7 * 86400000);

  const where =
    view === "yaklasan" ? `a.starts_at >= $1` : view === "gecmis" ? `a.starts_at < $1` : `$1::timestamptz IS NOT NULL`;
  const order = view === "yaklasan" ? "ASC" : "DESC";

  const [rows, [stats]] = await Promise.all([
    query(
      `SELECT a.id, a.starts_at, a.status, a.note, c.id AS client_id, c.name, c.phone, c.goal
       FROM appointments a JOIN clients c ON c.id = a.client_id
       WHERE ${where} ORDER BY a.starts_at ${order} LIMIT 100`,
      [todayStart.toISOString()],
    ),
    query(
      `SELECT
        (SELECT count(*) FROM appointments WHERE status <> 'iptal' AND starts_at >= $1 AND starts_at < $2) AS today,
        (SELECT count(*) FROM appointments WHERE status <> 'iptal' AND starts_at >= $1 AND starts_at < $3) AS week,
        (SELECT count(*) FROM appointments WHERE status = 'beklemede' AND starts_at >= $1) AS pending,
        (SELECT count(*) FROM clients) AS clients`,
      [todayStart.toISOString(), todayEnd.toISOString(), weekEnd.toISOString()],
    ),
  ]);

  // Güne göre grupla
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = fmtDay(r.starts_at);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }

  const cards = [
    { l: "Bugün", v: stats.today },
    { l: "Bu hafta", v: stats.week },
    { l: "Onay bekleyen", v: stats.pending, hl: Number(stats.pending) > 0 },
    { l: "Toplam danışan", v: stats.clients },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.l} className={`card p-4 ${c.hl ? "border-amber-300 bg-amber-50" : ""}`}>
            <p className="text-sm text-stone-500">{c.l}</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">{Number(c.v)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Randevular</h1>
        <div className="flex rounded-xl border border-stone-200 bg-white p-1 text-sm font-semibold">
          {Object.entries(VIEWS).map(([k, l]) => (
            <Link
              key={k}
              href={`/panel?g=${k}`}
              className={`rounded-lg px-3 py-1.5 ${view === k ? "bg-brand-600 text-white" : "text-stone-600 hover:bg-stone-100"}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 && (
        <div className="card p-10 text-center text-stone-500">
          Henüz randevu yok. <Link href="/randevu" className="font-semibold text-brand-700 underline">Randevu sayfanızı</Link>{" "}
          danışanlarınızla paylaşın.
        </div>
      )}

      {[...groups.entries()].map(([day, items]) => (
        <section key={day}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">{day}</h2>
          <ul className="card divide-y divide-stone-100">
            {items.map((a) => {
              const s = STATUS[a.status] ?? STATUS.beklemede;
              const isActive = a.status === "beklemede" || a.status === "onaylandi";
              return (
                <li key={a.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                  <div className="w-16 shrink-0 text-xl font-extrabold tabular-nums text-brand-700">{fmtTime(a.starts_at)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/panel/danisanlar/${a.client_id}`} className="font-bold hover:underline">{a.name}</Link>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {displayPhone(a.phone)}
                      {a.goal && ` · ${a.goal}`}
                    </p>
                    {a.note && <p className="mt-1 text-sm text-stone-600">“{a.note}”</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "beklemede" && (
                      <>
                        <StatusBtn id={a.id} status="onaylandi" label="Onayla" primary />
                        <a href={waLink(a.phone, confirmText(a.name, a.starts_at))} target="_blank" rel="noreferrer" className="btn-ghost">
                          <WaIcon /> Onay gönder
                        </a>
                      </>
                    )}
                    {a.status === "onaylandi" && (
                      <>
                        <a href={waLink(a.phone, reminderText(a.name, a.starts_at))} target="_blank" rel="noreferrer" className="btn-ghost">
                          <WaIcon /> Hatırlat
                        </a>
                        <StatusBtn id={a.id} status="tamamlandi" label="Tamamlandı" />
                      </>
                    )}
                    {isActive && <StatusBtn id={a.id} status="iptal" label="İptal" muted />}
                    {!isActive && <StatusBtn id={a.id} status="beklemede" label="Geri al" muted />}
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

function StatusBtn({ id, status, label, primary, muted }: { id: number; status: string; label: string; primary?: boolean; muted?: boolean }) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={primary ? "btn-primary" : muted ? "btn text-stone-500 hover:bg-stone-100" : "btn-ghost"}>{label}</button>
    </form>
  );
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-[#25D366]" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" />
    </svg>
  );
}
