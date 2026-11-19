import Link from "next/link";
import { Logo } from "@/components/ui";
import ResetButton from "./reset-button";

export const metadata = { title: "Diyetisyen Paneli — DiyetPanel" };

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-brand-900 px-4 py-2 text-center text-xs text-brand-100 sm:text-sm">
        Demo modu: veriler örnektir ve yalnızca bu tarayıcıda saklanır. <ResetButton />
      </div>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo href="/" />
          <nav className="flex items-center gap-1 text-sm font-semibold">
            <Link href="/panel" className="rounded-lg px-3 py-2 hover:bg-stone-100">Randevular</Link>
            <Link href="/panel/danisanlar" className="rounded-lg px-3 py-2 hover:bg-stone-100">Danışanlar</Link>
            <Link href="/randevu" className="rounded-lg px-3 py-2 hover:bg-stone-100">Randevu sayfası</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
