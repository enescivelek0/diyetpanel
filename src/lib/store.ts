"use client";

// Tarayıcı tabanlı veri katmanı.
// Proje bir demo olduğu için sunucu/veritabanı kullanılmaz; tüm veriler
// ziyaretçinin tarayıcısında (localStorage) saklanır. İlk açılışta örnek
// verilerle doldurulur, "Demoyu sıfırla" ile başa dönülür.

import { useSyncExternalStore } from "react";
import {
  SLOT_HOURS,
  addDays,
  bookableDates,
  normalizePhone,
  slotToDate,
  todayIstanbul,
} from "./utils";

export type Status = "beklemede" | "onaylandi" | "tamamlandi" | "iptal";
export type Client = { id: number; name: string; phone: string; email?: string; goal?: string; createdAt: string };
export type Appointment = { id: number; clientId: number; startsAt: string; note?: string; status: Status; createdAt: string };
export type Measurement = { id: number; clientId: number; date: string; weight: number; waist?: number; note?: string };
export type DB = { version: 1; clients: Client[]; appointments: Appointment[]; measurements: Measurement[]; nextId: number };

const KEY = "diyetpanel:v1";
let cache: DB | null = null;
const listeners = new Set<() => void>();

// ---------------- Örnek veri ----------------
function seed(): DB {
  const today = todayIstanbul();
  const now = new Date().toISOString();
  let id = 1;
  const clients: Client[] = [
    { name: "Elif Kaya", phone: "905550000101", goal: "Kilo vermek", email: "elif@example.com" },
    { name: "Mehmet Demir", phone: "905550000102", goal: "Sporcu beslenmesi" },
    { name: "Zeynep Arslan", phone: "905550000103", goal: "Kilo vermek" },
    { name: "Can Öztürk", phone: "905550000104", goal: "Sağlıklı beslenme" },
    { name: "Selin Aydın", phone: "905550000105", goal: "Hamilelik / emzirme" },
    { name: "Burak Şahin", phone: "905550000106", goal: "Kilo almak" },
  ].map((c) => ({ ...c, id: id++, createdAt: now }));

  // Haftalık ölçümler: [başlangıç kilosu, haftalık değişim, bel]
  const plans: [number, number, number][] = [
    [82.4, -0.8, 92], [78.0, 0.2, 84], [95.6, -1.1, 104], [70.2, -0.3, 80], [64.5, 0.3, 0], [58.1, 0.5, 68],
  ];
  const measurements: Measurement[] = [];
  clients.forEach((c, i) => {
    const [start, step, waist] = plans[i];
    const weeks = 5 + (i % 3);
    for (let w = weeks; w >= 0; w--) {
      const k = weeks - w;
      const jitter = ((k * 7 + i * 3) % 5) / 10 - 0.2;
      measurements.push({
        id: id++,
        clientId: c.id,
        date: addDays(today, -w * 7 - (i % 3)),
        weight: Math.round((start + step * k + jitter) * 10) / 10,
        waist: waist ? Math.round((waist + step * k * 0.9) * 10) / 10 : undefined,
      });
    }
  });

  const days = bookableDates();
  const appt = (clientId: number, date: string, time: string, status: Status, note?: string): Appointment => ({
    id: id++, clientId, startsAt: slotToDate(date, time).toISOString(), status, note, createdAt: now,
  });
  const appointments: Appointment[] = [
    appt(1, addDays(today, -14), "10:00", "tamamlandi"),
    appt(3, addDays(today, -7), "14:00", "tamamlandi"),
    appt(2, addDays(today, -6), "11:00", "iptal"),
    appt(4, addDays(today, -3), "15:00", "tamamlandi"),
    appt(1, days[0], "16:00", "onaylandi"),
    appt(5, days[0], "17:00", "beklemede", "İlk görüşme, emzirme döneminde beslenme hakkında bilgi almak istiyorum."),
    appt(3, days[1], "10:00", "onaylandi"),
    appt(6, days[1], "12:00", "beklemede"),
    appt(2, days[2], "09:00", "onaylandi", "Maç haftası öncesi kontrol."),
    appt(4, days[4], "14:00", "beklemede"),
  ];
  return { version: 1, clients, appointments, measurements, nextId: id };
}

// ---------------- Store ----------------
function read(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed?.version === 1) return (cache = parsed);
    }
  } catch {}
  cache = seed();
  write(cache);
  return cache;
}

function write(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {}
}

function update(fn: (db: DB) => DB) {
  cache = fn(read());
  write(cache);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Sunucuda ve ilk render'da null döner; tarayıcıda veriyi verir. */
export function useDB(): DB | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

// ---------------- İşlemler ----------------
export type Result = { error?: string; ok?: string; id?: number };

export function bookAppointment(f: FormData): Result {
  const s = (k: string) => String(f.get(k) ?? "").trim();
  const name = s("name");
  const phone = normalizePhone(s("phone"));
  const date = s("date");
  const time = s("time");
  if (name.length < 3) return { error: "Lütfen adınızı ve soyadınızı yazın." };
  if (!phone) return { error: "Geçerli bir cep telefonu girin (05xx xxx xx xx)." };
  if (!bookableDates().includes(date) || !SLOT_HOURS.includes(time)) return { error: "Lütfen bir gün ve saat seçin." };
  const startsAt = slotToDate(date, time);
  if (startsAt.getTime() < Date.now()) return { error: "Geçmiş bir saat seçilemez." };
  if (f.get("kvkk") !== "on") return { error: "Devam etmek için KVKK aydınlatma metnini onaylayın." };

  const iso = startsAt.toISOString();
  const db = read();
  if (db.appointments.some((a) => a.startsAt === iso && a.status !== "iptal"))
    return { error: "Bu saat dolu, lütfen başka bir saat seçin." };

  let newId = 0;
  update((db) => {
    let nextId = db.nextId;
    const now = new Date().toISOString();
    let clients = db.clients;
    let client = clients.find((c) => c.phone === phone);
    const extra = { email: s("email") || client?.email, goal: s("goal") || client?.goal };
    if (client) {
      client = { ...client, name, ...extra };
      clients = clients.map((c) => (c.id === client!.id ? client! : c));
    } else {
      client = { id: nextId++, name, phone, createdAt: now, ...extra };
      clients = [...clients, client];
    }
    newId = nextId++;
    const a: Appointment = { id: newId, clientId: client.id, startsAt: iso, note: s("note") || undefined, status: "beklemede", createdAt: now };
    return { ...db, clients, appointments: [...db.appointments, a], nextId };
  });
  return { id: newId };
}

export function setStatus(id: number, status: Status): Result {
  const db = read();
  const target = db.appointments.find((a) => a.id === id);
  if (!target) return {};
  if (status !== "iptal" && db.appointments.some((a) => a.id !== id && a.startsAt === target.startsAt && a.status !== "iptal"))
    return { error: "Bu saat başka bir randevuyla dolu." };
  update((db) => ({ ...db, appointments: db.appointments.map((a) => (a.id === id ? { ...a, status } : a)) }));
  return {};
}

export function addMeasurement(clientId: number, f: FormData): Result {
  const s = (k: string) => String(f.get(k) ?? "").trim().replace(",", ".");
  const weight = Number(s("weight"));
  const waist = s("waist") ? Number(s("waist")) : undefined;
  const date = s("date") || todayIstanbul();
  if (!(weight > 20 && weight < 400)) return { error: "Geçerli bir kilo girin." };
  if (waist !== undefined && !(waist > 30 && waist < 300)) return { error: "Geçerli bir bel ölçüsü girin." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Geçerli bir tarih girin." };
  update((db) => ({
    ...db,
    measurements: [...db.measurements, { id: db.nextId, clientId, date, weight, waist, note: String(f.get("note") ?? "").trim() || undefined }],
    nextId: db.nextId + 1,
  }));
  return { ok: "Ölçüm kaydedildi." };
}

export function deleteMeasurement(id: number) {
  update((db) => ({ ...db, measurements: db.measurements.filter((m) => m.id !== id) }));
}

export function resetDemo() {
  update(() => seed());
}

// ---------------- Yardımcı sorgular ----------------
export function measurementsOf(db: DB, clientId: number) {
  return db.measurements
    .filter((m) => m.clientId === clientId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
}
