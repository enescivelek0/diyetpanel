import Link from "next/link";
import { notFound } from "next/navigation";
import { query, type Row } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { deleteMeasurement } from "@/lib/actions";
import { STATUS, displayPhone, fmtShort, fmtTime, todayIstanbul, waLink } from "@/lib/utils";
import MeasurementForm from "./measurement-form";

export const dynamic = "force-dynamic";

export default async function DanisanDetay({ params }: PageProps<"/panel/danisanlar/[id]">) {
  await requireAuth();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [[client], appts, ms] = await Promise.all([
    query(`SELECT * FROM clients WHERE id = $1`, [id]),
    query(`SELECT id, starts_at, status, note FROM appointments WHERE client_id = $1 ORDER BY starts_at DESC`, [id]),
    query(
      `SELECT id, to_char(measured_at, 'YYYY-MM-DD') AS d, weight, waist, note
       FROM measurements WHERE client_id = $1 ORDER BY measured_at ASC, id ASC`,
      [id],
    ),
  ]);
  if (!client) notFound();

  const first = ms[0] ? Number(ms[0].weight) : null;
  const last = ms.length ? Number(ms[ms.length - 1].weight) : null;
  const diff = first != null && last != null ? last - first : null;

  return (
    <div className="space-y-6">
      <Link href="/panel/danisanlar" className="text-sm font-semibold text-stone-500 hover:text-stone-800">← Danışanlar</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{client.name}</h1>
          <p className="mt-1 text-stone-500">
            {displayPhone(client.phone)}
            {client.email && ` · ${client.email}`}
            {client.goal && ` · Hedef: ${client.goal}`}
          </p>
        </div>
        <a href={waLink(client.phone, `Merhaba ${client.name.split(" ")[0]}, `)} target="_blank" rel="noreferrer" className="btn-ghost">
          WhatsApp&apos;tan yaz
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Başlangıç" value={first != null ? `${first} kg` : "—"} />
        <Stat label="Güncel" value={last != null ? `${last} kg` : "—"} />
        <Stat
          label="Değişim"
          value={diff != null ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg` : "—"}
          cls={diff == null || diff === 0 ? "" : diff < 0 ? "text-brand-600" : "text-amber-600"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-bold">Kilo grafiği</h2>
          <WeightChart data={ms} />
          {ms.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-stone-500">
                  <tr>
                    <th className="py-2 font-semibold">Tarih</th>
                    <th className="py-2 text-right font-semibold">Kilo</th>
                    <th className="py-2 text-right font-semibold">Bel</th>
                    <th className="py-2 pl-4 font-semibold">Not</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[...ms].reverse().map((m) => (
                    <tr key={m.id}>
                      <td className="py-2">{fmtShort(`${m.d}T12:00:00+03:00`)}</td>
                      <td className="py-2 text-right font-semibold tabular-nums">{Number(m.weight)} kg</td>
                      <td className="py-2 text-right tabular-nums">{m.waist != null ? `${Number(m.waist)} cm` : "—"}</td>
                      <td className="py-2 pl-4 text-stone-600">{m.note ?? ""}</td>
                      <td className="py-2 text-right">
                        <form action={deleteMeasurement}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="clientId" value={id} />
                          <button className="text-xs text-stone-400 hover:text-red-600" aria-label="Ölçümü sil">Sil</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-bold">Yeni ölçüm</h2>
            <MeasurementForm clientId={id} today={todayIstanbul()} />
          </section>

          <section className="card p-5">
            <h2 className="font-bold">Randevu geçmişi</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {appts.length === 0 && <li className="text-stone-500">Randevu yok.</li>}
              {appts.map((a) => {
                const s = STATUS[a.status] ?? STATUS.beklemede;
                return (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span>{fmtShort(a.starts_at)} · {fmtTime(a.starts_at)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, cls = "" }: { label: string; value: string; cls?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tabular-nums sm:text-2xl ${cls}`}>{value}</p>
    </div>
  );
}

function WeightChart({ data }: { data: Row[] }) {
  if (data.length < 2) {
    return (
      <p className="mt-3 rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
        Grafik için en az 2 ölçüm ekleyin.
      </p>
    );
  }
  const W = 640, H = 220, P = { l: 40, r: 16, t: 16, b: 28 };
  const ys = data.map((d) => Number(d.weight));
  const min = Math.floor(Math.min(...ys) - 1);
  const max = Math.ceil(Math.max(...ys) + 1);
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / (data.length - 1);
  const y = (v: number) => P.t + ((max - v) * (H - P.t - P.b)) / (max - min || 1);
  const path = ys.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(ys.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const ticks = [min, (min + max) / 2, max];
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Kilo değişim grafiği">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#e7e5e4" />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#78716c">{t.toFixed(0)}</text>
        </g>
      ))}
      <path d={area} fill="#2f9e63" opacity="0.1" />
      <path d={path} fill="none" stroke="#217f4e" strokeWidth="2.5" strokeLinejoin="round" />
      {ys.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="4" fill="#fff" stroke="#217f4e" strokeWidth="2">
            <title>{`${data[i].d}: ${v} kg`}</title>
          </circle>
          {i % labelEvery === 0 || i === ys.length - 1 ? (
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#78716c">
              {data[i].d.slice(8, 10)}.{data[i].d.slice(5, 7)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
