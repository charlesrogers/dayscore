import { initDb, getCheckinsForDateRange, getReviewsForDateRange } from "@/lib/db";
import { sendMessage } from "@/lib/discord";
import { calculateScore } from "@/lib/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  // Only fire Sunday 9am MT
  if (!force) {
    const now = new Date();
    const mtDayName = now.toLocaleString("en-US", { timeZone: "America/Denver", weekday: "short" });
    const mtHour = parseInt(
      now.toLocaleString("en-US", { timeZone: "America/Denver", hour: "numeric", hour12: false }),
      10
    );
    if (mtDayName !== "Sun" || mtHour !== 9) {
      return Response.json({ skipped: true, reason: "Not Sunday 9am MT" });
    }
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: "No channel ID configured" }, { status: 500 });
  }

  await initDb();

  // Date ranges
  const today = new Date();
  const endDate = new Date(today.toLocaleDateString("en-CA", { timeZone: "America/Denver" }) + "T12:00:00");
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - 7);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];
  const prevStartStr = prevStart.toISOString().split("T")[0];

  // Fetch this week and last week
  const thisWeek = await getCheckinsForDateRange(startStr, endStr);
  const lastWeek = await getCheckinsForDateRange(prevStartStr, startStr);
  const mornings = await getReviewsForDateRange("morning", startStr, endStr);

  if (thisWeek.length === 0) {
    return Response.json({ skipped: true, reason: "No check-ins this week" });
  }

  // Compute stats
  const scores = thisWeek.map(calculateScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const lastScores = lastWeek.map(calculateScore);
  const lastAvg = lastScores.length > 0
    ? lastScores.reduce((a, b) => a + b, 0) / lastScores.length
    : null;

  const journalDays = thisWeek.filter((c) => c.journaled).length;
  const workoutDays = thisWeek.filter((c) => c.worked_out).length;
  const spiritDays = thisWeek.filter((c) => c.felt_spirit).length;
  const catherineDays = thisWeek.filter((c) => c.brightened_day).length;

  // Weight
  const weights = thisWeek.filter((c) => c.weight !== null && c.weight > 0);
  let weightLine = "";
  if (weights.length >= 2) {
    const first = weights[0].weight!;
    const last = weights[weights.length - 1].weight!;
    const diff = last - first;
    const arrow = diff < 0 ? "↓" : diff > 0 ? "↑" : "→";
    weightLine = `Weight: ${first} → ${last} (${arrow} ${Math.abs(diff).toFixed(1)} lbs)`;
  } else if (weights.length === 1) {
    weightLine = `Weight: ${weights[0].weight} lbs`;
  }

  // Built this week
  const builtItems = thisWeek
    .filter((c) => c.built_shipped)
    .map((c) => c.built_shipped!);

  // Nolan moments
  const nolanMoments = thisWeek
    .filter((c) => c.nolan_moment)
    .map((c) => c.nolan_moment!);

  // Morning intentions
  const intentions = mornings
    .filter((r) => r.answers.intention || r.answers.most_important)
    .map((r) => {
      const d = new Date(r.date + "T12:00:00");
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      return `${day}: ${r.answers.most_important || r.answers.intention}`;
    });

  // Format dates
  const startFmt = new Date(startStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFmt = new Date(endStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Build message
  const parts: string[] = [];
  parts.push(`**Your Week in Review** (${startFmt} – ${endFmt})\n`);

  let scoreLine = `Score: ${avgScore.toFixed(1)}/6 avg`;
  if (lastAvg !== null) {
    const diff = avgScore - lastAvg;
    scoreLine += ` (${diff >= 0 ? "↑" : "↓"} from ${lastAvg.toFixed(1)} last week)`;
  }
  parts.push(scoreLine);
  if (weightLine) parts.push(weightLine);
  parts.push(`Streak: ${thisWeek.length} days checked in\n`);

  parts.push(`Journal: ${journalDays}/7 days`);
  parts.push(`Workout: ${workoutDays}/7 days`);
  parts.push(`Spirit: ${spiritDays}/7 days`);
  parts.push(`Catherine: ${catherineDays}/7 days`);

  if (builtItems.length > 0) {
    parts.push(`\n**Built this week:**`);
    for (const item of builtItems) parts.push(`• ${item}`);
  }

  if (nolanMoments.length > 0) {
    parts.push(`\n**Nolan moments:**`);
    for (const m of nolanMoments) parts.push(`• ${m}`);
  }

  if (intentions.length > 0) {
    parts.push(`\n**Morning intentions:**`);
    for (const i of intentions) parts.push(`• ${i}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dayscore-five.vercel.app";
  parts.push(`\nDashboard: ${appUrl}`);

  await sendMessage(channelId, parts.join("\n"));

  return Response.json({ ok: true, stats: { avgScore, journalDays, workoutDays, spiritDays } });
}
