import { Logo } from "@/components/ui";
import { BRAND } from "@/lib/utils";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function Kvkk() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Logo />
      <article className="card mt-8 space-y-4 p-6 text-[15px] leading-relaxed text-stone-700 sm:p-8">
        <h1 className="text-2xl font-extrabold text-stone-900">KVKK Aydınlatma Metni</h1>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bu metin bir şablondur. Yayına almadan önce bir hukuk danışmanına kontrol ettiriniz.
        </p>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla{" "}
          <strong>{BRAND}</strong> olarak kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.
        </p>
        <h2 className="font-bold text-stone-900">İşlenen veriler</h2>
        <p>Ad soyad, cep telefonu, e-posta (isteğe bağlı), beslenme hedefi, randevu tarihi ve randevu notu.</p>
        <h2 className="font-bold text-stone-900">İşleme amaçları</h2>
        <p>
          Randevunuzun oluşturulması ve yönetilmesi, randevu onayı ve hatırlatmalarının telefon veya WhatsApp
          üzerinden iletilmesi, danışmanlık hizmetinin yürütülmesi.
        </p>
        <h2 className="font-bold text-stone-900">Hukuki sebep ve aktarım</h2>
        <p>
          Verileriniz açık rızanız ve sözleşmenin kurulması/ifası hukuki sebeplerine dayanılarak işlenir. Hizmetin
          sunulması için kullanılan bulut altyapı sağlayıcılarının sunucuları yurt dışında bulunabilir.
        </p>
        <h2 className="font-bold text-stone-900">Haklarınız</h2>
        <p>
          KVKK&apos;nın 11. maddesi kapsamında verilerinize erişme, düzeltilmesini veya silinmesini talep etme ve
          rızanızı geri alma haklarına sahipsiniz. Talepleriniz için diyetisyeninizle iletişime geçebilirsiniz.
        </p>
      </article>
    </div>
  );
}
