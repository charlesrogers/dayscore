import { initDb, advanceNightcapIndex } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { dismissConversation } from "@/lib/conversation";
import { NIGHTCAP_TOTAL } from "@/lib/questions";

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

  await dismissConversation(today);
  const nextIndex = await advanceNightcapIndex(NIGHTCAP_TOTAL);
  await sendMessage(channelId, `Skipped! See you tomorrow. 🌙 (Next up: question ${nextIndex + 1})`);

  return Response.json({ ok: true, skipped: true, nextIndex });
}
