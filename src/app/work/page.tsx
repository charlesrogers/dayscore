import { getCheckins } from "@/lib/db";
import { WorkRow } from "@/components/work-row";
import { Briefcase, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkDashboard() {
  let checkins;
  try {
    checkins = await getCheckins(90);
  } catch {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-[20px] font-bold mb-6">Work</h1>
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
          <p className="text-[13px] text-muted-foreground">Connect a database to get started.</p>
        </div>
      </main>
    );
  }

  const workCheckins = checkins.filter(
    (c) => c.work_done || c.skill_edge || c.tomorrow_plan
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold">Work</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-[11px] font-medium">Work Entries</span>
          </div>
          <p className="text-[18px] font-bold tabular-nums">{workCheckins.length}</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Hash className="w-4 h-4" />
            <span className="text-[11px] font-medium">Skills Sharpened</span>
          </div>
          <p className="text-[18px] font-bold tabular-nums">
            {workCheckins.filter((c) => c.skill_edge).length}
          </p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold">History</h2>
        {workCheckins.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No work check-ins yet. Type <code className="bg-muted px-1 rounded">!work</code> in Discord to start.
          </p>
        ) : (
          workCheckins.map((c) => <WorkRow key={c.id} checkin={c} />)
        )}
      </div>
    </main>
  );
}
