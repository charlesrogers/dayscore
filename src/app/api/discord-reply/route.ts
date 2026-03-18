import { initDb } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import {
  getActiveConversation,
  advanceConversation,
  completeConversation,
  updateBotMessageId,
  parseAnswer,
} from "@/lib/conversation";
import { QUESTIONS } from "@/lib/questions";
import { calculateScore } from "@/lib/types";

export async function POST(request: Request) {
  // Verify auth
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = (await request.json()) as {
    content: string;
    authorId: string;
    messageId: string;
  };

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: "No channel ID configured" }, { status: 500 });
  }

  await initDb();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Denver",
  });

  // Get active conversation
  const convo = await getActiveConversation(today);
  if (!convo) {
    return Response.json({ skipped: true, reason: "No active conversation" });
  }

  // Find current question
  const currentQuestion = findQuestionById(convo.current_question_id);
  if (!currentQuestion) {
    return Response.json(
      { error: `Unknown question: ${convo.current_question_id}` },
      { status: 500 }
    );
  }

  // Parse the answer
  const answerValue = parseAnswer(currentQuestion.type, content);

  // Advance the conversation
  const { nextQuestion, updatedConvo } = await advanceConversation(
    convo,
    answerValue
  );

  if (nextQuestion) {
    // Send next question
    const botMsg = await sendMessage(channelId, `**${nextQuestion.text}**`);
    await updateBotMessageId(updatedConvo.id, botMsg.id);

    return Response.json({
      ok: true,
      answered: currentQuestion.id,
      next: nextQuestion.id,
    });
  } else {
    // Conversation complete
    await completeConversation(updatedConvo);

    const a = updatedConvo.answers;
    const score = calculateScore({
      date: updatedConvo.date,
      weight: typeof a.weight === "number" ? a.weight : null,
      journaled: a.journaled === true,
      journal_detail:
        typeof a.journal_detail === "string" ? a.journal_detail : null,
      worked_out: a.worked_out === true,
      workout_detail:
        typeof a.workout_detail === "string" ? a.workout_detail : null,
      built_shipped:
        typeof a.built_shipped === "string" ? a.built_shipped : null,
      felt_spirit: a.felt_spirit === true,
      brightened_day: a.brightened_day === true,
      nolan_moment:
        typeof a.nolan_moment === "string" ? a.nolan_moment : null,
      daily_journal:
        typeof a.daily_journal === "string" ? a.daily_journal : null,
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://dayscore-five.vercel.app";
    const parts = [`**Check-in complete! Score: ${score}/6**`];
    if (a.weight) parts.push(`Weight: ${a.weight} lbs`);
    parts.push(
      `Journal: ${a.journaled ? "Yes" : "No"}${a.journal_detail ? ` (${a.journal_detail})` : ""}`
    );
    parts.push(
      `Workout: ${a.worked_out ? "Yes" : "No"}${a.workout_detail ? ` (${a.workout_detail})` : ""}`
    );
    if (a.built_shipped) parts.push(`Built: ${a.built_shipped}`);
    parts.push(`Spirit: ${a.felt_spirit ? "Yes" : "No"}`);
    parts.push(`Catherine: ${a.brightened_day ? "Yes" : "No"}`);
    if (a.nolan_moment) parts.push(`Nolan moment: ${a.nolan_moment}`);
    if (a.daily_journal) parts.push(`\nJournal: ${a.daily_journal}`);
    parts.push(`\nDashboard: ${appUrl}`);

    await sendMessage(channelId, parts.join("\n"));

    return Response.json({ ok: true, complete: true, score });
  }
}

function findQuestionById(id: string) {
  for (const q of QUESTIONS) {
    if (q.id === id) return q;
    if (q.followUp && q.followUp.question.id === id) {
      return q.followUp.question;
    }
  }
  return null;
}
