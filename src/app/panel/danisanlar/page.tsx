"use client";

import { useState } from "react";
import Link from "next/link";
import { measurementsOf, useDB } from "@/lib/store";
import { displayPhone, fmtShort } from "@/lib/utils";
import { Skeleton } from "@/components/ui";

export default function Danisanlar() {
  const db = useDB();
  const [q, setQ] = useState("");
  if (!db) return <Skeleton rows={4} />;

  const term = q.trim().toLocaleLowerCase("tr");
  const digits = term.replace(/\D/g, "");
  const rows = db.clients
    .filter((c) => !term || c.name.toLocaleLowerCase("tr").includes(term) || (digits && c.phone.includes(digits)))
    .map((c) => {
      const ms = measurementsOf(db, c.id);
      const appts = db.appointments.filter((a) => a.clientId === c.id && a.status !== "iptal").map((a) => a.startsAt).sort();
      return {
        ...c,
        lastAppt: appts.at(-1),
        first: ms[0]?.weight,
        last: ms.at(-1)?.weight,
      };
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Danışanlar</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="İsim veya telefon ara…"
          className="input sm:w-72"
          aria-label="Danışan ara"
        />
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">Aramanızla eşleşen danışan yok.</div>
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
                const diff = c.last != null && c.first != null ? c.last - c.first : null;
                return (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <Link href={`/panel/danisanlar/${c.id}`} className="font-bold hover:underline">{c.name}</Link>
                      <div className="text-stone-500">{displayPhone(c.phone)}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{c.goal ?? "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{c.lastAppt ? fmtShort(c.lastAppt) : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{c.last != null ? `${c.last} kg` : "—"}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${diff == null || Math.abs(diff) < 0.05 ? "text-stone-400" : diff < 0 ? "text-brand-600" : "text-amber-600"}`}>
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
