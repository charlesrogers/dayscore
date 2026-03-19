import { sql } from "@vercel/postgres";
import { CheckIn, CheckInInput, Review, ReviewType } from "./types";

let initialized = false;

export async function initDb() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      weight DECIMAL(5,1),
      journaled BOOLEAN DEFAULT false,
      journal_detail TEXT,
      worked_out BOOLEAN DEFAULT false,
      workout_detail TEXT,
      built_shipped TEXT,
      felt_spirit BOOLEAN DEFAULT false,
      brightened_day BOOLEAN DEFAULT false,
      daily_journal TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE checkins ADD COLUMN IF NOT EXISTS nolan_moment TEXT`;
  await sql`ALTER TABLE checkins ADD COLUMN IF NOT EXISTS work_done TEXT`;
  await sql`ALTER TABLE checkins ADD COLUMN IF NOT EXISTS skill_edge TEXT`;
  await sql`ALTER TABLE checkins ADD COLUMN IF NOT EXISTS tomorrow_plan TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS conversation_state (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      channel_id TEXT NOT NULL,
      current_question_id TEXT NOT NULL,
      last_bot_message_id TEXT,
      answers JSONB DEFAULT '{}',
      status TEXT DEFAULT 'active',
      type TEXT DEFAULT 'personal',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE conversation_state ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'personal'`;
  // Allow multiple conversations per day (personal + work)
  // Drop the old unique constraint on date alone (try both possible names)
  try {
    await sql`ALTER TABLE conversation_state DROP CONSTRAINT IF EXISTS conversation_state_date_key`;
  } catch { /* constraint may not exist */ }
  try {
    await sql`DROP INDEX IF EXISTS conversation_state_date_key`;
  } catch { /* index may not exist */ }
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS conversation_state_date_type_key ON conversation_state(date, type)`;
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      type TEXT NOT NULL,
      answers JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS reviews_date_type_idx ON reviews(date DESC, type)`;
  await sql`
    CREATE TABLE IF NOT EXISTS nightcap_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_index INTEGER DEFAULT 0
    )
  `;
  await sql`INSERT INTO nightcap_state (id, current_index) VALUES (1, 0) ON CONFLICT (id) DO NOTHING`;
  initialized = true;
}

export async function getCheckin(date: string): Promise<CheckIn | null> {
  await initDb();
  const { rows } = await sql`
    SELECT * FROM checkins WHERE date = ${date}
  `;
  if (rows.length === 0) return null;
  return rowToCheckin(rows[0]);
}

export async function getCheckins(limit = 90): Promise<CheckIn[]> {
  await initDb();
  const { rows } = await sql`
    SELECT * FROM checkins ORDER BY date DESC LIMIT ${limit}
  `;
  return rows.map(rowToCheckin);
}

export async function upsertCheckin(data: CheckInInput): Promise<CheckIn> {
  await initDb();
  const { rows } = await sql`
    INSERT INTO checkins (date, weight, journaled, journal_detail, worked_out, workout_detail, built_shipped, felt_spirit, brightened_day, nolan_moment, daily_journal, work_done, skill_edge, tomorrow_plan)
    VALUES (${data.date}, ${data.weight}, ${data.journaled}, ${data.journal_detail}, ${data.worked_out}, ${data.workout_detail}, ${data.built_shipped}, ${data.felt_spirit}, ${data.brightened_day}, ${data.nolan_moment}, ${data.daily_journal}, ${data.work_done}, ${data.skill_edge}, ${data.tomorrow_plan})
    ON CONFLICT (date) DO UPDATE SET
      weight = COALESCE(EXCLUDED.weight, checkins.weight),
      journaled = CASE WHEN EXCLUDED.journaled THEN EXCLUDED.journaled ELSE checkins.journaled END,
      journal_detail = COALESCE(EXCLUDED.journal_detail, checkins.journal_detail),
      worked_out = CASE WHEN EXCLUDED.worked_out THEN EXCLUDED.worked_out ELSE checkins.worked_out END,
      workout_detail = COALESCE(EXCLUDED.workout_detail, checkins.workout_detail),
      built_shipped = COALESCE(EXCLUDED.built_shipped, checkins.built_shipped),
      felt_spirit = CASE WHEN EXCLUDED.felt_spirit THEN EXCLUDED.felt_spirit ELSE checkins.felt_spirit END,
      brightened_day = CASE WHEN EXCLUDED.brightened_day THEN EXCLUDED.brightened_day ELSE checkins.brightened_day END,
      nolan_moment = COALESCE(EXCLUDED.nolan_moment, checkins.nolan_moment),
      daily_journal = COALESCE(EXCLUDED.daily_journal, checkins.daily_journal),
      work_done = COALESCE(EXCLUDED.work_done, checkins.work_done),
      skill_edge = COALESCE(EXCLUDED.skill_edge, checkins.skill_edge),
      tomorrow_plan = COALESCE(EXCLUDED.tomorrow_plan, checkins.tomorrow_plan),
      updated_at = NOW()
    RETURNING *
  `;
  return rowToCheckin(rows[0]);
}

export async function updateJournal(date: string, journal: string): Promise<CheckIn> {
  await initDb();
  const { rows } = await sql`
    INSERT INTO checkins (date, daily_journal)
    VALUES (${date}, ${journal})
    ON CONFLICT (date) DO UPDATE SET
      daily_journal = EXCLUDED.daily_journal,
      updated_at = NOW()
    RETURNING *
  `;
  return rowToCheckin(rows[0]);
}

export async function saveReview(date: string, type: ReviewType, answers: Record<string, string>): Promise<Review> {
  await initDb();
  const { rows } = await sql`
    INSERT INTO reviews (date, type, answers)
    VALUES (${date}, ${type}, ${JSON.stringify(answers)})
    RETURNING *
  `;
  return rowToReview(rows[0]);
}

export async function getReviews(type: ReviewType, limit = 20): Promise<Review[]> {
  await initDb();
  const { rows } = await sql`
    SELECT * FROM reviews WHERE type = ${type} ORDER BY date DESC LIMIT ${limit}
  `;
  return rows.map(rowToReview);
}

export async function getNightcapIndex(): Promise<number> {
  await initDb();
  const { rows } = await sql`SELECT current_index FROM nightcap_state WHERE id = 1`;
  return rows[0]?.current_index ?? 0;
}

export async function advanceNightcapIndex(total: number): Promise<number> {
  await initDb();
  const { rows } = await sql`
    UPDATE nightcap_state SET current_index = (current_index + 1) % ${total} WHERE id = 1 RETURNING current_index
  `;
  return rows[0].current_index;
}

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as number,
    date: row.date instanceof Date
      ? row.date.toISOString().split("T")[0]
      : String(row.date).split("T")[0],
    type: row.type as ReviewType,
    answers: typeof row.answers === "string"
      ? JSON.parse(row.answers)
      : (row.answers as Record<string, string>) || {},
    created_at: row.created_at as string,
  };
}

function rowToCheckin(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as number,
    date: row.date instanceof Date
      ? row.date.toISOString().split("T")[0]
      : String(row.date).split("T")[0],
    weight: row.weight !== null ? Number(row.weight) : null,
    journaled: row.journaled as boolean,
    journal_detail: row.journal_detail as string | null,
    worked_out: row.worked_out as boolean,
    workout_detail: row.workout_detail as string | null,
    built_shipped: row.built_shipped as string | null,
    felt_spirit: row.felt_spirit as boolean,
    brightened_day: row.brightened_day as boolean,
    nolan_moment: row.nolan_moment as string | null,
    daily_journal: row.daily_journal as string | null,
    work_done: row.work_done as string | null,
    skill_edge: row.skill_edge as string | null,
    tomorrow_plan: row.tomorrow_plan as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
