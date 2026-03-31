# Spec: The Relationship Intelligence System

## The Job
You and Catherine answer nightcap questions every night. You do relationship reviews monthly. You track "brightened Catherine's day" daily. This is an extraordinary longitudinal dataset about a marriage — and right now it goes into a table and never comes out. The job is to turn nightly conversations into a relationship health dashboard that surfaces what's working, what's drifting, and what to pay attention to next.

---

## What RIGHT Looks Like

### The Relationship Dashboard

**Right**: A single page (`/relationship`) that shows relationship health at a glance across multiple dimensions, with depth available on click.

**Header**: Relationship pulse — not a single score, but a set of indicators like a cockpit.

> **Connection**: Strong (trending up)
> **Depth**: Moderate (stable)
> **Fun**: Low (trending down)
> **Attunement**: Strong (stable)
> **Appreciation**: Very Strong (trending up)

Each pillar is a colored indicator (green/yellow/red) with a trend arrow. Click any pillar to see the underlying data.

**Right characteristics**:
- No single "relationship score." Relationships aren't unidimensional. A couple can be deeply connected emotionally but haven't had fun together in months. Both things are true.
- Pillars are scored from actual data, not self-report. "Connection" comes from nightcap engagement + brightened_day frequency. "Fun" comes from nightcap answers in the Fun & Hypotheticals category + relationship review "favorite moments." "Depth" comes from answer length + emotional vocabulary density.
- Trends matter more than absolute scores. A "Moderate" that's been climbing for 6 weeks is better than a "Strong" that's been declining.

### Pillar Definitions and Data Sources

**Connection** (are you showing up for each other daily?)
- Data: brightened_day boolean frequency, nightcap completion rate (both answer vs. one skips), day entry length for both Charles and Catherine
- What it measures: The consistency of daily investment in the relationship
- Leading indicator: If connection drops, other pillars follow within 2-3 weeks

**Depth** (are your conversations going below the surface?)
- Data: Nightcap answer word count, emotional vocabulary density (words like "grateful," "frustrated," "hopeful," "worried" vs. surface words like "fine," "good," "okay"), follow-up elaboration
- What it measures: Whether nightly conversations are genuine or perfunctory
- Right: Distinguishes between a long rambling answer and a short but deeply honest one. Word count alone is a bad proxy. "Fine" is 1 word but tells you nothing. "I felt dismissed today and I'm still processing it" is 10 words but profoundly deep.

**Fun** (are you laughing together?)
- Data: Nightcap answers to Fun & Hypotheticals questions (category 96-115), Ridiculous Scenarios (186-195), Ridiculous Choices (206-215), relationship review "favorite moment" and "something fun to plan" fields
- What it measures: The lightness and play in the relationship
- Insight: Fun is the canary in the coal mine. When couples stop having fun, it's usually because other pressures are squeezing out discretionary time together.

**Attunement** (do you know what the other person is going through?)
- Data: When Catherine mentions something in her day entry, does Charles's next-day behavior reflect awareness of it? When the Emotional Check-In questions (30-47) come up, do answers reference the other person's state?
- What it measures: Whether you're tracking each other's emotional weather
- Hardest to measure: Requires semantic analysis of cross-references between his and her entries

**Appreciation** (are you noticing and naming what the other person does?)
- Data: Nightcap Gratitude & Appreciation answers (1-19), brightened_day, relationship review "appreciation" field, About Each Other questions (226-235)
- What it measures: The ratio of positive to negative mentions of each other
- Research-backed: Gottman's 5:1 ratio of positive to negative interactions predicts relationship stability

### His & Hers Day Tracking

**Right**: Side-by-side view of Charles's and Catherine's nightly "tell me about your day" entries over time.

> **This Week**
> | Day | Charles | Catherine |
> |-----|---------|-----------|
> | Mon | "Shipped the new settings page, felt productive. Nolan said 'daddy watch' 50 times." (23 words) | "Long day. Meetings back to back. Nolan was clingy at pickup." (11 words) |
> | Tue | "Slow start but finished the auth refactor finally. Went for a run." (12 words) | "Better today. Had lunch with Sarah. Nolan tried broccoli!!" (9 words) |
>
> **Sentiment this week**: Charles: Positive (avg). Catherine: Mixed → Positive (improving).
> **Length trend**: Charles averaging 15 words (baseline: 18). Catherine averaging 10 words (baseline: 14). Both slightly below average.

**Right characteristics**:
- Shows the raw data side by side — you can read the actual entries
- Adds lightweight analysis (sentiment, length vs. baseline) without replacing the entries
- Tracks per-person trends. Catherine's entries getting shorter doesn't necessarily mean anything — unless it correlates with other signals.
- Never compares the two in a competitive way ("Charles wrote more than Catherine")

### Drift Detection

**Right**: Automated alerts when relationship patterns shift.

> "You haven't discussed anything in the Dreams & the Future nightcap category in 8 weeks (since question #52 on Jan 15). The last time there was a gap this long, your March monthly review mentioned 'feeling like we're in maintenance mode.' The next Dreams question comes up in 3 nightcaps."

> "Your 'brightened Catherine's day' rate dropped from 85% (Jan) to 60% (Feb) to 45% (March). This is the lowest 30-day rate since tracking began."

**Right characteristics**:
- References specific data points (dates, categories, frequencies)
- Connects the drift to what happened last time (if applicable)
- Includes a "what's coming" element when possible (next relevant question in rotation)
- Doesn't alarm on 1-week dips — requires sustained trend (3+ weeks)

### Anniversary Intelligence

**Right**: On the anniversary of a nightcap answer, surface it.

> "One year ago tonight, Catherine answered 'What's a dream you haven't told me about yet?': 'I want us to take Nolan to the coast for a full week, just the three of us, no laptops.' Has this happened yet?"

**Right characteristics**:
- Warm, specific, grounded in their actual words
- Occasionally prompts action ("has this happened yet?")
- Only surfaces meaningful entries (long answers, emotional content), not "eh, nothing much today"

---

## What WRONG Looks Like

### The Relationship Score
**Wrong**: "Your Relationship Score is 73/100. Down 4 points from last week."

Why it's wrong: A single number for a relationship is reductive to the point of being harmful. What does 73 mean? Is it good? Bad? Compared to what? A relationship with incredible depth but no fun would score the same as one with tons of fun but no depth. The insight is in the dimensions, not the aggregate.

### The Blame Engine
**Wrong**: "Catherine's entries are shorter than yours this week. She may be disengaged."

Why it's wrong: Attributing meaning to one person's behavior without context is dangerous. Short entries might mean she's exhausted, busy, or typing on a small screen. The system should present the data ("Catherine's entries are shorter than her baseline") without assigning causation or blame.

### The Pop Psychology Engine
**Wrong**: "According to attachment theory, your avoidant patterns suggest..."

Why it's wrong: DayScore is not a therapist. It doesn't diagnose attachment styles, love languages, or personality types. It surfaces YOUR data and YOUR patterns. "Your appreciation entries are 3x more frequent than Catherine's" is data. "You have different love languages" is a diagnosis the system is not qualified to make.

### The Surveillance Tool
**Wrong**: Detailed tracking of Catherine's emotional state with alerts to Charles about her behavior.

Why it's wrong: This is a SHARED tool for a couple. It should never feel like one person is monitoring the other. Both people's data should be presented symmetrically. Insights should be about "us" not "her." The question is always "what can WE do" not "what should SHE do."

### Over-Analyzing Noise
**Wrong**: "Catherine used the word 'fine' 3 times this week. Research shows 'fine' is often a mask for deeper emotions."

Why it's wrong: Micro-analyzing individual word choices in casual daily entries is paranoia, not intelligence. The system should track TRENDS over weeks and months, not dissect individual word choices. Noise at the daily level is signal at the monthly level.

### Comparing to Norms
**Wrong**: "The average couple discusses intimacy topics 2.3 times per month. You discussed them 1 time."

Why it's wrong: There are no norms here. This is YOUR relationship tracked over YOUR time. Comparisons should be internal (you vs. your own baseline) not external (you vs. some aggregate).

---

## Technical Spec

### Nightcap Category Mapping

The 245 nightcap questions are already organized into categories in `nightcap-questions.ts` via comments. Formalize this:

```sql
CREATE TABLE nightcap_categories (
  question_index INTEGER PRIMARY KEY,  -- 0-244
  category TEXT NOT NULL,              -- 'gratitude', 'daily_life', 'emotional', 'dreams', 'memories', 'parenting', 'fun', 'spiritual', 'growth', 'team', 'intimacy', 'ridiculous', 'which_one', 'choices', 'funny', 'about_each_other', 'close_day'
  pillar TEXT NOT NULL                 -- 'connection', 'depth', 'fun', 'attunement', 'appreciation'
);
```

Map each category to a pillar:
- gratitude, about_each_other → appreciation
- daily_life, emotional → attunement
- dreams, growth, spiritual → depth
- fun, ridiculous, which_one, choices, funny → fun
- memories, parenting, team, intimacy, close_day → connection

### Answer Analysis

For each nightcap answer, compute:

```sql
CREATE TABLE nightcap_analysis (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id),
  entry_date DATE NOT NULL,
  person TEXT NOT NULL,              -- 'charles' or 'catherine'
  field TEXT NOT NULL,               -- 'day_charles', 'day_catherine', 'nightcap_answer'
  word_count INTEGER,
  sentiment DECIMAL,                 -- -1 to 1
  depth_score DECIMAL,               -- 0 to 1 (surface vs. vulnerable)
  category TEXT,                     -- nightcap category (for nightcap_answer only)
  pillar TEXT,                       -- which relationship pillar this feeds
  themes TEXT[],                     -- extracted themes: ['work_stress', 'nolan', 'gratitude']
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Depth scoring heuristic** (refined over time):
- Word count baseline: < 5 words = low, 5-20 = medium, 20+ = high
- Emotional vocabulary: count of emotion words / total words
- Self-disclosure markers: "I feel", "I'm worried", "I realized", "I love"
- Specificity: named events, people, or feelings vs. generic responses
- Use Claude API for nuanced scoring with a rubric

### Pillar Scoring

Weekly rollup job (Sunday, before digest):

```sql
CREATE TABLE relationship_pillars (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  pillar TEXT NOT NULL,
  score DECIMAL NOT NULL,            -- 0-100
  trend TEXT NOT NULL,               -- 'up', 'down', 'stable'
  trend_magnitude DECIMAL,          -- how much change from last week
  data_points INTEGER,              -- how many entries fed this score
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Pillar score computation:
- **Connection**: `(brightened_day_rate * 30) + (nightcap_completion_rate * 30) + (avg_day_entry_length_normalized * 20) + (both_answered_rate * 20)`
- **Depth**: `(avg_depth_score * 50) + (emotional_vocab_density * 30) + (avg_word_count_normalized * 20)`
- **Fun**: `(fun_category_depth_avg * 50) + (fun_category_frequency * 30) + (relationship_review_fun_score * 20)`
- **Attunement**: `(emotional_checkin_depth * 40) + (cross_reference_score * 30) + (day_sentiment_tracking * 30)`
- **Appreciation**: `(appreciation_category_depth * 40) + (brightened_day_rate * 30) + (positive_mention_ratio * 30)`

Trend: compare this week's score to 4-week trailing average. >5 points = up/down. <=5 = stable.

### Drift Detection

Nightly check (lightweight):
- For each pillar, check if trailing 3-week score is >15 points below 12-week average
- For each nightcap category, check if last occurrence was >6 weeks ago
- For brightened_day, check if trailing 30-day rate is >20 points below all-time average
- If any trigger fires, store alert in `insights` table (from Proposal 1 schema)

### Anniversary Lookup

Part of nightcap trigger (nightly at 10pm):
- Check if today's date has entries from 1 year ago, 6 months ago
- If the entry's depth_score was > 0.6, surface it before the nightcap questions:

> "**This time last year** (Mar 22, 2025): Catherine answered 'What made you fall in love?': '{answer}'"

### Dashboard Page (`/relationship`)

New page with:
1. **Pillar indicators** — 5 colored badges with trend arrows (top of page)
2. **His & Hers this week** — side-by-side day entries (collapsible)
3. **Pillar trend charts** — sparklines for each pillar over 12 weeks
4. **Category heatmap** — which nightcap categories have been covered recently vs. not
5. **Drift alerts** — any active alerts
6. **Anniversary moments** — upcoming anniversaries of meaningful entries

### What to Build First (MVP)

1. Nightcap category mapping (static, one-time)
2. Basic answer analysis: word count + sentiment per nightcap answer
3. Relationship page with his/hers side-by-side view
4. Pillar scoring (start with Connection + Appreciation, easiest to compute)
5. Add Depth + Fun pillars in v2
6. Add drift detection in v3
7. Add Attunement (hardest, requires cross-reference analysis) in v4
8. Add anniversary intelligence in v5

---

## Failure Modes to Guard Against

1. **The Scoreboard Effect**: Couple starts gaming their nightcap answers to improve scores. Fix: never show scores during the nightcap itself. Scores are retrospective analysis, not real-time feedback.
2. **The Asymmetry Problem**: One partner writes novels, the other writes sentences. Length-based metrics will always favor the verbose partner. Fix: normalize per-person. Each person is compared to their OWN baseline.
3. **The False Alarm**: "Your fun score dropped!" during a week when the baby was sick. Fix: require 3-week sustained trends before alerting. Single-week dips are noise.
4. **The Missing Context**: Analyzing text without knowing what happened offline. Fix: the system should always frame insights as "based on what was captured" — it doesn't know about the 2-hour conversation that happened in the car.
5. **The Weaponization Risk**: One partner uses the dashboard against the other in an argument. Fix: frame everything as "we" not "you." The dashboard is a mirror for the relationship, not a scorecard for individuals. Consider making it only viewable together (shared passcode?).
6. **Catherine's Buy-In**: If Catherine sees this as surveillance rather than a shared tool, the entire system collapses. Fix: involve her in the design. The system should feel like a shared journal they both benefit from, not Charles's tracking system.
