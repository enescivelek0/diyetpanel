"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUniqueViolation, query } from "./db";
import { checkPassword, endSession, requireAuth, startSession } from "./auth";
import { bookableDates, normalizePhone, SLOT_HOURS, slotToDate, todayIstanbul } from "./utils";

export type FormState = { error?: string; ok?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// ---------- Herkese açık: randevu alma ----------
export async function bookAppointment(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name");
  const phone = normalizePhone(str(f, "phone"));
  const email = str(f, "email") || null;
  const goal = str(f, "goal") || null;
  const note = str(f, "note").slice(0, 500) || null;
  const date = str(f, "date");
  const time = str(f, "time");

  if (name.length < 3) return { error: "Lütfen adınızı ve soyadınızı yazın." };
  if (!phone) return { error: "Geçerli bir cep telefonu girin (05xx xxx xx xx)." };
  if (!bookableDates().includes(date) || !SLOT_HOURS.includes(time))
    return { error: "Lütfen geçerli bir gün ve saat seçin." };
  const startsAt = slotToDate(date, time);
  if (startsAt.getTime() < Date.now()) return { error: "Geçmiş bir saat seçilemez." };
  if (f.get("kvkk") !== "on") return { error: "Devam etmek için KVKK aydınlatma metnini onaylayın." };

  const [client] = await query(
    `INSERT INTO clients (name, phone, email, goal) VALUES ($1, $2, $3, $4)
     ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name,
       email = COALESCE(EXCLUDED.email, clients.email), goal = COALESCE(EXCLUDED.goal, clients.goal)
     RETURNING id`,
    [name, phone, email, goal],
  );

  let id: number;
  try {
    const [a] = await query(
      `INSERT INTO appointments (client_id, starts_at, note) VALUES ($1, $2, $3) RETURNING id`,
      [client.id, startsAt.toISOString(), note],
    );
    id = a.id;
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Bu saat az önce doldu, lütfen başka bir saat seçin." };
    throw e;
  }
  revalidatePath("/panel");
  redirect(`/randevu/tamam?id=${id}`);
}

// ---------- Giriş / çıkış ----------
export async function login(_: FormState, f: FormData): Promise<FormState> {
  if (!checkPassword(str(f, "password"))) return { error: "Şifre hatalı." };
  await startSession();
  redirect("/panel");
}

export async function logout() {
  await endSession();
  redirect("/giris");
}

// ---------- Panel ----------
export async function setStatus(f: FormData) {
  await requireAuth();
  const status = str(f, "status");
  if (!["beklemede", "onaylandi", "tamamlandi", "iptal"].includes(status)) return;
  try {
    await query(`UPDATE appointments SET status = $1 WHERE id = $2`, [status, Number(f.get("id"))]);
  } catch (e) {
    if (!isUniqueViolation(e)) throw e; // iptal edilmiş randevu, dolu saate geri alınamaz
  }
  revalidatePath("/panel", "layout");
}

export async function addMeasurement(_: FormState, f: FormData): Promise<FormState> {
  await requireAuth();
  const clientId = Number(f.get("clientId"));
  const weight = Number(str(f, "weight").replace(",", "."));
  const waistRaw = str(f, "waist").replace(",", ".");
  const waist = waistRaw ? Number(waistRaw) : null;
  const date = str(f, "date") || todayIstanbul();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Geçerli bir tarih girin." };
  if (!(weight > 20 && weight < 400)) return { error: "Geçerli bir kilo girin." };
  if (waist !== null && !(waist > 30 && waist < 300)) return { error: "Geçerli bir bel ölçüsü girin." };
  await query(
    `INSERT INTO measurements (client_id, measured_at, weight, waist, note) VALUES ($1, $2, $3, $4, $5)`,
    [clientId, date, weight, waist, str(f, "note") || null],
  );
  revalidatePath(`/panel/danisanlar/${clientId}`);
  return { ok: "Ölçüm kaydedildi." };
}

export async function deleteMeasurement(f: FormData) {
  await requireAuth();
  await query(`DELETE FROM measurements WHERE id = $1`, [Number(f.get("id"))]);
  revalidatePath(`/panel/danisanlar/${Number(f.get("clientId"))}`);
}
