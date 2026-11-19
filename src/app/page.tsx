import Link from "next/link";
import { Logo } from "@/components/ui";

const features = [
  {
    t: "7/24 online randevu",
    d: "Danışanlarınız size özel sayfadan boş saatleri görüp saniyeler içinde randevu alır. Telefon trafiği biter.",
  },
  {
    t: "Tek tıkla WhatsApp hatırlatma",
    d: "Hazır mesaj şablonlarıyla onay ve hatırlatma mesajlarını tek tıkla gönderin, gelmeme oranını düşürün.",
  },
  {
    t: "Kilo ve ölçü takibi",
    d: "Her danışanın kilo ve bel ölçüsü geçmişini grafikle izleyin, ilerlemeyi danışanınızla paylaşın.",
  },
  {
    t: "KVKK uyumlu başlangıç",
    d: "Aydınlatma metni ve açık rıza onayı randevu formuna dahil. Sadece gerekli veriler tutulur.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/giris" className="btn-ghost">Panel girişi</Link>
          <Link href="/randevu" className="btn-primary hidden sm:inline-flex">Demo randevu al</Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              Diyetisyenler için tasarlandı
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-stone-900 sm:text-6xl">
              Randevular, hatırlatmalar ve danışan takibi <span className="text-brand-600">tek panelde.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-stone-600">
              Defter, Excel ve WhatsApp arasında kaybolmayın. DiyetPanel ile danışanlarınız online randevu alır,
              siz tek tıkla hatırlatma gönderir ve ilerlemelerini grafikle takip edersiniz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/randevu" className="btn-primary px-6 py-3 text-base">Randevu sayfasını gör</Link>
              <Link href="/giris" className="btn-ghost px-6 py-3 text-base">Paneli incele</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="card p-6">
              <h3 className="font-bold text-stone-900">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.d}</p>
            </div>
          ))}
        </section>

        <section className="bg-brand-900 py-16 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Aylık 299 ₺ — ilk 14 gün ücretsiz</h2>
              <p className="mt-2 text-brand-100">Kurulum yok, kredi kartı gerekmez. Sınırsız randevu ve danışan.</p>
            </div>
            <Link href="/randevu" className="btn bg-white px-6 py-3 text-base text-brand-900 hover:bg-brand-50">
              Hemen dene
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-stone-500">
        <span>© {new Date().getFullYear()} DiyetPanel</span>
        <Link href="/kvkk" className="hover:text-stone-800">KVKK Aydınlatma Metni</Link>
      </footer>
    </div>
  );
}
