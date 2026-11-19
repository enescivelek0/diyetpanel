// Türkiye saat dilimi (UTC+3, yaz saati uygulaması yok)
export const TZ = "Europe/Istanbul";
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Dyt. Ayşe Yılmaz";
export const SLOT_HOURS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
export const BOOKING_DAYS = 14;

/** İstanbul saatine göre bugünün tarihi: YYYY-MM-DD */
export function todayIstanbul(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** YYYY-MM-DD tarihine gün ekler */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00+03:00`);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d.getTime() + n * 86400000));
}

/** Bugünden itibaren pazar hariç N gün (YYYY-MM-DD) */
export function bookableDates(n = BOOKING_DAYS): string[] {
  const out: string[] = [];
  const base = new Date(`${todayIstanbul()}T12:00:00+03:00`);
  for (let i = 0; out.length < n && i < n * 2; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const iso = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
    const weekday = new Date(`${iso}T12:00:00+03:00`).getUTCDay();
    if (weekday !== 0) out.push(iso);
  }
  return out;
}

export function slotToDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+03:00`);
}

/** Seçilen günün saatleri: dolu veya geçmiş saatler kapalı */
export function buildSlots(date: string, taken: Set<number>) {
  const now = Date.now();
  return SLOT_HOURS.map((time) => {
    const t = slotToDate(date, time).getTime();
    return { time, available: !taken.has(t) && t > now };
  });
}

export function fmtDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, ...opts }).format(new Date(d));
}

export const fmtDay = (d: Date | string) =>
  fmtDate(d, { weekday: "long", day: "numeric", month: "long" });
export const fmtTime = (d: Date | string) => fmtDate(d, { hour: "2-digit", minute: "2-digit" });
export const fmtShort = (d: Date | string) => fmtDate(d, { day: "2-digit", month: "2-digit", year: "numeric" });

/** 05xx / +90 5xx / 5xx → 905xxxxxxxxx; geçersizse null */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("90")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^5\d{9}$/.test(d)) return null;
  return `90${d}`;
}

export function displayPhone(p: string) {
  const d = p.replace(/^90/, "");
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

export function waLink(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function reminderText(name: string, startsAt: Date | string) {
  const first = name.split(" ")[0];
  return `Merhaba ${first}, ${fmtDay(startsAt)} saat ${fmtTime(startsAt)} için ${BRAND} ile randevunuzu hatırlatmak isteriz. Katılım durumunuzu bu mesaja yanıt vererek bildirebilir misiniz? Sağlıklı günler 🌿`;
}

export function confirmText(name: string, startsAt: Date | string) {
  const first = name.split(" ")[0];
  return `Merhaba ${first}, ${fmtDay(startsAt)} saat ${fmtTime(startsAt)} randevunuz onaylanmıştır. Görüşmek üzere! — ${BRAND}`;
}

export const STATUS: Record<string, { label: string; cls: string }> = {
  beklemede: { label: "Onay bekliyor", cls: "bg-amber-100 text-amber-800" },
  onaylandi: { label: "Onaylandı", cls: "bg-emerald-100 text-emerald-800" },
  tamamlandi: { label: "Tamamlandı", cls: "bg-sky-100 text-sky-800" },
  iptal: { label: "İptal", cls: "bg-stone-200 text-stone-600" },
};
