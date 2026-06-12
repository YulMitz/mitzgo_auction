import { Pool } from "pg";

const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v || v.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
};

export const pool = new Pool({
  host: requireEnv("POSTGRES_HOST"),
  port: Number(requireEnv("POSTGRES_PORT")),
  user: requireEnv("POSTGRES_USER"),
  password: requireEnv("POSTGRES_PASSWORD"),
  database: requireEnv("POSTGRES_DB"),
});

export async function pingDb(): Promise<boolean> {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}

export async function waitForDb(
  maxAttempts = 30,
  delayMs = 1000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (await pingDb()) {
      console.log(`db connected (attempt ${attempt})`);
      return;
    }
    console.log(
      `db not ready yet (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms…`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("db connection failed after exhausting retries");
}
