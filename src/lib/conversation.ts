import { sql } from "@vercel/postgres";
import { QUESTIONS } from "./questions";
import { CheckInInput, Question } from "./types";
import { upsertCheckin } from "./db";

export interface ConversationState {
  id: number;
  date: string;
  channel_id: string;
  current_question_id: string;
  last_bot_message_id: string | null;
  answers: Record<string, unknown>;
  status: "active" | "complete";
}

// Flatten questions with follow-ups resolved dynamically
function getNextQuestion(
  currentId: string,
  answers: Record<string, unknown>
): Question | null {
  // Build the effective question list based on answers so far
  const effectiveQuestions: Question[] = [];
  for (const q of QUESTIONS) {
    effectiveQuestions.push(q);
    if (q.followUp && answers[q.field] === q.followUp.condition) {
      effectiveQuestions.push(q.followUp.question as Question);
    }
  }

  const currentIdx = effectiveQuestions.findIndex((q) => q.id === currentId);
  if (currentIdx === -1 || currentIdx >= effectiveQuestions.length - 1) {
    return null;
  }

  // Find next question, skipping any follow-ups whose condition isn't met
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

  // Check for skip
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
  date: string
): Promise<ConversationState | null> {
  const { rows } = await sql`
    SELECT * FROM conversation_state
    WHERE date = ${date} AND status = 'active'
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rowToConversation(rows[0]);
}

export async function createConversation(
  date: string,
  channelId: string,
  questionId: string,
  botMessageId: string
): Promise<ConversationState> {
  const { rows } = await sql`
    INSERT INTO conversation_state (date, channel_id, current_question_id, last_bot_message_id, answers, status)
    VALUES (${date}, ${channelId}, ${questionId}, ${botMessageId}, '{}', 'active')
    ON CONFLICT (date) DO UPDATE SET
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
  // Save the answer
  const currentQuestion = findQuestionById(convo.current_question_id);
  if (!currentQuestion) throw new Error(`Unknown question: ${convo.current_question_id}`);

  const updatedAnswers = { ...convo.answers };
  updatedAnswers[currentQuestion.field] = answerValue;

  // Determine next question
  const nextQuestion = getNextQuestion(convo.current_question_id, updatedAnswers);

  if (nextQuestion) {
    // Update state to next question
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
    // No more questions — complete
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
    daily_journal: typeof a.daily_journal === "string" ? a.daily_journal : null,
  };
  await upsertCheckin(input);
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

function findQuestionById(id: string): Question | null {
  for (const q of QUESTIONS) {
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
  };
}
