import Link from "next/link";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { displayPhone, fmtShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Danisanlar({ searchParams }: PageProps<"/panel/danisanlar">) {
  await requireAuth();
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim() : "";

  const rows = await query(
    `SELECT c.id, c.name, c.phone, c.goal, c.created_at,
       (SELECT max(starts_at) FROM appointments a WHERE a.client_id = c.id AND a.status <> 'iptal') AS last_appt,
       (SELECT weight FROM measurements m WHERE m.client_id = c.id ORDER BY measured_at DESC, id DESC LIMIT 1) AS last_weight,
       (SELECT weight FROM measurements m WHERE m.client_id = c.id ORDER BY measured_at ASC, id ASC LIMIT 1) AS first_weight
     FROM clients c
     WHERE $1 = '' OR c.name ILIKE '%' || $1 || '%' OR c.phone LIKE '%' || $1 || '%'
     ORDER BY c.created_at DESC LIMIT 200`,
    [term],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Danışanlar</h1>
        <form className="w-full sm:w-72">
          <input name="q" defaultValue={term} placeholder="İsim veya telefon ara…" className="input" />
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          {term ? "Aramanızla eşleşen danışan yok." : "Danışanlar, randevu aldıklarında burada otomatik olarak görünür."}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Danışan</th>
                <th className="px-4 py-3 font-semibold">Hedef</th>
                <th className="px-4 py-3 font-semibold">Son randevu</th>
                <th className="px-4 py-3 text-right font-semibold">Güncel kilo</th>
                <th className="px-4 py-3 text-right font-semibold">Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((c) => {
                const diff = c.last_weight != null ? Number(c.last_weight) - Number(c.first_weight) : null;
                return (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <Link href={`/panel/danisanlar/${c.id}`} className="font-bold hover:underline">{c.name}</Link>
                      <div className="text-stone-500">{displayPhone(c.phone)}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{c.goal ?? "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{c.last_appt ? fmtShort(c.last_appt) : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {c.last_weight != null ? `${Number(c.last_weight)} kg` : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${diff == null || diff === 0 ? "text-stone-400" : diff < 0 ? "text-brand-600" : "text-amber-600"}`}>
                      {diff == null ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
