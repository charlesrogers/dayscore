export interface CheckIn {
  id: number;
  date: string;
  weight: number | null;
  journaled: boolean;
  journal_detail: string | null;
  worked_out: boolean;
  workout_detail: string | null;
  built_shipped: string | null;
  felt_spirit: boolean;
  brightened_day: boolean;
  nolan_moment: string | null;
  daily_journal: string | null;
  work_done: string | null;
  skill_edge: string | null;
  tomorrow_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckInInput {
  date: string;
  weight: number | null;
  journaled: boolean;
  journal_detail: string | null;
  worked_out: boolean;
  workout_detail: string | null;
  built_shipped: string | null;
  felt_spirit: boolean;
  brightened_day: boolean;
  nolan_moment: string | null;
  daily_journal: string | null;
  work_done: string | null;
  skill_edge: string | null;
  tomorrow_plan: string | null;
}

export interface Review {
  id: number;
  date: string;
  type: ReviewType;
  answers: Record<string, string>;
  created_at: string;
}

export type QuestionType = "number" | "yesno" | "text" | "textarea";
export type ConversationType = "personal" | "work" | "week" | "month" | "relationship" | "nightcap" | "morning";
export type ReviewType = "week" | "month" | "relationship" | "nightcap" | "morning";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  field: string;
  followUp?: {
    condition: boolean;
    question: Omit<Question, "followUp">;
  };
  optional?: boolean;
}

export function calculateScore(checkin: CheckIn | CheckInInput): number {
  let score = 0;
  if (checkin.weight !== null && checkin.weight > 0) score++;
  if (checkin.journaled) score++;
  if (checkin.worked_out) score++;
  if (checkin.built_shipped && checkin.built_shipped.trim().length > 0) score++;
  if (checkin.felt_spirit) score++;
  if (checkin.brightened_day) score++;
  return score;
}

export function isReviewType(type: string): type is ReviewType {
  return ["week", "month", "relationship", "nightcap", "morning"].includes(type);
}
