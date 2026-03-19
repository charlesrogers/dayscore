import { initDb } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { createConversation, getActiveConversation } from "@/lib/conversation";
import { getQuestionsForType } from "@/lib/questions";
import { ConversationType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "personal") as ConversationType;

    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
      return Response.json({ error: "No channel ID configured" }, { status: 500 });
    }

    await initDb();

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Denver",
    });

    const existing = await getActiveConversation(today);
    if (existing) {
      return Response.json({ error: `Already have an active ${existing.type} conversation. Type "stop" first.` }, { status: 409 });
    }

    const questions = getQuestionsForType(type);
    const firstQuestion = questions[0];
    const greeting = type === "work"
      ? `Work check-in time.\n\n**${firstQuestion.text}**`
      : `Let's check in.\n\n**${firstQuestion.text}**`;

    const msg = await sendMessage(channelId, greeting);
    await createConversation(today, channelId, firstQuestion.id, msg.id, type);

    return Response.json({ ok: true, date: today, type, questionId: firstQuestion.id });
  } catch (err) {
    console.error("start-checkin error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
