import { Question } from "./types";
import { NIGHTCAP_QUESTIONS } from "./nightcap-questions";

export const PERSONAL_QUESTIONS: Question[] = [
  { id: "weight", text: "Weight?", type: "number", field: "weight" },
  {
    id: "journaled", text: "Did you journal?", type: "yesno", field: "journaled",
    followUp: { condition: true, question: { id: "journal_detail", text: "What about?", type: "text", field: "journal_detail" } },
  },
  {
    id: "worked_out", text: "Did you workout?", type: "yesno", field: "worked_out",
    followUp: { condition: true, question: { id: "workout_detail", text: "What did you do?", type: "text", field: "workout_detail" } },
  },
  { id: "built_shipped", text: "What did you build/ship?", type: "text", field: "built_shipped", optional: true },
  { id: "felt_spirit", text: "Did you feel the Spirit?", type: "yesno", field: "felt_spirit" },
  { id: "brightened_day", text: "Did you make Catherine's day bright?", type: "yesno", field: "brightened_day" },
  { id: "nolan_moment", text: "Tell me a Nolan moment:", type: "text", field: "nolan_moment", optional: true },
  { id: "daily_journal", text: "Daily journal entry (or skip):", type: "textarea", field: "daily_journal", optional: true },
];

export const WORK_QUESTIONS: Question[] = [
  { id: "work_done", text: "What did you do today?", type: "text", field: "work_done" },
  { id: "skill_edge", text: "What skill did you sharpen or edge did you increase?", type: "text", field: "skill_edge", optional: true },
  { id: "tomorrow_plan", text: "What do you want to do tomorrow?", type: "text", field: "tomorrow_plan", optional: true },
];

export const WEEK_QUESTIONS: Question[] = [
  // Constraints / Pain
  { id: "constraint", text: "What is the single constraint slowing progress the most?", type: "text", field: "constraint" },
  { id: "unlock", text: "What skill, tool, or decision would unlock the next level?", type: "text", field: "unlock" },
  { id: "avoiding", text: "What am I avoiding or pretending not to know?", type: "text", field: "avoiding" },
  { id: "repeating", text: "What did I repeat that clearly isn't working?", type: "text", field: "repeating", optional: true },
  // Systems
  { id: "systems_broke", text: "Where did my systems break down?", type: "text", field: "systems_broke", optional: true },
  { id: "small_tweak", text: "What small tweak would produce a big improvement?", type: "text", field: "small_tweak" },
  // Direction
  { id: "one_thing", text: "If I could only accomplish one thing next week, what would it be?", type: "text", field: "one_thing" },
  // Opportunity
  { id: "ignoring", text: "What opportunity am I ignoring?", type: "text", field: "ignoring", optional: true },
  { id: "cant_fail", text: "What would I do if I knew I couldn't fail?", type: "text", field: "cant_fail", optional: true },
  // Long-Term
  { id: "future_me", text: "What am I doing that future-me will thank me for — or regret?", type: "text", field: "future_me" },
];

export const MONTH_QUESTIONS: Question[] = [
  // Results & Signals
  { id: "three_wins", text: "What were the three biggest wins this month?", type: "text", field: "three_wins" },
  { id: "surprise", text: "What unexpected result or surprise taught me the most?", type: "text", field: "surprise" },
  // Patterns
  { id: "positive_habit", text: "What positive habit or behavior compounded this month?", type: "text", field: "positive_habit" },
  { id: "negative_pattern", text: "What negative pattern kept showing up?", type: "text", field: "negative_pattern" },
  // Resource Allocation
  { id: "highest_return", text: "Where did my time produce the highest return?", type: "text", field: "highest_return" },
  { id: "low_payoff", text: "Where did I spend time or energy with little payoff?", type: "text", field: "low_payoff" },
  // Strategic Direction
  { id: "more_investment", text: "What bet, project, or relationship deserves more investment next month?", type: "text", field: "more_investment" },
  { id: "stop_reduce", text: "What should I reduce, delegate, or stop entirely?", type: "text", field: "stop_reduce" },
  // Trajectory
  { id: "trajectory", text: "Am I closer to the life I want in 3–5 years? Why or why not?", type: "text", field: "trajectory" },
  // Focus
  { id: "clear_win", text: "What would make next month a clear win?", type: "text", field: "clear_win" },
];

export const RELATIONSHIP_QUESTIONS: Question[] = [
  { id: "best_moment", text: "What was your favorite moment we had together this month?", type: "text", field: "best_moment" },
  { id: "appreciation", text: "What is one thing Catherine did this month that meant a lot?", type: "text", field: "appreciation" },
  { id: "improvement", text: "What is one small thing we could do better next month as a team?", type: "text", field: "improvement" },
  { id: "logistics", text: "Is there anything stressing you out that we should solve together?", type: "text", field: "logistics", optional: true },
  { id: "looking_forward", text: "What is something fun or meaningful we should plan next month?", type: "text", field: "looking_forward" },
];

export const QUESTIONS = PERSONAL_QUESTIONS;

export function getNightcapQuestion(index: number): Question {
  const q = NIGHTCAP_QUESTIONS[index % NIGHTCAP_QUESTIONS.length];
  return { id: "nightcap_answer", text: q, type: "text", field: "nightcap_answer" };
}

export const MORNING_QUESTIONS: Question[] = [
  { id: "intention", text: "What is your intention for the day?", type: "text", field: "intention" },
  { id: "most_important", text: "What is the most important thing you are going to do?", type: "text", field: "most_important" },
];

export const TODO_QUESTIONS: Question[] = [
  { id: "todo_content", text: "What's the task?", type: "text", field: "todo_content" },
];

export const LOG_QUESTIONS: Question[] = [
  { id: "log_content", text: "What's on your mind?", type: "text", field: "log_content" },
];

export function getQuestionsForType(type: string, nightcapIndex?: number): Question[] {
  switch (type) {
    case "work": return WORK_QUESTIONS;
    case "week": return WEEK_QUESTIONS;
    case "month": return MONTH_QUESTIONS;
    case "relationship": return RELATIONSHIP_QUESTIONS;
    case "nightcap": return [getNightcapQuestion(nightcapIndex ?? 0)];
    case "morning": return MORNING_QUESTIONS;
    case "todo": return TODO_QUESTIONS;
    case "log": return LOG_QUESTIONS;
    default: return PERSONAL_QUESTIONS;
  }
}

export const NIGHTCAP_TOTAL = NIGHTCAP_QUESTIONS.length;

// Get questions with DB overrides applied
export async function getQuestionsForTypeFromDb(type: string, nightcapIndex?: number): Promise<Question[]> {
  const { getSetting } = await import("./db");
  const customQuestions = await getSetting(`questions_${type}`) as Question[] | null;
  if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
    return customQuestions;
  }
  return getQuestionsForType(type, nightcapIndex);
}
