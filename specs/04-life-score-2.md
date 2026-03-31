# Spec: Life Score 2.0 — Multi-Framework Behavioral Scoring

## The Job
The current 0-6 score counts checkboxes. Did you work out? +1. Did you journal? +1. It treats a day where you crushed a workout, had a spiritual breakthrough, and built something meaningful the same as a day where you went for a walk, wrote "nothing" in the journal, and ticked "yes" on brightened_day without doing anything specific. Both score 6/6. The score is binary when life is continuous.

The job is to replace the checkbox counter with a multi-dimensional scoring system that tells you which parts of your life are thriving, which are coasting, and which are quietly declining — before you feel it.

---

## What RIGHT Looks Like

### The Four Dimensions

**Right**: The dashboard shows four independent scores, each 0-100, each telling a different story.

> **Body: 72** (up 8 from last month)
> You've worked out 18 of the last 30 days. Your weight has trended down 2.3 lbs over 6 weeks. Your workout descriptions mention intensity ("heavy squats," "ran 5k") 60% of the time vs. 30% a month ago.

> **Mind: 45** (down 12 from last month)
> You journaled 12 of 30 days (down from 22). Your built/shipped field has been empty 9 of the last 14 days. Your morning intentions have become less specific — average word count dropped from 12 to 6.

> **Spirit: 81** (stable)
> You felt the Spirit 24 of 30 days. Your journal entries mention gratitude, purpose, or service in 15 entries. Your nightcap answers in the Spiritual & Values category averaged 28 words (your highest category).

> **Heart: 63** (down 5 from last month)
> Brightened Catherine's day 19 of 30. Nolan moments logged 16 days. Your nightcap engagement is consistent but Catherine's day entries have been shorter than her baseline for 2 weeks.

**Right characteristics**:
- Each dimension has a number AND a narrative explanation
- The narrative references specific data, not vibes
- Trends are shown relative to the user's own history, not arbitrary benchmarks
- The four dimensions are independent — a high Body doesn't mask a low Mind

### Dimension Scoring Rubrics

Each dimension combines **frequency metrics** (things you can count) with **quality metrics** (things that require text analysis). The ratio should be roughly 60% frequency / 40% quality to start, shifting toward 50/50 as the text analysis improves.

#### Body (0-100)

**Frequency signals** (60 points):
- Workout consistency: days worked out / days in period. 0 days = 0, 30/30 = 30 points. Linear scale.
- Weight tracking consistency: days weight logged / days in period. 0 = 0, 30/30 = 10 points.
- Weight trajectory: trending toward goal = 20 points, stable = 10, trending away = 0. (Requires a goal weight to be set, or defaults to "downward is positive" based on user preference.)

**Quality signals** (40 points):
- Workout intensity: LLM classification of workout_detail text. "Walked for 20 min" = low (5 pts). "Heavy squat day, hit a PR on bench" = high (20 pts). Scale: 0-20 pts.
- Workout variety: number of distinct workout types mentioned in trailing 30 days. 1 type = 5 pts, 2-3 = 10 pts, 4+ = 20 pts. (Prevents "walked every day" from scoring the same as a varied program.)

#### Mind (0-100)

**Frequency signals** (60 points):
- Journal consistency: days journaled / days in period. 30/30 = 20 points.
- Built/shipped: days with non-empty built_shipped / days in period. 30/30 = 20 points.
- Morning intention set: days with morning check-in / days in period. 30/30 = 10 points.
- Skill/edge logged: days with skill_edge / work days in period. 10 points.

**Quality signals** (40 points):
- Journal depth: average word count + emotional vocabulary density of daily_journal entries. Short perfunctory entries score low. Detailed reflective entries score high. 0-20 points.
- Build quality: LLM classification of built_shipped entries. "Fixed a bug" = maintenance (5 pts). "Shipped the new scoring engine with 4 dimension model" = creation (20 pts). 0-20 points.

#### Spirit (0-100)

**Frequency signals** (60 points):
- Felt the Spirit: days marked true / days in period. 30/30 = 30 points.
- Spiritual mentions in journal: days where journal text mentions spiritual themes / days journaled. 0-15 points.
- Nightcap spiritual category engagement: answered Spiritual & Values questions with >10 words / total spiritual questions asked. 0-15 points.

**Quality signals** (40 points):
- Journal spiritual depth: when spiritual themes appear in journals, how deep do they go? "Felt peaceful" = surface (5 pts). "During prayer I realized I've been holding onto resentment about X and I need to let it go" = deep (20 pts). 0-20 points.
- Review spiritual reflection: depth of answers to "what am I doing that future-me will thank me for?" and related review questions. 0-20 points.

#### Heart (0-100)

**Frequency signals** (60 points):
- Brightened Catherine's day: days marked true / days in period. 30/30 = 25 points.
- Nolan moments logged: days with non-empty nolan_moment / days in period. 30/30 = 15 points.
- Nightcap completion (both answered): nights where both Charles and Catherine answered / total nightcaps. 0-20 points.

**Quality signals** (40 points):
- Nolan moment richness: average word count + specificity of nolan_moment entries. "He was cute" = low (5 pts). "He grabbed my hand at the store and said 'daddy come, I show you something' and led me to the fish tank" = high (20 pts). 0-20 points.
- Nightcap answer engagement: average depth score across relationship-relevant nightcap categories (gratitude, memories, team, intimacy, about each other). 0-20 points.

### Momentum Indicators

**Right**: Each dimension shows not just WHERE you are but WHERE you're GOING.

> **Body: 72** ↑ Accelerating
> 7-day: 78 | 30-day: 72 | 90-day: 64
> You're above your 30-day average and pulling away. This is the strongest Body trajectory in 3 months.

> **Mind: 45** ↓ Decelerating
> 7-day: 38 | 30-day: 45 | 90-day: 58
> Your 7-day is below your 30-day, which is below your 90-day. This is a sustained decline, not a blip.

**Right characteristics**:
- Three time horizons: 7-day, 30-day, 90-day
- Momentum is the RELATIONSHIP between time horizons, not the absolute numbers
- Accelerating: 7-day > 30-day > 90-day (all trending up)
- Decelerating: 7-day < 30-day < 90-day (all trending down)
- Mixed: some up, some down (transitional)

### Adaptive Baselines

**Right**: The system knows what's normal FOR YOU and flags deviations.

> "Your Mind score of 45 is 1.3 standard deviations below your 90-day mean of 62. This is in your bottom 10% of months."

> "Your Spirit score of 81 is 0.4 standard deviations above your mean. This is your normal range — you're consistently strong here."

**Right characteristics**:
- Z-scores personalized to your data, not population norms
- Requires minimum 60 days of data before adaptive baselines activate
- Shows "below your normal" / "in your range" / "above your normal" in plain English
- The insight is in the deviation, not the score itself

### Cross-Dimension Alerts

**Right**: When dimension scores move in predictable patterns, flag it early.

> "Your Body score has dropped for 3 consecutive weeks. In the past, when Body drops below 50 and stays there for 2+ weeks, your Mind score follows within 10 days. Your current Mind score is 58 and declining."

**Right characteristics**:
- Based on YOUR historical correlations, not generic assumptions
- Only triggers when the pattern has been observed 3+ times
- Includes the lag time ("within 10 days") so you know the urgency
- Suggests intervention: "Breaking the Body decline now may prevent the Mind cascade."

---

## What WRONG Looks Like

### The Vanity Score
**Wrong**: A single "Life Score: 73" that combines everything into one number and shows it prominently.

Why it's wrong: The whole point is that life is multi-dimensional. A single score hides the imbalance. Someone scoring 73 with [Body: 95, Mind: 90, Spirit: 80, Heart: 27] is in serious trouble that a "73" masks. The dimensions ARE the insight.

### The Binary Upgrade
**Wrong**: Taking the existing 6 checkboxes and mapping them to 0-100 scales. "Worked out = 100, didn't work out = 0."

Why it's wrong: This is just the current system with wider numbers. The quality signals are what make this different. Working out matters, but HOW you work out (intensity, variety, consistency) matters more. The 0-100 scale is only valuable if it captures gradations that the binary couldn't.

### The Text Score That's Wrong
**Wrong**: LLM rates a journal entry about a difficult day as "low quality" because it's short and negative.

Why it's wrong: A short, honest entry about struggle is more valuable than a long, performative entry about gratitude. The depth metric must value HONESTY and SPECIFICITY, not positivity or length. "I failed today and I know why" should score higher on depth than "Had a great day! Everything was awesome! So blessed!"

### The Gameable System
**Wrong**: User learns that writing 30+ words in the journal gets max Mind points, so they start padding entries.

Why it's wrong: Goodhart's Law — when a measure becomes a target, it ceases to be a good measure. Fix: the quality signals should be harder to game than word count. Depth scoring should reward specificity and self-disclosure, not volume. Mix in frequency metrics so no single input dominates.

### The Cold Start Problem
**Wrong**: User gets Day 1 scores of [Body: 12, Mind: 8, Spirit: 5, Heart: 15] because they have almost no data.

Why it's wrong: Scores from 1-2 data points are meaningless and demoralizing. Fix: show "Not enough data yet" until minimum thresholds are met (e.g., 14 days for frequency metrics, 30 days for quality metrics). Display a progress bar toward "score activation" instead.

### The Arbitrary Weights
**Wrong**: Body frequency is worth 60 points because the developer thought that seemed right.

Why it's wrong: The weights should be calibrated against the user's own data over time. Start with reasonable defaults, but provide a mechanism to adjust. Some people care more about Spirit than Body. The system should eventually learn which dimensions the user responds to most and weight accordingly — or at minimum let them set their own weights.

---

## Technical Spec

### Scoring Engine

New file: `src/lib/scoring.ts`

```typescript
interface DimensionScore {
  dimension: 'body' | 'mind' | 'spirit' | 'heart';
  score: number;           // 0-100
  frequency_score: number; // 0-60
  quality_score: number;   // 0-40
  momentum: 'accelerating' | 'decelerating' | 'stable' | 'mixed';
  seven_day: number;
  thirty_day: number;
  ninety_day: number;
  z_score: number | null;  // null if < 60 days data
  trend: 'up' | 'down' | 'stable';
}

interface LifeScore {
  date: string;
  dimensions: DimensionScore[];
  legacy_score: number;    // keep the 0-6 for backward compat
  alerts: CrossDimensionAlert[];
}
```

### Database

```sql
CREATE TABLE dimension_scores (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  dimension TEXT NOT NULL,           -- 'body', 'mind', 'spirit', 'heart'
  score DECIMAL NOT NULL,
  frequency_score DECIMAL NOT NULL,
  quality_score DECIMAL NOT NULL,
  seven_day_avg DECIMAL,
  thirty_day_avg DECIMAL,
  ninety_day_avg DECIMAL,
  z_score DECIMAL,
  components JSONB NOT NULL,         -- breakdown: { workout_consistency: 24, weight_trend: 15, ... }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, dimension)
);

CREATE TABLE quality_analyses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  source_field TEXT NOT NULL,        -- 'workout_detail', 'daily_journal', 'nolan_moment', etc.
  analysis_type TEXT NOT NULL,       -- 'intensity', 'depth', 'richness', 'spiritual_depth'
  score DECIMAL NOT NULL,            -- 0-1 normalized
  raw_response JSONB,                -- LLM response for debugging
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Computation Pipeline

**Daily scoring job** (cron, 11:30pm MT — after typical check-in completion):

1. **Gather today's raw data**: checkin fields, review answers, nightcap answers, morning data
2. **Compute frequency metrics**: pure SQL aggregations over trailing windows
3. **Compute quality metrics**:
   - For each text field that has new content today, call Claude API with scoring rubric
   - Cache result in `quality_analyses` table
   - Batch all fields into one API call to minimize cost (~$0.02/day)
4. **Combine into dimension scores**: weighted sum of frequency + quality
5. **Compute trailing averages**: 7, 30, 90 day windows from `dimension_scores` table
6. **Compute z-scores**: if 60+ days of data exist, calculate mean and stddev per dimension
7. **Check for cross-dimension alerts**: compare current trajectories against historical correlation patterns
8. **Store in `dimension_scores`**

### Quality Analysis Prompt Template

One Claude API call per day, batching all text fields:

```
Analyze the following daily entries for quality scoring. For each field, provide a score from 0 to 1.

WORKOUT_DETAIL: "{workout_detail}"
Score for: intensity (0 = passive/easy, 1 = high effort/specific program)
Score for: variety (0 = same as always, 1 = new or varied)

DAILY_JOURNAL: "{daily_journal}"
Score for: depth (0 = surface/perfunctory, 1 = vulnerable/specific/reflective)
Score for: spiritual_themes (0 = no spiritual content, 1 = deep spiritual reflection)

BUILT_SHIPPED: "{built_shipped}"
Score for: creation_level (0 = maintenance/fix, 1 = substantial new creation)

NOLAN_MOMENT: "{nolan_moment}"
Score for: richness (0 = generic, 1 = specific memorable moment with sensory detail)

Respond as JSON: { "workout_intensity": 0.7, "workout_variety": 0.3, ... }
```

### Dashboard Changes

**Replace current stats cards** with dimension display:
- 4 dimension cards with score, trend arrow, momentum label
- Click to expand: shows frequency/quality breakdown + trailing averages
- Keep legacy 0-6 score visible but de-emphasized ("Simple score: 4/6")

**Replace or supplement weight chart** with:
- Radar chart showing 4 dimensions (current score)
- Small multiples: 4 sparklines showing each dimension over 90 days

### Migration Strategy

1. Keep `calculateScore()` working — don't break the existing system
2. Add dimension scoring as a parallel system
3. Show both on dashboard during transition
4. After 30 days of dimension data, promote dimensions to primary, demote 0-6 to secondary
5. Never remove the 0-6 — it's useful as a quick gut-check

### What to Build First (MVP)

1. Frequency-only dimension scores (no text analysis). This is pure SQL.
2. Dashboard cards showing 4 dimensions with trailing averages
3. Add text quality analysis via Claude API
4. Add momentum indicators
5. Add z-scores (after 60 days of data)
6. Add cross-dimension alerts (after 90 days of data)

### API Cost
- Quality analysis: 1 Claude call/day, ~$0.02/day = ~$0.60/month
- Scoring computation: pure SQL/math, no API cost
- **Monthly total: ~$0.60/month**

---

## Failure Modes to Guard Against

1. **The Dashboard Addiction**: Checking scores 5x/day, optimizing for the number instead of living. Fix: scores update once daily at 11:30pm. No real-time scoring.
2. **The Quality Scoring Inconsistency**: LLM gives different scores for similar entries on different days. Fix: include 2-3 calibration examples in every prompt. Track scoring variance. If variance is too high, fall back to heuristics.
3. **The Missing Data Penalty**: A day where you didn't check in scores 0 across all dimensions, tanking your averages. Fix: only score days where a check-in was submitted. Missing days don't count against you — they just don't count.
4. **The Spiritual Measurement Problem**: Quantifying spiritual experience is inherently reductive. Fix: Spirit dimension should lean heavily on frequency (felt_spirit days) and let quality scoring be gentle. "Did you have a spiritual experience?" is answerable. "How deep was it?" is fraught.
5. **The Comparison Trap**: "My Heart was 63 last month and 65 this month — am I improving?" when the difference is noise. Fix: show confidence intervals. A 2-point change on a 0-100 scale with 30 data points is statistically meaningless. Only highlight changes that are >1 standard deviation.
