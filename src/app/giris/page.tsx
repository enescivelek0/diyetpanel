"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { Alert, Logo, SubmitButton } from "@/components/ui";

export default function Giris() {
  const [state, action] = useActionState(login, undefined);
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <form action={action} className="card mt-6 space-y-4 p-6">
          <div>
            <h1 className="text-xl font-extrabold">Diyetisyen paneli</h1>
            <p className="mt-1 text-sm text-stone-500">Devam etmek için panel şifrenizi girin.</p>
          </div>
          <input
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Şifre"
            className="input"
            autoComplete="current-password"
          />
          <Alert state={state} />
          <SubmitButton pending="Giriş yapılıyor…" className="btn-primary w-full">Giriş yap</SubmitButton>
        </form>
      </div>
    </div>
  );
}
