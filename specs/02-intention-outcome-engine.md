# Spec: The Intention-Outcome Engine

## The Job
Close the loop between what you say you'll do and what you actually do. The morning check-in captures intentions. The evening check-in captures outcomes. Today those two systems don't talk to each other. The gap between them is the most valuable data point in the entire system — and it's invisible.

---

## What RIGHT Looks Like

### The Evening Loop-Back

**Right**: When the personal check-in runs at 9pm, it knows what you said at 7am and asks about it directly.

> "This morning you said your #1 priority was: **Ship the settings page redesign.**"
> "Did you accomplish this? (yes / partially / no / changed priorities)"

Then the existing check-in continues (weight, journal, workout, etc.).

**Right characteristics**:
- The morning intention is surfaced verbatim — no paraphrasing
- The completion options are honest: "changed priorities" is a valid answer, not a failure
- The follow-up captures WHY when incomplete: "What got in the way?" (text, optional)
- This adds 1-2 questions to the evening flow, not 10

### The Follow-Through Dashboard

**Right**: A page (or dashboard section) that shows your say/do ratio over time.

> **Follow-Through Rate: 47%** (trailing 30 days)
> Last week: 3/7 (43%) | This week so far: 2/3 (67%)
>
> **By Category:**
> - Health/Fitness: 78% (7/9)
> - Technical/Building: 31% (4/13)
> - Relationship: 60% (3/5)
> - Spiritual: 50% (2/4)
>
> **Stuck Items** (set as priority 3+ times without completion):
> - "Finish auth middleware refactor" — set 4 times, completed 0
> - "Write the Q1 retrospective" — set 3 times, completed 0
>
> **Insight**: Your health intentions have the highest follow-through. Your technical intentions have the lowest. When you set a technical priority on a day with no meetings (per your journal), completion rate jumps to 62%.

**Right characteristics**:
- The category classification is automatic (LLM classifies intention text into categories)
- "Stuck items" detection is mechanical — same intention (by semantic similarity, not exact match) repeated 3+ times
- The insight at the bottom connects follow-through data to other dimensions (journal mentions of meetings)
- Trends are shown, not just snapshots

### The Revealed Preference Report (Weekly)

**Right**: Part of the weekly digest or intelligence brief.

> "This week you set 7 morning priorities. 5 were work-related, 1 was health, 1 was relationship. You completed the health priority and the relationship priority but only 1 of 5 work priorities."
>
> "Your built/shipped field this week mentioned: nightcap questions, todo command, settings page. None of these matched your stated priorities. Your revealed priority this week was DayScore feature development, but your stated priorities were client work."
>
> "This isn't necessarily wrong — sometimes the urgent trumps the important. But if it happens 3 weeks in a row, the stated priorities might not be your real priorities."

**Right characteristics**:
- Non-judgmental framing. "Changed priorities" is sometimes correct. The system presents the data, not the verdict.
- Cross-references morning intentions with evening built/shipped and work_done fields
- Uses semantic matching, not keyword matching (the user won't use the same words)
- Tracks the pattern over weeks, not just this week

### The Predictive Friction Alert

**Right**: Surfaces in the morning brief when a pattern is detected.

> "You're about to set your morning priority. Note: 'finish the API refactor' has been your #1 priority 4 of the last 8 work days. You completed it 0 times. Consider: is this one task or three? What's the smallest piece you could ship today?"

**Right characteristics**:
- Only triggers after 3+ repeats of a semantically similar intention
- Suggests a specific intervention (break it down) rather than just flagging the problem
- Doesn't trigger every single morning — once flagged, waits for the item to either complete or be replaced

---

## What WRONG Looks Like

### The Guilt Machine
**Wrong**: "You only completed 2 of 7 priorities this week. Your follow-through rate is declining. You need to be more disciplined about sticking to your commitments."

Why it's wrong: This is a productivity app cop. The system should present data, not moralize. "Changed priorities" is a valid life strategy. The insight is in the PATTERN of which categories get abandoned, not in the raw completion number. A 30% follow-through rate on ambitious priorities might be better than a 90% follow-through rate on trivial ones.

### The Keyword Matcher
**Wrong**: Morning intention: "Work on the API." Evening built/shipped: "Shipped API endpoints for the new auth flow." System: "No match found — intention not completed."

Why it's wrong: Exact keyword matching will miss semantic matches constantly. "Work on the API" and "Shipped API endpoints" are clearly the same project. The system MUST use semantic similarity (embeddings or LLM classification), not string matching.

### Over-Classification
**Wrong**: 15 intention categories with sub-categories, requiring manual tagging.

Why it's wrong: The user types a natural language intention. The system classifies it automatically. If the taxonomy is too granular, classifications become unreliable and the data becomes noisy. Start with 5-6 broad categories: Health/Body, Work/Building, Relationship/Family, Spiritual, Learning/Growth, Admin/Life. Let the LLM classify. Refine later based on actual data.

### Ignoring Context
**Wrong**: Flagging a "missed" priority when the user's journal that day says "Nolan was sick, stayed home all day."

Why it's wrong: The system should note when journal context explains a missed priority. Not to excuse it, but to avoid false alarms. "You missed your technical priority, but your journal indicates a family health day. This isn't counted against your technical follow-through rate."

### Retroactive Shame
**Wrong**: Showing a 6-month follow-through rate of 35% on the very first day the feature launches, calculated from old data where the user never had the loop-back question.

Why it's wrong: Follow-through scoring should only begin from the day the feature is active. Historical intentions can be analyzed for patterns, but they can't be scored for completion because the user was never asked "did you do this?"

---

## Technical Spec

### Data Model

```sql
CREATE TABLE intention_outcomes (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  intention TEXT,             -- morning intention text
  priority TEXT,              -- morning #1 priority text
  intention_category TEXT,    -- LLM-classified: 'health', 'work', 'relationship', 'spiritual', 'growth', 'admin'
  priority_category TEXT,     -- same classification for priority
  completion TEXT,            -- 'yes', 'partially', 'no', 'changed'
  blocker TEXT,               -- why incomplete (optional text)
  matched_outcome TEXT,       -- which evening field matched (built_shipped, work_done, etc.)
  match_confidence DECIMAL,   -- 0-1 semantic similarity score
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stuck_items (
  id SERIAL PRIMARY KEY,
  canonical_text TEXT NOT NULL,     -- the "representative" phrasing
  category TEXT,
  times_set INTEGER DEFAULT 1,
  times_completed INTEGER DEFAULT 0,
  first_seen DATE NOT NULL,
  last_seen DATE NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Flow Changes

**Morning check-in** (no change to questions, but data is stored differently):
- After morning conversation completes, save intention + priority to both `reviews` table (existing) AND `intention_outcomes` table (new, just the intention/priority fields + LLM category)

**Evening check-in** (add 1-2 questions at the START, before weight):
- Fetch today's `intention_outcomes` row
- If a priority was set: "This morning your #1 was: **{priority}**. Did you accomplish this?"
- Options: yes / partially / no / changed priorities
- If "partially" or "no": "What got in the way?" (text, optional)
- Store completion + blocker in `intention_outcomes`
- Then continue with regular check-in questions

**Nightly analysis** (cron, after check-in typically completes):
- For today's `intention_outcomes`, if completion is "yes" or "partially":
  - Compare priority text against built_shipped, work_done fields using Claude API
  - Store `matched_outcome` and `match_confidence`
- Check if priority text is semantically similar to any `stuck_items` entries
  - If yes: increment `times_set` (and `times_completed` if completed)
  - If no: create new `stuck_items` entry
- Classify intention + priority into categories via Claude API (batch, cheap)

### Semantic Matching Approach

Use Claude API with a structured prompt:

```
Given a morning intention and an evening outcome, determine if they match.

Morning priority: "Ship the settings page redesign"
Evening built/shipped: "Finished the settings page with nightcap editor"

Match? yes/partially/no
Confidence: 0-1
Reasoning: one sentence
```

Cost: ~$0.005 per match. One per day = ~$0.15/month.

For stuck item detection (is this the same intention as a previous one):

```
Are these two priorities referring to the same underlying task?

A: "Finish the auth middleware refactor"
B: "Work on auth middleware"

Same task? yes/no
```

### Category Taxonomy

Start simple. 6 categories, LLM-classified:

| Category | Example Intentions |
|----------|-------------------|
| Health/Body | "Go to the gym", "Run 3 miles", "Track macros" |
| Work/Building | "Ship the API", "Finish the dashboard", "Write the proposal" |
| Relationship/Family | "Date night", "Play with Nolan", "Call mom" |
| Spiritual | "Temple trip", "Scripture study", "Service project" |
| Growth/Learning | "Read chapter 5", "Take the course module", "Practice Spanish" |
| Admin/Life | "Pay bills", "Fix the sink", "Grocery shopping" |

### Dashboard Component

New section on the main dashboard (or a new `/intentions` page):

1. **Follow-Through Rate** — big number, trailing 30 days, with sparkline
2. **By Category** — horizontal bar chart showing completion rate per category
3. **Stuck Items** — list of items set 3+ times without completion, with "resolve" button
4. **Weekly Trend** — line chart of weekly follow-through rate over last 12 weeks

### Weekly Digest Integration

Add a section to the existing weekly digest:

> **Intention Loop**
> Priorities set: 7 | Completed: 3 (43%)
> Best category: Health (100%) | Worst: Work (20%)
> Stuck: "Auth middleware refactor" (4th week)

### What to Build First (MVP)

1. Add `intention_outcomes` table + populate from morning check-in
2. Add the loop-back question to evening check-in ("Did you accomplish your #1?")
3. Store completion status
4. Show follow-through rate on dashboard (simple percentage)
5. Add category classification in v2
6. Add stuck item detection in v3
7. Add revealed preference analysis in v4

---

## Failure Modes to Guard Against

1. **The Overhead Tax**: Adding too many questions to the evening check-in. Fix: max 2 questions (completion + optional blocker). The check-in should stay under 3 minutes total.
2. **The Precision Trap**: Spending engineering effort on perfect semantic matching when 80% accuracy is fine. Fix: start with simple LLM matching, only invest in embeddings if accuracy is clearly insufficient.
3. **The Motivation Killer**: Showing declining follow-through rates with no actionable advice. Fix: always pair the data with a suggestion. "Your work follow-through drops on days with 3+ meetings. Consider blocking morning focus time."
4. **The False Match**: Matching "work on the API" to "worked out at the gym" because both contain "work." Fix: use semantic matching, not keyword matching. Test with adversarial examples.
5. **The Absent Morning**: User skips `!morning` some days. Fix: gracefully handle missing intentions — don't show the loop-back question, don't count the day in follow-through calculations.
