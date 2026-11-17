import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarDays, CalendarRange, Inbox, Smile, Star, Sun } from "lucide-react";
import { serviceById } from "@/data/services";
import { ratingLabel } from "@/data/feedback";
import { useReviews } from "@/lib/store";
import { avg, byQuestion, countOptions, fmt1, periodCounts, positiveShare, weeklyTrend } from "@/lib/stats";
import { relativeDate } from "@/lib/utils";
import { Kpi, Panel, TrendChart } from "@/components/charts";
import { Face, SampleTag } from "@/components/ui";

export default function Overview() {
  const reviews = useReviews();
  const p = periodCounts(reviews);
  const average = avg(reviews.map((r) => r.overall));
  const weakest = byQuestion(reviews)
    .filter((q) => q.count >= 3)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);
  const requests = countOptions(reviews, "improve").slice(0, 5);
  const attention = reviews.filter((r) => r.overall <= 2 && !r.resolved).slice(0, 5);
  const awaiting = reviews.filter((r) => r.status === "pending" && r.publishConsent).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-4xl font-medium text-forest sm:text-5xl">Guest feedback at a glance</h1>
        </div>
        <Link to="/admin/reviews" className="btn btn-primary self-start">
          <Inbox className="h-4 w-4" aria-hidden="true" /> {awaiting} awaiting approval
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total reviews" value={reviews.length} icon={<Inbox className="h-4 w-4" />} />
        <Kpi label="Average rating" value={fmt1(average)} sub={ratingLabel(average)} icon={<Star className="h-4 w-4" />} />
        <Kpi label="Today" value={p.today} icon={<Sun className="h-4 w-4" />} />
        <Kpi label="This week" value={p.week} sub="since Monday" icon={<CalendarDays className="h-4 w-4" />} />
        <Kpi label="This month" value={p.month} icon={<CalendarRange className="h-4 w-4" />} />
        <Kpi label="Positive" value={`${positiveShare(reviews)}%`} sub="rated 4 or 5" icon={<Smile className="h-4 w-4" />} tone="good" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Guest satisfaction trend" sub="Average overall rating per week, last 12 weeks" action={<Link to="/admin/analytics" className="text-sm font-semibold text-champagne-deep hover:underline">Analytics</Link>}>
          <TrendChart data={weeklyTrend(reviews)} />
        </Panel>

        <Panel title="Areas needing improvement" sub="Lowest-rated questions (at least 3 ratings)">
          <ul className="space-y-3">
            {weakest.map((q) => (
              <li key={q.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium">{q.label}</span>{" "}
                    <span className="text-xs text-muted">· {q.service === "general" ? "General" : serviceById[q.service].short}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{q.avg.toFixed(1)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
                  <div className="h-full rounded-full" style={{ width: `${(q.avg / 5) * 100}%`, background: q.avg < 3 ? "var(--color-r2)" : q.avg < 3.8 ? "var(--color-r3)" : "var(--color-r4)" }} />
                </div>
              </li>
            ))}
            {weakest.length === 0 && <li className="text-sm text-muted">Not enough ratings yet.</li>}
          </ul>
          {requests.length > 0 && (
            <>
              <p className="mt-6 mb-2 text-xs font-semibold tracking-wide text-muted">Most requested improvements</p>
              <div className="flex flex-wrap gap-1.5">
                {requests.map((r) => (
                  <span key={r.label} className="rounded-full bg-[#fbeee4] px-2.5 py-1 text-xs font-medium text-ink">
                    {r.label} <strong className="ml-1 tabular-nums">{r.count}</strong>
                  </span>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <Panel
        title="Needs attention"
        sub="Unresolved reviews rated 1 or 2"
        action={
          <Link to="/admin/reviews?rating=low&resolved=open" className="inline-flex items-center gap-1 text-sm font-semibold text-champagne-deep hover:underline">
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      >
        {attention.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Smile className="h-4 w-4 text-r5" aria-hidden="true" /> Nothing waiting. Every low rating has been followed up.
          </p>
        ) : (
          <ul className="divide-y divide-line/70">
            {attention.map((r) => (
              <li key={r.id}>
                <Link to={`/admin/reviews?open=${r.id}`} className="flex items-center gap-3 py-3 hover:bg-ivory sm:px-2">
                  <Face level={r.overall} active size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {r.guest.name || "Anonymous"} {r.sample && <SampleTag />}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {r.issueReasons.join(", ") || r.comment || r.improve.join(", ") || "No details given"}
                    </p>
                  </div>
                  <span className="hidden text-xs text-muted sm:block">{relativeDate(r.createdAt)}</span>
                  <AlertTriangle className="h-4 w-4 text-r2" aria-label="Unresolved" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
