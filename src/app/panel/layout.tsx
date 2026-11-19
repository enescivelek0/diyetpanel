import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Logo } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel — DiyetPanel" };

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  await requireAuth();
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo href="/panel" />
          <nav className="flex items-center gap-1 text-sm font-semibold">
            <Link href="/panel" className="rounded-lg px-3 py-2 hover:bg-stone-100">Randevular</Link>
            <Link href="/panel/danisanlar" className="rounded-lg px-3 py-2 hover:bg-stone-100">Danışanlar</Link>
            <Link href="/randevu" target="_blank" className="rounded-lg px-3 py-2 hover:bg-stone-100">Randevu sayfam ↗</Link>
            <form action={logout}>
              <button className="rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100">Çıkış</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
