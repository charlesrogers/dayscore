import { sql } from "@vercel/postgres";
import { initDb } from "@/lib/db";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDb();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (date) {
    await sql`UPDATE conversation_state SET status = 'complete' WHERE date = ${date}`;
    return Response.json({ ok: true, reset: date });
  }

  await sql`UPDATE conversation_state SET status = 'complete' WHERE status = 'active'`;
  return Response.json({ ok: true, reset: "all active" });
}
