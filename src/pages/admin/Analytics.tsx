import { useMemo, useState } from "react";
import { BadgeCheck, ChefHat, Sparkle, Timer, Users, Wallet } from "lucide-react";
import { offeredServices, themeLabels, type Theme } from "@/data/services";
import { useReviews } from "@/lib/store";
import { byQuestion, byService, byTheme, countOptions, distribution, fmt1, weeklyTrend } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { CountBars, DistributionChart, Panel, ScoreBars, TrendChart, VolumeChart } from "@/components/charts";
import { ServiceIcon } from "@/components/ui";

const ranges = [
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "90 days", days: 90 },
  { id: "all", label: "All time", days: 0 },
];

const headlineThemes: { theme: Theme; icon: typeof Sparkle }[] = [
  { theme: "cleanliness", icon: Sparkle },
  { theme: "staff", icon: Users },
  { theme: "food", icon: ChefHat },
  { theme: "service", icon: Timer },
  { theme: "value", icon: Wallet },
];

export default function Analytics() {
  const all = useReviews();
  const [range, setRange] = useState("90");
  const reviews = useMemo(() => {
    const days = ranges.find((r) => r.id === range)!.days;
    if (!days) return all;
    const since = Date.now() - days * 86400_000;
    return all.filter((r) => new Date(r.createdAt).getTime() >= since);
  }, [all, range]);

  const svc = offeredServices.filter((s) => s.questions.length);
  const serviceScores = byService(reviews, svc.map((s) => s.id))
    .filter((s) => s.count > 0)
    .map((s) => ({ label: svc.find((x) => x.id === s.id)!.label.split(" / ")[0], avg: Number(s.avg.toFixed(2)), count: s.count }));
  const themes = byTheme(reviews, headlineThemes.map((t) => t.theme));
  const questions = byQuestion(reviews);
  const trend = weeklyTrend(reviews, range === "30" ? 5 : 12);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1 className="mt-2 text-4xl font-medium text-forest sm:text-5xl">Where guests are happiest, and where to improve</h1>
        </div>
        <div className="inline-flex shrink-0 self-start rounded-full border border-line bg-white p-1" role="group" aria-label="Time range">
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn("min-h-9 rounded-full px-4 text-sm font-medium transition", range === r.id ? "bg-forest text-white" : "text-muted hover:text-ink")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <p className="text-sm text-muted">
        Based on <strong className="text-ink">{reviews.length}</strong> reviews. Scores are averages on a 1-5 scale.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {themes.map((t) => {
          const Icon = headlineThemes.find((h) => h.theme === t.theme)!.icon;
          return (
            <div key={t.theme} className="rounded-2xl border border-line/70 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted">{t.theme === "food" ? "Food quality" : themeLabels[t.theme]}</p>
                <Icon className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-4xl leading-none font-semibold text-forest tabular-nums">{fmt1(t.avg)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream" aria-hidden="true">
                <div className="h-full rounded-full bg-forest" style={{ width: `${(t.avg / 5) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-[0.7rem] text-muted">{t.count} ratings</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Guest satisfaction trend" sub="Average overall rating per week">
          <TrendChart data={trend} />
        </Panel>
        <Panel title="Reviews received" sub="Number of reviews per week">
          <VolumeChart data={trend} height={240} />
        </Panel>
        <Panel title="Satisfaction by service" sub="Average of all category ratings for each service">
          <ScoreBars data={serviceScores} />
        </Panel>
        <Panel title="Rating distribution" sub="Overall rating given">
          <DistributionChart data={distribution(reviews)} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {svc.map((s) => {
          const data = questions
            .filter((q) => q.service === s.id)
            .map((q) => ({ label: q.label, avg: Number(q.avg.toFixed(2)), count: q.count }));
          if (!data.length) return null;
          return (
            <Panel key={s.id} title={`${s.label.split(" / ")[0]} satisfaction`} sub="Average per question" action={<ServiceIcon name={s.icon} className="h-5 w-5 text-champagne-deep" />}>
              <ScoreBars data={data} />
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="What guests enjoy most" sub="Times each option was chosen" action={<BadgeCheck className="h-5 w-5 text-r5" aria-hidden="true" />}>
          <CountBars data={countOptions(reviews, "enjoyed").slice(0, 8)} />
        </Panel>
        <Panel title="What guests want improved" sub={`"Nothing, everything was great!" is excluded`}>
          <CountBars data={countOptions(reviews, "improve").slice(0, 8)} color="#b8652e" />
        </Panel>
        <Panel title="Reasons behind low ratings" sub="From guests who rated 1-2">
          <CountBars data={countOptions(reviews, "issueReasons").slice(0, 8)} color="#b8652e" />
        </Panel>
        <Panel title="What made 5-star visits special" sub="From guests who rated 5">
          <CountBars data={countOptions(reviews, "delightReasons").slice(0, 8)} />
        </Panel>
      </div>
    </div>
  );
}
