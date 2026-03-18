import { CheckIn } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function WorkRow({ checkin }: { checkin: CheckIn }) {
  const hasWork = checkin.work_done || checkin.skill_edge || checkin.tomorrow_plan;
  if (!hasWork) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4 hover:shadow-md hover:shadow-black/[0.06] transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium">{formatDate(checkin.date)}</span>
      </div>
      <div className="space-y-2 text-[12px]">
        {checkin.work_done && (
          <div>
            <span className="text-muted-foreground font-medium">Done today:</span>
            <p className="text-foreground mt-0.5">{checkin.work_done}</p>
          </div>
        )}
        {checkin.skill_edge && (
          <div>
            <span className="text-muted-foreground font-medium">Skill/edge:</span>
            <p className="text-foreground mt-0.5">{checkin.skill_edge}</p>
          </div>
        )}
        {checkin.tomorrow_plan && (
          <div>
            <span className="text-muted-foreground font-medium">Tomorrow:</span>
            <p className="text-foreground mt-0.5">{checkin.tomorrow_plan}</p>
          </div>
        )}
      </div>
    </div>
  );
}
