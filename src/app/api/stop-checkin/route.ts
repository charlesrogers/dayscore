import { initDb } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { dismissConversation } from "@/lib/conversation";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: "No channel ID configured" }, { status: 500 });
  }

  await initDb();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Denver",
  });

  const dismissed = await dismissConversation(today);
  if (dismissed) {
    await sendMessage(channelId, "OK, dismissed.");
    return Response.json({ ok: true, dismissed: true });
  }

  return Response.json({ ok: true, dismissed: false, reason: "No active conversation" });
}
