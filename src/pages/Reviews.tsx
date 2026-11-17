import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { siteConfig } from "../../siteConfig";
import { offeredServices, type ServiceId } from "@/data/services";
import { publicReviews, useReviews } from "@/lib/store";
import { avg, byService, distribution, fmt1 } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { ReviewCard } from "@/components/ReviewCard";
import { ServiceIcon, Stars } from "@/components/ui";

type Sort = "newest" | "highest" | "lowest";
const PAGE = 9;

export default function Reviews() {
  const all = useReviews();
  const shown = useMemo(() => publicReviews(all), [all]);
  const [filter, setFilter] = useState<ServiceId | "all">("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    document.title = `Guest Reviews | ${siteConfig.name}`;
  }, []);
  useEffect(() => setLimit(PAGE), [filter, sort]);

  const average = avg(shown.map((r) => r.overall));
  const dist = distribution(shown);
  const max = Math.max(1, ...dist.map((d) => d.count));
  const perService = byService(shown, offeredServices.map((s) => s.id)).filter((s) => s.count > 0);
  const hasSample = shown.some((r) => r.sample);

  const list = useMemo(() => {
    const rs = filter === "all" ? shown : shown.filter((r) => r.services.includes(filter));
    return [...rs].sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : sort === "highest"
          ? b.overall - a.overall || b.createdAt.localeCompare(a.createdAt)
          : a.overall - b.overall || b.createdAt.localeCompare(a.createdAt),
    );
  }, [shown, filter, sort]);

  return (
    <div className="pt-28 pb-24 sm:pt-32">
      <div className="container-x">
        <p className="eyebrow">Guest reviews</p>
        <h1 className="display mt-4 text-forest">What our guests say</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">Every review here was shared with the guest's permission and checked by our team.</p>
        {hasSample && (
          <p className="mt-6 flex max-w-2xl items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Reviews tagged <strong>Sample</strong> were generated to demonstrate this platform. They are not real guests. Reviews you submit on this device appear here once approved in the management dashboard.
            </span>
          </p>
        )}

        {/* Summary */}
        <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]" aria-label="Rating summary">
          <div className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
            <div className="text-center sm:pr-6 sm:text-left">
              <p className="font-display text-7xl leading-none text-forest">{fmt1(average)}</p>
              <Stars value={average} size={20} className="mt-2" />
              <p className="mt-2 text-sm text-muted">
                {shown.length} review{shown.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="space-y-2 self-center" aria-label="Rating distribution">
              {dist.map((d) => (
                <li key={d.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-muted">{d.stars} star</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                    <span className="block h-full rounded-full bg-champagne transition-all duration-700" style={{ width: `${(d.count / max) * 100}%` }} />
                  </span>
                  <span className="w-8 text-right text-muted tabular-nums">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">By service</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {perService.map((s) => {
                const svc = offeredServices.find((o) => o.id === s.id)!;
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl bg-ivory p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-moss">
                      <ServiceIcon name={svc.icon} className="h-5 w-5 text-forest" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{svc.label.split(" / ")[0]}</p>
                      <p className="text-xs text-muted">{s.count} reviews</p>
                    </div>
                    <span className="font-display text-2xl text-forest">{fmt1(s.avg)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Filters */}
        <div className="sticky top-[4.5rem] z-30 -mx-4 mt-10 border-b border-line/60 bg-ivory/90 px-4 py-3 backdrop-blur-xl sm:top-20 sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Filter by service">
              {[{ id: "all" as const, label: "All", icon: "Sparkles" }, ...offeredServices.map((s) => ({ id: s.id, label: s.short, icon: s.icon }))].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition",
                    filter === f.id ? "border-forest bg-forest text-white" : "border-line bg-white text-ink hover:border-champagne",
                  )}
                >
                  {f.id !== "all" && <ServiceIcon name={f.icon} className="h-4 w-4" />}
                  {f.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input min-h-10 w-auto py-1 pr-8 text-sm">
                <option value="newest">Newest</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted" aria-live="polite">
          Showing {Math.min(limit, list.length)} of {list.length}
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, limit).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
        {list.length === 0 && (
          <div className="card mt-4 p-10 text-center">
            <p className="font-display text-2xl text-forest">No reviews here yet.</p>
            <p className="mt-2 text-muted">Be the first to share your experience.</p>
          </div>
        )}
        {limit < list.length && (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-ghost">
              Show more reviews
            </button>
          </div>
        )}

        <div className="mt-16 rounded-3xl bg-forest p-8 text-center text-white sm:p-12">
          <h2 className="h2">Stayed or dined with us?</h2>
          <p className="mt-3 text-white/75">It takes about 30 seconds.</p>
          <Link to="/review" className="btn btn-gold mt-6">
            Leave a Review <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
