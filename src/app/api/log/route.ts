import { saveLog } from "@/lib/db";
import { sendMessage } from "@/lib/discord";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = (await request.json()) as { content: string };
  if (!content || !content.trim()) {
    return Response.json({ error: "No content provided" }, { status: 400 });
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: "No channel ID configured" }, { status: 500 });
  }

  const entry = await saveLog(content.trim());
  await sendMessage(channelId, `Logged. (#${entry.id})`);

  return Response.json({ ok: true, id: entry.id });
}
