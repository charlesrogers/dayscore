import { initDb } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { createConversation, getActiveConversation } from "@/lib/conversation";
import { QUESTIONS } from "@/lib/questions";

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only send if it's actually 5pm Mountain Time (bypass with ?force=true for testing)
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";
  if (!force) {
    const mtHour = parseInt(
      new Date().toLocaleString("en-US", {
        timeZone: "America/Denver",
        hour: "numeric",
        hour12: false,
      }),
      10
    );
    if (mtHour !== 17) {
      return Response.json({ skipped: true, reason: "Not 5pm MT" });
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

  // Check if there's already an active conversation for today
  const existing = await getActiveConversation(today);
  if (existing) {
    return Response.json({ skipped: true, reason: "Conversation already active" });
  }

  // Send the greeting + first question
  const firstQuestion = QUESTIONS[0];
  const msg = await sendMessage(
    channelId,
    `Hey Charles, let's check in for ${today}.\n\n**${firstQuestion.text}**`
  );

  // Create conversation state
  await createConversation(today, channelId, firstQuestion.id, msg.id);

  return Response.json({ ok: true, date: today, questionId: firstQuestion.id });
}
