import { BRAND } from "@/lib/utils";
import { Logo } from "@/components/ui";
import Booking from "./booking";

export const metadata = { title: `Online Randevu — ${BRAND}` };

export default function RandevuPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Logo />
      <div className="mt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{BRAND}</h1>
        <p className="mt-1 text-stone-600">Beslenme danışmanlığı · Online ve yüz yüze görüşme</p>
      </div>
      <Booking />
      <p className="mt-6 text-center text-xs text-stone-500">
        Demo sürüm: girdiğiniz bilgiler yalnızca kendi tarayıcınızda saklanır, hiçbir sunucuya gönderilmez.
      </p>
    </div>
  );
}
