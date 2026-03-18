import { CheckIn, calculateScore } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function Indicator({ value, label, detail }: { value: boolean; label: string; detail?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={
          value
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-muted-foreground/30"
        }
      >
        {value ? "✓" : "✗"}
      </span>
      <span className="text-muted-foreground">{label}</span>
      {detail && (
        <span className="text-foreground">({detail})</span>
      )}
    </span>
  );
}

export function DayRow({ checkin }: { checkin: CheckIn }) {
  const score = calculateScore(checkin);

  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4 hover:shadow-md hover:shadow-black/[0.06] transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium">{formatDate(checkin.date)}</span>
          {checkin.weight && (
            <span className="text-[12px] text-muted-foreground tabular-nums">
              {checkin.weight} lbs
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-4xl tabular-nums">
          {score}/6
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
        <Indicator value={checkin.journaled} label="Journal" detail={checkin.journal_detail} />
        <Indicator value={checkin.worked_out} label="Workout" detail={checkin.workout_detail} />
        {checkin.built_shipped && (
          <span className="text-muted-foreground">
            Built: <span className="text-foreground">{checkin.built_shipped}</span>
          </span>
        )}
        <Indicator value={checkin.felt_spirit} label="Spirit" />
        <Indicator value={checkin.brightened_day} label="Catherine" />
        {checkin.nolan_moment && (
          <span className="text-muted-foreground">
            Nolan: <span className="text-foreground">{checkin.nolan_moment}</span>
          </span>
        )}
      </div>
      {checkin.daily_journal && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-[12px] text-muted-foreground whitespace-pre-wrap line-clamp-3">
            {checkin.daily_journal}
          </p>
        </div>
      )}
    </div>
  );
}
