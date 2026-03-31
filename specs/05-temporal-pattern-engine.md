# Spec: The Temporal Pattern Engine

## The Job
You live inside your own life. You can't see the patterns because you're the data point. You might vaguely sense that "good weeks feel different" but you can't articulate WHY they're different or WHAT preceded them. The Temporal Pattern Engine stands outside your data and finds the cause-and-effect chains that are invisible from the inside. Not "exercise is good for you" — everyone knows that. YOUR specific chains: "When you write a detailed morning intention (>15 words), you complete your priority 73% of the time vs. 28% when it's vague. And when you complete your priority, you're 4x more likely to feel the Spirit that evening."

---

## What RIGHT Looks Like

### Correlation Discovery

**Right**: The system tests every pairable combination of tracked variables and reports the ones that are statistically significant AND non-obvious.

> **Pattern: Weight momentum predicts workout consistency**
> When your weight drops for 2+ consecutive weigh-ins, your workout rate in the following week is 82% (vs. 51% baseline). n=14 qualifying periods, p<0.01.
> Interpretation: Seeing the scale move creates a positive feedback loop that increases exercise motivation. The leading indicator is the weight trend, not the workout plan.

> **Pattern: Journal skipping precedes spiritual drought**
> When you skip journaling for 3+ consecutive days, your "felt the Spirit" rate drops to 22% for the following 7 days (vs. 67% baseline). n=8 qualifying periods, p<0.05.
> This pattern has held across all seasons and work-intensity levels.

> **Pattern: Nolan moments and Catherine scores are inversely correlated with work output**
> Weeks where built/shipped is filled 5+ days, Nolan moments average 2.1/week and brightened_day averages 4.2/week. Weeks where built/shipped is filled 0-2 days, Nolan moments average 4.8/week and brightened_day averages 5.9/week.
> Interpretation: Heavy shipping weeks come at a cost to family engagement. This isn't necessarily wrong — but it's a tradeoff you should see clearly.

**Right characteristics**:
- Shows sample size (n=14) and statistical significance (p<0.01)
- Includes the base rate comparison ("82% vs. 51% baseline")
- Offers interpretation but labels it as interpretation, not fact
- Distinguishes between correlation and causation explicitly
- Only surfaces patterns where the effect size is meaningful (>20 percentage point difference or >0.5 standard deviation)

### Sequence Detection

**Right**: Finds chains of events that predictably follow each other.

> **Sequence: Vague intention → Missed priority → No built/shipped → Journal about frustration → Low Spirit**
> This 5-step cascade has occurred 6 times in the last 4 months. The trigger is a vague morning intention (<8 words). Average time from trigger to low Spirit: 2.3 days.
> Breaking point: Making the intention specific. When you rewrite a vague intention to be specific (happened 4 times), the cascade was interrupted 3 of 4 times.

> **Sequence: Sunday relationship review → High brightened_day rate → Positive nightcap entries**
> After relationship reviews, your brightened_day rate averages 90% for the following 5 days (vs. 65% baseline). The review acts as a relationship reset.

**Right characteristics**:
- Shows the full chain, not just the start and end
- Identifies the trigger point and the breaking point
- Includes frequency ("6 times in 4 months") so you know if it's robust
- Shows the intervention that works

### Seasonal Patterns

**Right**: Identifies recurring patterns tied to time of year, day of week, or cyclical life events.

> **Seasonal: Spirit scores peak October-December**
> Your trailing 30-day Spirit average by month (2 years of data):
> Jan: 62 | Feb: 58 | Mar: 55 | Apr: 51 | May: 48 | Jun: 45
> Jul: 50 | Aug: 55 | Sep: 61 | Oct: 72 | Nov: 78 | Dec: 81
> This pattern is consistent across both years. Consider proactively investing in spiritual practices during the March-June trough.

> **Day-of-week: Wednesday is your most productive day**
> Built/shipped completion rate by day: Mon 45%, Tue 52%, Wed 71%, Thu 48%, Fri 38%, Sat 22%, Sun 15%.
> Your morning intentions on Wednesdays are also the most specific (avg 14 words vs. 9 on other days). Consider scheduling your highest-priority work for Wednesdays.

**Right characteristics**:
- Shows the raw data, not just the conclusion
- Requires 2+ cycles to confirm a seasonal pattern (not just "last October was good")
- Suggests proactive action ("invest during the trough")
- Tests for confounders (is Wednesday productive because of the day, or because meetings happen to be lighter?)

### Intervention Impact Analysis

**Right**: When you make a deliberate change, the system measures the before/after impact across ALL dimensions.

> **Intervention detected: Morning routine change (started Feb 15)**
> You started including a gratitude item in your morning intention around Feb 15.
> Before (Jan 1 - Feb 14): Spirit avg 55, Journal depth avg 0.42
> After (Feb 15 - Mar 22): Spirit avg 74, Journal depth avg 0.61
> Other dimensions: Body unchanged, Mind +3 (not significant), Heart +8 (marginally significant)
> Conclusion: The morning gratitude practice appears to have a strong effect on Spirit (+19) and a moderate effect on Heart (+8). No effect on Body or Mind.

**Right characteristics**:
- Detects interventions automatically (changepoint detection) or allows manual flagging
- Measures impact across ALL dimensions, not just the obvious one
- Shows the time periods and sample sizes
- Labels significance levels honestly
- Doesn't over-attribute — if the change coincided with something else (season change, vacation), notes it

### Predictive Alerts

**Right**: Based on current trajectory, warns about likely future states.

> "Your 7-day workout rate is 2/7 (29%). The last 4 times your workout rate dropped below 30% for a full week, it took an average of 18 days to recover above 50%. If this trend continues, you won't be back to baseline until April 9."

> "Your Spirit score has been declining for 4 consecutive weeks (81 → 74 → 68 → 62). If the rate of decline continues, you'll hit your all-time low of 45 in approximately 3 weeks. The last time Spirit dropped below 50, it coincided with skipping journal for 5+ days."

**Right characteristics**:
- Based on YOUR historical recovery patterns, not generic projections
- Shows the math: "4 times this happened, average recovery was 18 days"
- Doesn't just warn — connects to the leading indicator that predicts it
- Includes a time horizon ("by April 9") to create appropriate urgency
- Only fires for trajectories that have historical precedent — no extrapolation from new territory

### "What Moves the Needle" Report

**Right**: A rank-ordered list of which behaviors have the strongest empirical impact on your life satisfaction.

> **Your Top 5 Needle-Movers** (based on 6 months of data)
>
> 1. **Working out** → affects Body (+32 avg impact), Spirit (+18), Mind (+8)
>    The single highest-impact behavior. Days you work out, your evening scores are 1.8x higher across all dimensions.
>
> 2. **Specific morning intention** → affects Mind (+22), follow-through rate (+45%)
>    When your morning intention is >12 words and names a specific deliverable, your completion rate more than doubles.
>
> 3. **Journaling about gratitude** → affects Spirit (+25), Heart (+12)
>    Journal entries that mention gratitude are followed by Spirit days 82% of the time (vs. 58% for non-gratitude journals).
>
> 4. **Nolan moments** → affects Heart (+15), Spirit (+9)
>    Capturing a Nolan moment correlates with higher nightcap engagement and higher brightened_day the following day.
>
> 5. **Weight trending down** → affects Body (+28), Mind (+11)
>    Consecutive days of weight decrease predict sustained workout adherence.

**Right characteristics**:
- Ranked by total cross-dimensional impact, not single-dimension
- Shows the specific numbers so you can judge for yourself
- Grounded in YOUR data with YOUR effect sizes
- Updated monthly as more data comes in
- Limited to 5 — if everything is a needle-mover, nothing is

---

## What WRONG Looks Like

### Spurious Correlations
**Wrong**: "When you eat breakfast before 7am, your Spirit score is 15% higher." (Based on 3 data points where you happened to mention breakfast in your journal.)

Why it's wrong: With 15+ tracked variables and dozens of possible time lags, random correlations will appear everywhere. This is the multiple comparisons problem. If you test 100 correlations at p<0.05, you'll find 5 "significant" results by pure chance.

Fix:
- Apply Bonferroni correction or False Discovery Rate (FDR) control
- Require minimum sample size of n=10 for any pattern
- Require effect size threshold (>20% difference or >0.5 SD) alongside statistical significance
- Classify patterns by confidence tier: Established (n>20, p<0.01), Emerging (n>10, p<0.05), Hypothesis (n>5, p<0.1)

### Confounded Causation
**Wrong**: "Working out causes you to feel the Spirit." When actually both are caused by having a good night's sleep.

Why it's wrong: Correlation isn't causation, and the system has no way to run controlled experiments. A confounder (sleep, stress, season, day of week) could explain both.

Fix:
- Always label findings as "correlations" not "causes"
- Test for common confounders: day of week, season, previous day's score
- When a correlation survives confounder adjustment, note it: "This pattern holds even after controlling for day-of-week effects."
- When it doesn't survive: "This pattern may be explained by [confounder]. Treating as hypothesis."

### The Noise Report
**Wrong**: Generating 25 "patterns" per week, most of which are noise dressed up as insight.

Why it's wrong: Information overload kills the system. If you have to sift through 25 patterns to find the 2 that matter, you'll stop reading.

Fix:
- Hard cap: surface maximum 3-5 patterns per month
- Rank by: (effect_size * sample_size * novelty). Novelty = haven't been surfaced before.
- Suppress patterns that are obvious (workout → Body score) unless the DEGREE is surprising
- Only surface new patterns. Established patterns go to a reference page, not the feed.

### The Small Sample Overfit
**Wrong**: "Every time you meditate on a Tuesday, your Wednesday is productive." (n=2)

Why it's wrong: Two data points is an anecdote, not a pattern. The system MUST enforce minimum sample sizes.

Fix:
- n < 5: don't even store it
- 5 <= n < 10: store as "hypothesis" — internal tracking only, never surfaced
- 10 <= n < 20: "emerging pattern" — can be surfaced with strong caveats
- n >= 20: "established pattern" — can be surfaced with confidence

### The Lag Guessing Game
**Wrong**: Testing every possible time lag (1 day, 2 days, 3 days... 30 days) for every correlation, finding the one that happens to be significant.

Why it's wrong: This is p-hacking across time dimensions. If you test 30 lag values, you'll find "significance" by chance.

Fix:
- Test only biologically/psychologically plausible lag windows: 0-1 days (immediate), 2-7 days (short-term), 7-14 days (medium-term)
- For each correlation, test max 3 lag windows, not 30
- Apply correction for multiple comparisons across lags

### The Deterministic Prediction
**Wrong**: "You WILL stop working out by April 9."

Why it's wrong: Predicting human behavior with certainty is absurd. The system should show PROBABILITY based on historical patterns, not deterministic forecasts.

Fix:
- "Based on 4 similar past periods, there's a 75% chance your workout rate will stay below 50% for 2+ more weeks."
- Always include the possibility of breaking the pattern
- Frame predictions as "if current trajectory continues" — the trajectory CAN change

---

## Technical Spec

### Statistical Methods

**1. Cross-correlation analysis**
For each pair of variables (X, Y), compute Pearson correlation at lags 0, 1, 3, 7 days.
- Variables: workout (binary), journaled (binary), felt_spirit (binary), brightened_day (binary), weight (continuous), score (0-6), each dimension score (0-100), intention_completion (categorical), journal_word_count (continuous), built_shipped (binary)
- Total pairs: ~55 unique pairs * 4 lags = ~220 tests
- Apply FDR correction (Benjamini-Hochberg) at q=0.05
- Minimum n=10 per cell

**2. Sequence mining**
Use sequential pattern mining to find chains of 2-4 events that co-occur.
- Binarize all variables per day
- Find frequent subsequences with minimum support of 5 occurrences
- Rank by lift (how much more likely the sequence is vs. random)

**3. Changepoint detection**
Use PELT (Pruned Exact Linear Time) algorithm to detect when a variable's distribution shifted.
- Run on each continuous variable (dimension scores, weight, word counts)
- When a changepoint is detected, compare pre/post means across ALL variables
- Flag as "intervention" if the change is sustained for 14+ days

**4. Seasonal decomposition**
For variables with 6+ months of data, decompose into trend + seasonal + residual.
- Use STL decomposition (Seasonal-Trend using Loess)
- Extract day-of-week effects and monthly effects
- Report seasonal patterns only if the seasonal component explains >15% of variance

**5. Granger causality**
For the strongest correlations, test whether X at time t predicts Y at time t+lag better than Y alone.
- This is the closest we can get to "causation" from observational data
- Requires stationarity — difference the time series if needed
- Report as "X Granger-causes Y" with F-statistic and p-value

### Architecture

This is the most computationally intensive proposal. Two options:

**Option A: Node.js with simple-statistics library**
- Pro: stays in the existing stack, no new runtime
- Con: limited statistical capabilities, no STL decomposition, no Granger causality
- Good for: MVP (cross-correlations, sequence mining, basic changepoints)

**Option B: Python analysis service**
- Pro: statsmodels, scipy, scikit-learn — full statistical toolkit
- Con: adds a runtime, needs hosting (could be a Vercel serverless function with Python runtime, or a scheduled Fly.io job)
- Good for: full implementation (all 5 methods above)

**Recommendation**: Start with Option A for MVP (cross-correlations + basic patterns). Move to Option B when the data volume and pattern complexity justify it.

### Database

```sql
CREATE TABLE discovered_patterns (
  id SERIAL PRIMARY KEY,
  pattern_type TEXT NOT NULL,          -- 'correlation', 'sequence', 'seasonal', 'intervention', 'granger'
  variable_x TEXT NOT NULL,
  variable_y TEXT,
  lag_days INTEGER,
  effect_size DECIMAL NOT NULL,
  sample_size INTEGER NOT NULL,
  p_value DECIMAL,
  confidence_tier TEXT NOT NULL,       -- 'established', 'emerging', 'hypothesis'
  description TEXT NOT NULL,           -- human-readable summary
  interpretation TEXT,                 -- suggested interpretation
  first_discovered DATE NOT NULL,
  last_validated DATE NOT NULL,
  times_validated INTEGER DEFAULT 1,
  invalidated BOOLEAN DEFAULT false,
  surfaced BOOLEAN DEFAULT false,
  surfaced_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interventions (
  id SERIAL PRIMARY KEY,
  detected_date DATE NOT NULL,
  variable TEXT NOT NULL,
  direction TEXT NOT NULL,             -- 'increase', 'decrease'
  pre_mean DECIMAL NOT NULL,
  post_mean DECIMAL NOT NULL,
  change_magnitude DECIMAL NOT NULL,
  confidence DECIMAL NOT NULL,
  description TEXT,                    -- user-editable: "Started morning gratitude"
  cross_impacts JSONB,                 -- { "spirit": +19, "heart": +8, "body": 0, "mind": +3 }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Computation Schedule

**Weekly analysis job** (Sunday 3am MT — low traffic):
1. Pull all dimension_scores, checkin data, review data for the last 90 days
2. Run cross-correlation analysis (~220 tests, <1 second)
3. Run sequence mining (frequent subsequence extraction)
4. Compare results against existing `discovered_patterns`
   - If a pattern is still significant: update `last_validated`, increment `times_validated`
   - If a pattern is no longer significant: set `invalidated = true`
   - If a new pattern is found: insert with appropriate confidence tier
5. Run changepoint detection on dimension scores
6. Check for new interventions
7. Select top 3 unsurfaced patterns by (effect_size * sample_size * novelty) for the weekly brief

**Monthly deep analysis** (1st of month, 3am):
- Run Granger causality tests on established patterns
- Run seasonal decomposition on variables with 6+ months of data
- Generate the "What Moves the Needle" report
- Update confidence tiers based on accumulated evidence

### Pattern Lifecycle

```
Hypothesis (n=5-9, never surfaced)
    ↓ accumulates evidence
Emerging (n=10-19, can be surfaced with caveats)
    ↓ accumulates evidence
Established (n=20+, surfaced with confidence)
    ↓ if data stops supporting it
Invalidated (suppressed, kept for records)
```

### Visualization

**Patterns page** (`/patterns`):
1. **Network graph**: variables as nodes, significant correlations as edges. Edge thickness = effect size. Edge color = positive (green) or negative (red).
2. **Sequence diagrams**: for top sequences, show the chain as a horizontal flow diagram with probabilities at each step.
3. **Seasonal heatmap**: 12 months x N variables, colored by deviation from annual mean.
4. **Intervention timeline**: vertical timeline showing detected changepoints with cross-impact badges.

### What to Build First (MVP)

1. Simple cross-correlation: test the top 10 most interesting variable pairs manually (workout→spirit, journal→score, weight_trend→workout, etc.)
2. Store results in `discovered_patterns`
3. Surface in weekly digest: "Pattern spotlight: [top pattern]"
4. Add automated cross-correlation testing in v2
5. Add sequence mining in v3
6. Add changepoint detection + intervention tracking in v4
7. Add full statistical suite (Granger, seasonal) in v5

### API Cost
- All computation is local (statistics, not LLM)
- Pattern descriptions can be LLM-generated: ~$0.05/week
- **Monthly total: ~$0.20/month** (almost entirely compute, minimal API)

---

## Failure Modes to Guard Against

1. **The p-Hacking Machine**: Testing everything against everything and reporting whatever is significant. Fix: FDR correction, minimum effect size threshold, confidence tier system.
2. **The Stale Pattern**: Reporting a pattern discovered 6 months ago that no longer holds. Fix: weekly revalidation. Patterns that fail 3 consecutive validations are invalidated.
3. **The Correlation-Causation Conflation**: "Working out causes spiritual experiences." Fix: always use language like "is associated with," "correlates with," "predicts." Only use causal language for Granger-validated patterns, and even then with caveats.
4. **The Data Drought**: Not enough data points to find meaningful patterns. Fix: honest minimum sample sizes. If you have 30 days of data, you can find daily correlations but not weekly patterns. Set expectations accordingly. Show a "data maturity" indicator: "Your pattern engine is at 35% maturity. Reliable patterns emerge at 60%+ (approximately 6 months of consistent data)."
5. **The Butterfly Effect**: User changes behavior based on a pattern, which invalidates the pattern. Fix: this is actually fine — it's the GOAL. But the system should detect and report it: "Since we surfaced the workout→spirit pattern 6 weeks ago, your workout consistency increased 40% and Spirit is at an all-time high. The pattern worked."
6. **The Analysis Paralysis**: So many patterns that the user doesn't know what to act on. Fix: the "What Moves the Needle" report is the decision surface. Max 5 items, rank-ordered. Everything else is reference material.
