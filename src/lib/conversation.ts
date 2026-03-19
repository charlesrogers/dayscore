import { sql } from "@vercel/postgres";
import { getQuestionsForType, getQuestionsForTypeFromDb } from "./questions";
import { CheckInInput, ConversationType, Question, isReviewType, ReviewType } from "./types";
import { upsertCheckin, saveReview } from "./db";

export interface ConversationState {
  id: number;
  date: string;
  channel_id: string;
  current_question_id: string;
  last_bot_message_id: string | null;
  answers: Record<string, unknown>;
  status: "active" | "complete";
  type: ConversationType;
}

function getNextQuestion(
  currentId: string,
  answers: Record<string, unknown>,
  questions: Question[]
): Question | null {
  const effectiveQuestions: Question[] = [];
  for (const q of questions) {
    effectiveQuestions.push(q);
    if (q.followUp && answers[q.field] === q.followUp.condition) {
      effectiveQuestions.push(q.followUp.question as Question);
    }
  }

  const currentIdx = effectiveQuestions.findIndex((q) => q.id === currentId);
  if (currentIdx === -1 || currentIdx >= effectiveQuestions.length - 1) {
    return null;
  }

  for (let i = currentIdx + 1; i < effectiveQuestions.length; i++) {
    return effectiveQuestions[i];
  }
  return null;
}

export function parseAnswer(
  questionType: string,
  message: string
): string | number | boolean | null {
  const text = message.trim().toLowerCase();

  if (["skip", "s", "-", "n/a", "none", "nothing", "nah"].includes(text)) {
    return null;
  }

  switch (questionType) {
    case "yesno": {
      const yesWords = ["y", "yes", "yeah", "yep", "yup", "true", "1", "si", "ye"];
      return yesWords.includes(text);
    }
    case "number": {
      const match = message.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : null;
    }
    case "text":
    case "textarea":
      return message.trim() || null;
    default:
      return message.trim() || null;
  }
}

export async function getActiveConversation(
  date: string,
  type?: ConversationType
): Promise<ConversationState | null> {
  let rows;
  if (type) {
    const result = await sql`
      SELECT * FROM conversation_state
      WHERE date = ${date} AND status = 'active' AND type = ${type}
      LIMIT 1
    `;
    rows = result.rows;
  } else {
    const result = await sql`
      SELECT * FROM conversation_state
      WHERE date = ${date} AND status = 'active'
      LIMIT 1
    `;
    rows = result.rows;
  }
  if (rows.length === 0) return null;
  return rowToConversation(rows[0]);
}

export async function createConversation(
  date: string,
  channelId: string,
  questionId: string,
  botMessageId: string,
  type: ConversationType = "personal"
): Promise<ConversationState> {
  const { rows } = await sql`
    INSERT INTO conversation_state (date, channel_id, current_question_id, last_bot_message_id, answers, status, type)
    VALUES (${date}, ${channelId}, ${questionId}, ${botMessageId}, '{}', 'active', ${type})
    ON CONFLICT (date, type) DO UPDATE SET
      channel_id = EXCLUDED.channel_id,
      current_question_id = EXCLUDED.current_question_id,
      last_bot_message_id = EXCLUDED.last_bot_message_id,
      answers = '{}',
      status = 'active',
      updated_at = NOW()
    RETURNING *
  `;
  return rowToConversation(rows[0]);
}

export async function advanceConversation(
  convo: ConversationState,
  answerValue: string | number | boolean | null
): Promise<{ nextQuestion: Question | null; updatedConvo: ConversationState }> {
  const questions = await getQuestionsForTypeFromDb(convo.type);
  const currentQuestion = findQuestionById(convo.current_question_id, questions);
  if (!currentQuestion) throw new Error(`Unknown question: ${convo.current_question_id}`);

  const updatedAnswers = { ...convo.answers };
  updatedAnswers[currentQuestion.field] = answerValue;

  const nextQuestion = getNextQuestion(convo.current_question_id, updatedAnswers, questions);

  if (nextQuestion) {
    const { rows } = await sql`
      UPDATE conversation_state
      SET current_question_id = ${nextQuestion.id},
          answers = ${JSON.stringify(updatedAnswers)},
          updated_at = NOW()
      WHERE id = ${convo.id}
      RETURNING *
    `;
    return { nextQuestion, updatedConvo: rowToConversation(rows[0]) };
  } else {
    const { rows } = await sql`
      UPDATE conversation_state
      SET answers = ${JSON.stringify(updatedAnswers)},
          status = 'complete',
          updated_at = NOW()
      WHERE id = ${convo.id}
      RETURNING *
    `;
    return { nextQuestion: null, updatedConvo: rowToConversation(rows[0]) };
  }
}

export async function completeConversation(
  convo: ConversationState
): Promise<void> {
  const a = convo.answers;

  // Reviews go to the reviews table
  if (isReviewType(convo.type)) {
    const stringAnswers: Record<string, string> = {};
    for (const [key, val] of Object.entries(a)) {
      if (val != null) stringAnswers[key] = String(val);
    }
    await saveReview(convo.date, convo.type as ReviewType, stringAnswers);
    return;
  }

  // Daily check-ins go to the checkins table
  const input: CheckInInput = {
    date: convo.date,
    weight: typeof a.weight === "number" ? a.weight : null,
    journaled: a.journaled === true,
    journal_detail: typeof a.journal_detail === "string" ? a.journal_detail : null,
    worked_out: a.worked_out === true,
    workout_detail: typeof a.workout_detail === "string" ? a.workout_detail : null,
    built_shipped: typeof a.built_shipped === "string" ? a.built_shipped : null,
    felt_spirit: a.felt_spirit === true,
    brightened_day: a.brightened_day === true,
    nolan_moment: typeof a.nolan_moment === "string" ? a.nolan_moment : null,
    daily_journal: typeof a.daily_journal === "string" ? a.daily_journal : null,
    work_done: typeof a.work_done === "string" ? a.work_done : null,
    skill_edge: typeof a.skill_edge === "string" ? a.skill_edge : null,
    tomorrow_plan: typeof a.tomorrow_plan === "string" ? a.tomorrow_plan : null,
  };
  await upsertCheckin(input);
}

export async function dismissConversation(date: string): Promise<boolean> {
  const result = await sql`
    UPDATE conversation_state
    SET status = 'complete', updated_at = NOW()
    WHERE date = ${date} AND status = 'active'
  `;
  return (result.rowCount ?? 0) > 0;
}

export async function updateBotMessageId(
  convoId: number,
  messageId: string
): Promise<void> {
  await sql`
    UPDATE conversation_state
    SET last_bot_message_id = ${messageId}, updated_at = NOW()
    WHERE id = ${convoId}
  `;
}

function findQuestionById(id: string, questions: Question[]): Question | null {
  for (const q of questions) {
    if (q.id === id) return q;
    if (q.followUp && q.followUp.question.id === id) {
      return q.followUp.question as Question;
    }
  }
  return null;
}

function rowToConversation(row: Record<string, unknown>): ConversationState {
  return {
    id: row.id as number,
    date:
      row.date instanceof Date
        ? row.date.toISOString().split("T")[0]
        : String(row.date).split("T")[0],
    channel_id: row.channel_id as string,
    current_question_id: row.current_question_id as string,
    last_bot_message_id: row.last_bot_message_id as string | null,
    answers:
      typeof row.answers === "string"
        ? JSON.parse(row.answers)
        : (row.answers as Record<string, unknown>) || {},
    status: row.status as "active" | "complete",
    type: (row.type as ConversationType) || "personal",
  };
}
