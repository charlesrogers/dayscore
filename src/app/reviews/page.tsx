import { getReviews } from "@/lib/db";
import { getQuestionsForType } from "@/lib/questions";
import { Review } from "@/lib/types";
import { CalendarDays, Heart, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function ReviewCard({ review }: { review: Review }) {
  const questions = getQuestionsForType(review.type);
  const labels: Record<string, string> = {
    week: "Weekly Review",
    month: "Monthly Review",
    relationship: "Relationship Review",
    nightcap: "Nightcap",
  };
  const colors: Record<string, string> = {
    week: "bg-chart-1/10 text-chart-1",
    month: "bg-chart-2/10 text-chart-2",
    relationship: "bg-chart-5/10 text-chart-5",
    nightcap: "bg-chart-3/10 text-chart-3",
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5 hover:shadow-md hover:shadow-black/[0.06] transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-medium">{formatDate(review.date)}</span>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-4xl ${colors[review.type] || "bg-muted text-muted-foreground"}`}>
          {labels[review.type] || review.type}
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((q) => {
          const answer = review.answers[q.field];
          if (!answer) return null;
          return (
            <div key={q.id}>
              <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{q.text}</p>
              <p className="text-[13px] text-foreground whitespace-pre-wrap">{answer}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function ReviewsPage() {
  let weekReviews: Review[] = [];
  let monthReviews: Review[] = [];
  let relationshipReviews: Review[] = [];
  let nightcapReviews: Review[] = [];

  try {
    [weekReviews, monthReviews, relationshipReviews, nightcapReviews] = await Promise.all([
      getReviews("week", 10),
      getReviews("month", 10),
      getReviews("relationship", 10),
      getReviews("nightcap", 30),
    ]);
  } catch {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-[20px] font-bold mb-6">Reviews</h1>
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
          <p className="text-[13px] text-muted-foreground">Connect a database to get started.</p>
        </div>
      </main>
    );
  }

  const allReviews = [...weekReviews, ...monthReviews, ...relationshipReviews, ...nightcapReviews]
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold">Reviews</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="text-[11px] font-medium">Weekly</span>
          </div>
          <p className="text-[18px] font-bold tabular-nums">{weekReviews.length}</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] font-medium">Monthly</span>
          </div>
          <p className="text-[18px] font-bold tabular-nums">{monthReviews.length}</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Heart className="w-4 h-4" />
            <span className="text-[11px] font-medium">Relationship</span>
          </div>
          <p className="text-[18px] font-bold tabular-nums">{relationshipReviews.length}</p>
        </div>
      </div>

      {/* All reviews */}
      <div className="space-y-4">
        <h2 className="text-[15px] font-semibold">History</h2>
        {allReviews.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No reviews yet. Type <code className="bg-muted px-1 rounded">!week</code>, <code className="bg-muted px-1 rounded">!month</code>, or <code className="bg-muted px-1 rounded">!relationship</code> in Discord.
          </p>
        ) : (
          allReviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </main>
  );
}
