"use client";

import { useActionState } from "react";
import Link from "next/link";
import { bookAppointment } from "@/lib/actions";
import { Alert, SubmitButton } from "@/components/ui";

export default function BookingForm({
  date,
  slots,
}: {
  date: string;
  slots: { time: string; available: boolean }[];
}) {
  const [state, action] = useActionState(bookAppointment, undefined);
  const anyAvailable = slots.some((s) => s.available);

  return (
    <form action={action} className="mt-6 space-y-6">
      <input type="hidden" name="date" value={date} />
      <div>
        <h2 className="font-bold">2. Saat seçin</h2>
        {anyAvailable ? (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {slots.map((s) => (
              <label key={s.time} className={s.available ? "cursor-pointer" : "cursor-not-allowed"}>
                <input
                  type="radio"
                  name="time"
                  value={s.time}
                  disabled={!s.available}
                  required
                  className="peer sr-only"
                />
                <span className="block rounded-xl border border-stone-200 py-2 text-center text-sm font-semibold transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-disabled:bg-stone-100 peer-disabled:text-stone-400 peer-disabled:line-through peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 hover:border-brand-500">
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
          <select name="goal" className="input" defaultValue="">
            <option value="">Hedefiniz (isteğe bağlı)</option>
            <option>Kilo vermek</option>
            <option>Kilo almak</option>
            <option>Sağlıklı beslenme</option>
            <option>Sporcu beslenmesi</option>
            <option>Hamilelik / emzirme</option>
          </select>
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            placeholder="Eklemek istediğiniz bir not (isteğe bağlı)"
            className="input sm:col-span-2"
          />
        </div>
        <label className="mt-3 flex items-start gap-2 text-sm text-stone-600">
          <input type="checkbox" name="kvkk" required className="mt-0.5 size-4 accent-brand-600" />
          <span>
            <Link href="/kvkk" target="_blank" className="font-semibold text-brand-700 underline">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum; randevu ve iletişim amacıyla bilgilerimin işlenmesine ve WhatsApp üzerinden
            bilgilendirme yapılmasına onay veriyorum.
          </span>
        </label>
      </div>

      <Alert state={state} />
      <SubmitButton pending="Randevu oluşturuluyor…" className="btn-primary w-full py-3 text-base">
        Randevuyu oluştur
      </SubmitButton>
    </form>
  );
}
