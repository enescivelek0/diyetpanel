import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "dp_session";

function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  // Yerel geliştirmede kolaylık için; yayında ADMIN_PASSWORD zorunlu.
  return process.env.NODE_ENV === "production" ? null : "demo1234";
}

function token(): string | null {
  const pw = adminPassword();
  if (!pw) return null;
  const secret = process.env.SESSION_SECRET || pw;
  return createHmac("sha256", secret).update("admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const pw = adminPassword();
  return !!pw && safeEqual(input, pw);
}

export async function startSession() {
  const t = token();
  if (!t) return;
  (await cookies()).set(COOKIE, t, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const t = token();
  const c = (await cookies()).get(COOKIE)?.value;
  return !!t && !!c && safeEqual(c, t);
}

export async function requireAuth() {
  if (!(await isAuthed())) redirect("/giris");
}
