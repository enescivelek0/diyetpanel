// Veritabanı katmanı.
// Yayında: DATABASE_URL (Neon Postgres) kullanılır.
// Yerelde: DATABASE_URL yoksa kurulum gerektirmeyen PGlite (.pglite klasörü) kullanılır.

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    goal TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'beklemede',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS appointments_slot_unique
    ON appointments (starts_at) WHERE status <> 'iptal'`,
  `CREATE TABLE IF NOT EXISTS measurements (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5,1) NOT NULL,
    waist NUMERIC(5,1),
    note TEXT
  )`,
];

const g = globalThis as unknown as { __dbReady?: Promise<QueryFn> };

async function connect(): Promise<QueryFn> {
  let q: QueryFn;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    q = (text, params = []) => sql.query(text, params as any[]) as Promise<Row[]>;
  } else {
    if (process.env.VERCEL) {
      throw new Error("DATABASE_URL tanımlı değil. Vercel'de bir Neon veritabanı bağlayın.");
    }
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite("./.pglite");
    q = async (text, params = []) => (await db.query<Row>(text, params as any[])).rows;
  }
  for (const stmt of SCHEMA) await q(stmt);
  return q;
}

export async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  if (!g.__dbReady) {
    g.__dbReady = connect().catch((e) => {
      g.__dbReady = undefined;
      throw e;
    });
  }
  const q = await g.__dbReady;
  return q(text, params);
}

export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
}
