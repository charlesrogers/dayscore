import { sql } from "@/lib/sql";

export async function GET() {
  try {
    await sql`SELECT 1`;
    return Response.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[health] DB check failed:", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
