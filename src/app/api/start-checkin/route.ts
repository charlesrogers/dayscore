import { initDb, getNightcapIndex, getRandomPastEntry } from "@/lib/db";
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

    // For nightcap, get the current question index
    let nightcapIndex: number | undefined;
    if (type === "nightcap") {
      nightcapIndex = await getNightcapIndex();
    }

    const questions = getQuestionsForType(type, nightcapIndex);
    const firstQuestion = questions[0];

    // "Remember This" — resurface a past entry during morning flow
    if (type === "morning") {
      const pastEntry = await getRandomPastEntry();
      if (pastEntry) {
        const d = new Date(pastEntry.date + "T12:00:00");
        const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        await sendMessage(channelId, `**Remember This** (${formatted})\n${pastEntry.type}: "${pastEntry.content}"`);
      }
    }

    let greeting: string;
    switch (type) {
      case "morning":
        greeting = `Good morning! ☀️\n\n**${firstQuestion.text}**`;
        break;
      case "work":
        greeting = `Work check-in time.\n\n**${firstQuestion.text}**`;
        break;
      case "nightcap":
        greeting = `Nightcap time! 🌙 Question ${(nightcapIndex ?? 0) + 1} of 245:\n\n**${firstQuestion.text}**`;
        break;
      case "week":
        greeting = `Weekly review time.\n\n**${firstQuestion.text}**`;
        break;
      case "month":
        greeting = `Monthly review time.\n\n**${firstQuestion.text}**`;
        break;
      case "relationship":
        greeting = `Relationship review time.\n\n**${firstQuestion.text}**`;
        break;
      case "todo":
        greeting = `**${firstQuestion.text}**`;
        break;
      case "log":
        greeting = `**${firstQuestion.text}**`;
        break;
      default:
        greeting = `Let's check in.\n\n**${firstQuestion.text}**`;
    }

    const msg = await sendMessage(channelId, greeting);
    await createConversation(today, channelId, firstQuestion.id, msg.id, type);

    return Response.json({ ok: true, date: today, type, questionId: firstQuestion.id });
  } catch (err) {
    console.error("start-checkin error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
