import { getCheckins } from "@/lib/db";
import { calculateScore } from "@/lib/types";
import { WeightChart } from "@/components/weight-chart";
import { DayRow } from "@/components/day-row";
import { Flame, TrendingUp, Hash, Scale } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let checkins;
  try {
    checkins = await getCheckins(90);
  } catch {
    // DB not available yet (local dev without Postgres)
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-bold">DayScore</h1>
          <Link
            href="/checkin"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:translate-y-px transition-all"
          >
            Check In
          </Link>
        </div>
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
          <p className="text-[13px] text-muted-foreground">
            Connect a database to get started. No check-ins yet.
          </p>
        </div>
      </main>
    );
  }

  // Stats
  const totalCheckins = checkins.length;
  const scores = checkins.map(calculateScore);
  const avgScore = totalCheckins > 0 ? scores.reduce((a, b) => a + b, 0) / totalCheckins : 0;

  // Streak: consecutive days with a check-in (from most recent)
  let streak = 0;
  if (totalCheckins > 0) {
    const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });
    const checkDate = new Date(today + "T12:00:00");
    for (const c of sorted) {
      const cDate = c.date;
      const expected = checkDate.toISOString().split("T")[0];
      if (cDate === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Latest weight
  const latestWithWeight = checkins.find((c) => c.weight !== null && c.weight > 0);
  const latestWeight = latestWithWeight?.weight;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold">DayScore</h1>
        <Link
          href="/checkin"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:translate-y-px transition-all"
        >
          Check In
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Flame className="w-4 h-4" />} label="Streak" value={`${streak}d`} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Avg Score" value={`${avgScore.toFixed(1)}/6`} />
        <StatCard icon={<Scale className="w-4 h-4" />} label="Weight" value={latestWeight ? `${latestWeight}` : "—"} />
        <StatCard icon={<Hash className="w-4 h-4" />} label="Check-ins" value={`${totalCheckins}`} />
      </div>

      {/* Weight chart */}
      <div className="mb-6">
        <WeightChart checkins={checkins} />
      </div>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold">History</h2>
        {checkins.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No check-ins yet. Start your first one!</p>
        ) : (
          checkins.map((c) => <DayRow key={c.id} checkin={c} />)
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="text-[18px] font-bold tabular-nums">{value}</p>
    </div>
  );
}
