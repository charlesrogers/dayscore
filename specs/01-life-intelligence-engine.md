# Spec: The Life Intelligence Engine

## The Job
Transform DayScore from a data recorder into a life advisor. The system reads everything you've written — journals, Nolan moments, nightcap answers, review reflections, morning intentions, work entries, logs — and produces intelligence that you couldn't generate yourself even if you re-read every entry.

---

## What RIGHT Looks Like

### The Weekly Intelligence Brief

**Right**: The brief reads like a letter from a sharp friend who's been watching your life for months. It connects dots across dimensions.

> "This week your journals mentioned 'deadline' or 'behind' 4 times. The last time you had a cluster like this was Feb 3-9. That week you broke through by shipping the CritterScout MVP on Wednesday — a small, concrete deliverable that reset your momentum. Your built/shipped field has been empty for 5 days. Consider picking the smallest shippable thing tomorrow."

> "You worked out 6/7 days this week (up from 2/7 last week). Historically, when your workout streak hits 7+, your Spirit score in the following week averages 0.85 vs. 0.42 baseline. Something about physical consistency opens the spiritual channel for you."

> "Catherine's nightcap entries were 40% shorter than her 30-day average this week. The last time this happened (Jan 12-18), your relationship review two weeks later flagged 'feeling disconnected.' You might not need to wait for the review to have that conversation."

**Right characteristics**:
- References specific dates, specific entries, specific numbers
- Makes cross-dimensional connections (workout → spirit, Catherine's entries → relationship review)
- Suggests concrete actions grounded in YOUR past behavior, not generic advice
- Distinguishes between signal and noise — doesn't alarm on one-off events
- Gets shorter and more precise over time as it learns what you respond to
- Reads in under 2 minutes

### The Morning Brief

**Right**: When you type `!morning`, before asking your intention question, you get 2-3 sentences of intelligence that actually change what you do today.

> "Yesterday your #1 priority was 'finish the auth middleware' but your journal entry was about GunDealAlerts. Your follow-through on technical priorities drops to 30% on days after nightcap conversations about parenting. Today's a good day to pick a priority you'll actually do."

> "You're on a 4-day workout streak. You've never broken a streak on a Saturday — your Saturday completion rate is 100%. Lean into that."

**Right characteristics**:
- 2-3 sentences max. Not a wall of text at 7am.
- Actionable — changes what you set as your intention
- Grounded in yesterday's actual data + historical patterns
- Occasionally surfaces nothing ("No patterns to flag today. What's your intention?")

### Pattern Detection

**Right**: Discovers non-obvious relationships that survive statistical scrutiny.

> Pattern: "When you journal about gratitude (detected in 23 entries), your next-day score averages 4.8 vs. 3.2 on non-gratitude journal days. Confidence: high (p < 0.01)."

> Pattern: "Your weight trends downward in weeks where you log a Nolan moment 4+ times. This has held across 8 qualifying weeks."

**Right characteristics**:
- Shows confidence level — distinguishes strong patterns from weak ones
- Requires minimum sample size before reporting (no "you did X twice and Y happened both times")
- Updates as new data invalidates old patterns
- Groups patterns by dimension (Body, Mind, Spirit, Heart) for scannability

### Blind Spot Reports

**Right**: Finds contradictions between what you say in reviews and what your data shows.

> "In your March monthly review, you said your biggest win was 'being more present with Nolan.' But your Nolan moment field was filled only 8/31 days (down from 15/28 in February). Your definition of 'present' may not include capturing the moment."

> "Your weekly reviews consistently name 'systems' as a breakdown area, but you've never logged a 'built/shipped' entry that mentions systems or automation. You're diagnosing the problem but not allocating work to fix it."

**Right characteristics**:
- Not judgmental — presents the contradiction and lets you interpret
- References the actual review text alongside the actual data
- Only surfaces genuine contradictions, not nitpicks

---

## What WRONG Looks Like

### Generic AI Summaries
**Wrong**: "This week you had a productive week! You journaled 5 times, worked out 4 times, and felt the Spirit 3 times. Keep up the great work!"

Why it's wrong: This is just the current digest with friendlier language. No insight. No cross-dimensional connection. No historical context. A SQL query could produce this.

### Hallucinated Patterns
**Wrong**: "I notice you tend to feel more spiritual on Tuesdays." (Based on 3 data points, two of which were coincidence.)

Why it's wrong: Small sample size presented with false confidence. The system must enforce minimum evidence thresholds. A pattern from 3 occurrences is a hypothesis, not an insight.

### Therapy Bot
**Wrong**: "It sounds like you might be experiencing burnout. Have you considered talking to a professional about your feelings of being overwhelmed?"

Why it's wrong: DayScore is a pattern detection engine, not a therapist. It surfaces data and connections. It doesn't diagnose, prescribe, or psychoanalyze. The tone should be "here's what your data shows" not "here's what I think you should feel."

### Information Overload
**Wrong**: A 2000-word weekly brief covering every possible angle with 15 patterns and 8 suggestions.

Why it's wrong: Violates the single decision surface principle. The brief should be 300-500 words max. 2-3 main insights. If everything is highlighted, nothing is.

### Stale Intelligence
**Wrong**: Surfacing the same pattern every week because it's statistically significant but you've already acted on it.

Why it's wrong: The system must track which insights have been surfaced and whether behavior changed afterward. If you read "your workouts correlate with Spirit" and then maintained workouts for 6 weeks, stop telling them. Surface the next thing.

### Privacy Violation by Architecture
**Wrong**: Sending all journal text to a third-party API without explicit data handling.

Why it's wrong: This data includes spiritual reflections, relationship dynamics, parenting struggles. The architecture must be clear about what goes where. Claude API calls should use ephemeral mode. No training on user data. Embeddings stored locally in Postgres, not a third-party vector DB.

---

## Technical Spec

### Data Pipeline

**Step 1: Text Extraction** (nightly cron, ~11pm MT)
- Query all entries from the last 24 hours across: checkins (journal, nolan_moment, workout_detail, journal_detail, built_shipped), reviews (all answer fields), nightcap (day_charles, day_catherine, nightcap_answer), morning (intention, most_important), logs, todos
- Normalize into a unified `text_entries` format: `{ date, source_type, source_field, content, word_count }`

**Step 2: Embedding Generation** (same cron)
- For each new text entry, generate embedding via Claude API (or OpenAI embeddings endpoint — cheaper)
- Store in `embeddings` table: `{ id, entry_date, source_type, source_field, content_hash, embedding_vector, created_at }`
- Use pgvector extension for Postgres (Vercel Postgres supports this)
- Skip entries under 5 words (skip answers, single-word responses)

**Step 3: Weekly Analysis** (Sunday 8:30am MT, before current digest at 9am)
- Gather this week's structured data (scores, booleans, weights)
- Gather this week's text entries
- Vector search for historically similar weeks (by embedding similarity of journal entries)
- Build a curated prompt with:
  - This week's raw data
  - Last week's data (for comparison)
  - 2-3 historically similar periods
  - Any active patterns from `patterns` table
  - Recent review answers
- Call Claude API with structured output format
- Parse response into `insights` table: `{ id, date, type, title, body, dimension, confidence, surfaced, acted_on, created_at }`
- Send top 2-3 insights as Discord weekly brief

**Step 4: Morning Brief** (daily, part of `!morning` or 7am auto)
- Lightweight — no embedding search
- Gather: yesterday's check-in, this morning's context, last 3 mornings' intentions + outcomes
- If Intention-Outcome Engine exists: include follow-through rate
- Call Claude API with small context (~2000 tokens)
- Prepend 2-3 sentence brief before the morning questions

### Database Schema

```sql
-- pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE text_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL,
  source_type TEXT NOT NULL,  -- 'checkin', 'review', 'nightcap', 'morning', 'log'
  source_field TEXT NOT NULL, -- 'daily_journal', 'nolan_moment', 'day_charles', etc.
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  text_entry_id INTEGER REFERENCES text_entries(id),
  embedding vector(1536),  -- OpenAI ada-002 dimension, or adjust for Claude
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insights (
  id SERIAL PRIMARY KEY,
  generated_date DATE NOT NULL,
  type TEXT NOT NULL,        -- 'weekly_brief', 'morning_brief', 'pattern', 'blind_spot'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  dimension TEXT,            -- 'body', 'mind', 'spirit', 'heart', null for cross-dimensional
  confidence TEXT,           -- 'high', 'medium', 'low'
  surfaced BOOLEAN DEFAULT false,
  acted_on BOOLEAN DEFAULT null,
  expires_at DATE,           -- patterns can expire if data invalidates them
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX embeddings_vector_idx ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

### API Cost Estimate
- Embedding generation: ~$0.01/day (small text volumes)
- Weekly analysis: ~$0.05-0.15/week (one large Claude call)
- Morning brief: ~$0.01-0.02/day (small Claude call)
- **Monthly total: ~$1-3/month**

### What to Build First (MVP)
1. Text extraction pipeline (nightly cron)
2. Weekly analysis with Claude API (no embeddings yet — just this week's data + last week)
3. Replace current digest with intelligence brief
4. Add embeddings + historical similarity search in v2
5. Add morning brief in v3
6. Add pattern tracking + blind spot reports in v4

---

## Failure Modes to Guard Against

1. **The Oracle Trap**: System sounds confident about everything. Fix: require minimum evidence thresholds, always show sample size.
2. **The Notification Fatigue**: Too many insights, user stops reading. Fix: cap at 3 insights per brief, track read/engagement.
3. **The Echo Chamber**: System only confirms what user already believes. Fix: specifically look for contradictions between stated beliefs (reviews) and revealed behavior (data).
4. **The Recency Trap**: Over-weighting this week, under-weighting 6-month trends. Fix: always include both timeframes.
5. **The Creep Factor**: Insights feel invasive rather than helpful. Fix: tone calibration — present as "your data shows" not "I've been watching you." User controls what data feeds the engine.
