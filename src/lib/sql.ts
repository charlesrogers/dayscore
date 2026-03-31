import postgres from "postgres";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  "postgresql://localhost:5432/dayscore";

const pg = postgres(connectionString, {
  ssl: connectionString.includes("neon.tech") ? "require" : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

/**
 * Drop-in replacement for @vercel/postgres `sql` template tag.
 * Returns { rows, rowCount } to match the old API.
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: Record<string, unknown>[]; rowCount: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (pg as any)(strings, ...values);
  return {
    rows: result as unknown as Record<string, unknown>[],
    rowCount: result.count,
  };
}
