import { getAllSettings, setSetting, initDb } from "@/lib/db";
import {
  PERSONAL_QUESTIONS,
  WORK_QUESTIONS,
  WEEK_QUESTIONS,
  MONTH_QUESTIONS,
  RELATIONSHIP_QUESTIONS,
} from "@/lib/questions";

const DEFAULT_QUESTIONS: Record<string, unknown> = {
  questions_personal: PERSONAL_QUESTIONS,
  questions_work: WORK_QUESTIONS,
  questions_week: WEEK_QUESTIONS,
  questions_month: MONTH_QUESTIONS,
  questions_relationship: RELATIONSHIP_QUESTIONS,
};

const SCHEDULE = {
  personal: { time: "9:00 PM", days: "Daily" },
  work: { time: "5:00 PM", days: "Daily" },
  nightcap: { time: "10:00 PM", days: "Daily" },
  week: { time: "9:30 AM", days: "Sunday" },
  month: { time: "9:30 AM", days: "Sunday" },
  relationship: { time: "7:00 PM", days: "Sunday" },
};

export async function GET() {
  try {
    await initDb();
    const saved = await getAllSettings();

    // Merge defaults with saved
    const questions: Record<string, unknown> = {};
    for (const [key, defaultVal] of Object.entries(DEFAULT_QUESTIONS)) {
      questions[key] = saved[key] ?? defaultVal;
    }

    return Response.json({ questions, schedule: SCHEDULE });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = (await request.json()) as { key: string; value: unknown };

    if (!key.startsWith("questions_")) {
      return Response.json({ error: "Can only update question sets" }, { status: 400 });
    }

    await initDb();
    await setSetting(key, value);
    return Response.json({ ok: true, key });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
