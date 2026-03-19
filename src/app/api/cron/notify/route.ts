import { initDb, getNightcapIndex } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { createConversation, getActiveConversation } from "@/lib/conversation";
import { getQuestionsForType } from "@/lib/questions";
import { ConversationType } from "@/lib/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";
  const type = (searchParams.get("type") || "personal") as ConversationType;

  // Time guard: personal=9pm MT, work=5pm MT
  if (!force) {
    const mtHour = parseInt(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Denver",
        hour: "numeric",
        hour12: false,
      }),
      10
    );
    const expectedHour = type === "work" ? 17 : type === "nightcap" ? 22 : 21;
    if (mtHour !== expectedHour) {
      return Response.json({ skipped: true, reason: `Not ${expectedHour}:00 MT for ${type}` });
    }
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: "No channel ID configured" }, { status: 500 });
  }

  await initDb();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Denver",
  });

  // Check if there's already an active conversation of this type
  const existing = await getActiveConversation(today, type);
  if (existing) {
    return Response.json({ skipped: true, reason: `${type} conversation already active` });
  }

  let nightcapIndex: number | undefined;
  if (type === "nightcap") {
    nightcapIndex = await getNightcapIndex();
  }

  const questions = getQuestionsForType(type, nightcapIndex);
  const firstQuestion = questions[0];
  let greeting: string;
  if (type === "nightcap") {
    greeting = `Nightcap time! 🌙 Question ${(nightcapIndex ?? 0) + 1} of 245:\n\n**${firstQuestion.text}**`;
  } else if (type === "work") {
    greeting = `Hey Charles, work check-in for ${today}.\n\n**${firstQuestion.text}**`;
  } else {
    greeting = `Hey Charles, let's check in for ${today}.\n\n**${firstQuestion.text}**`;
  }

  const msg = await sendMessage(channelId, greeting);
  await createConversation(today, channelId, firstQuestion.id, msg.id, type);

  return Response.json({ ok: true, date: today, type, questionId: firstQuestion.id });
}
