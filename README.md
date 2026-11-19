# DiyetPanel

Diyetisyenler için online randevu, WhatsApp hatırlatma ve danışan takibi.

## Özellikler

- **Tanıtım sayfası** (`/`): ürünün satış sayfası
- **Online randevu** (`/randevu`): gün ve saat seçimi, dolu saatler kapalı, çift rezervasyon veritabanı seviyesinde engellenir, KVKK onayı
- **Diyetisyen paneli** (`/panel`): günlük/haftalık özet, randevu onaylama/iptal/tamamlama, tek tıkla WhatsApp onay ve hatırlatma mesajı
- **Danışan kartı** (`/panel/danisanlar/[id]`): kilo/bel ölçümü kaydı, kilo grafiği, randevu geçmişi

## Teknoloji

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · Postgres (Neon) · yerelde PGlite

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

`DATABASE_URL` tanımlı değilse veriler `.pglite/` klasöründeki yerel Postgres'e yazılır, kurulum gerekmez.
Panel şifresi yerelde `demo1234`.

## Yayına alma (Vercel)

1. Projeyi Vercel'e bağlayın ve **Storage → Neon** ile bir Postgres veritabanı ekleyin (`DATABASE_URL` otomatik eklenir).
2. `ADMIN_PASSWORD` ortam değişkenini tanımlayın.
3. Deploy edin. Tablolar ilk istekte otomatik oluşturulur.

## Yol haritası

- [ ] Çoklu diyetisyen (multi-tenant, `isim.diyetpanel.com`)
- [ ] WhatsApp Business API ile otomatik hatırlatma (Cron)
- [ ] Diyet listesi oluşturma ve PDF
- [ ] Danışan uygulaması (PWA): su/öğün takibi
- [ ] iyzico ile abonelik ödemesi
