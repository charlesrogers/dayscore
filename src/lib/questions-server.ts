import { Question } from "./types";
import { getQuestionsForType } from "./questions";
import { getSetting } from "./db";

/** Get questions with DB overrides applied — server-only */
export async function getQuestionsForTypeFromDb(type: string, nightcapIndex?: number): Promise<Question[]> {
  const customQuestions = await getSetting(`questions_${type}`) as Question[] | null;
  if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
    return customQuestions;
  }
  return getQuestionsForType(type, nightcapIndex);
}
