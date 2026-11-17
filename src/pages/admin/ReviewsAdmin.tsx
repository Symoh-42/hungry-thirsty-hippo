import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquareReply,
  Phone,
  Search,
  ShieldOff,
  X,
} from "lucide-react";
import { generalQuestions, offeredServices, serviceById, type ServiceId } from "@/data/services";
import { ratingLabel } from "@/data/feedback";
import { updateReview, useReviews } from "@/lib/store";
import { exportCsv, exportPdf } from "@/lib/export";
import type { Review, ReviewStatus } from "@/lib/types";
import { cn, formatDate, relativeDate } from "@/lib/utils";
import { Face, SampleTag, ServiceIcon } from "@/components/ui";

const PAGE = 20;

export default function ReviewsAdmin() {
  const reviews = useReviews();
  const [params, setParams] = useSearchParams();
  const get = (k: string) => params.get(k) ?? "";
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    next.delete("open");
    setParams(next, { replace: true });
  };
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(params.get("open"));

  const f = { q: get("q"), from: get("from"), to: get("to"), service: get("service"), rating: get("rating"), status: get("status"), resolved: get("resolved") };
  useEffect(() => setLimit(PAGE), [params]);

  const list = useMemo(() => {
    const q = f.q.toLowerCase();
    return reviews.filter((r) => {
      const d = r.createdAt.slice(0, 10);
      if (f.from && d < f.from) return false;
      if (f.to && d > f.to) return false;
      if (f.service && !r.services.includes(f.service as ServiceId)) return false;
      if (f.rating === "low" && r.overall > 2) return false;
      if (f.rating && f.rating !== "low" && r.overall !== Number(f.rating)) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.resolved === "open" && r.resolved) return false;
      if (f.resolved === "resolved" && !r.resolved) return false;
      if (q && ![r.guest.name, r.comment, ...r.improve, ...r.enjoyed, ...r.issueReasons].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [reviews, f.q, f.from, f.to, f.service, f.rating, f.status, f.resolved]);

  const active = Object.values(f).filter(Boolean).length;
  const summary = active
    ? Object.entries(f)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${k === "service" ? serviceById[v as ServiceId]?.short : v}`)
        .join(" · ")
    : "All reviews";

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Review management</p>
          <h1 className="mt-2 text-4xl font-medium text-forest sm:text-5xl">All submissions</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => exportCsv(list)} className="btn btn-ghost min-h-11 px-4">
            <Download className="h-4 w-4" aria-hidden="true" /> CSV
          </button>
          <button type="button" onClick={() => exportPdf(list, summary)} className="btn btn-ghost min-h-11 px-4">
            <FileText className="h-4 w-4" aria-hidden="true" /> PDF
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="rounded-2xl border border-line/70 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <label className="relative sm:col-span-2 lg:col-span-4 xl:col-span-2">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search names, comments…" className="input min-h-11 pl-10 text-sm" />
          </label>
          <FilterInput label="From" type="date" value={f.from} onChange={(v) => set("from", v)} />
          <FilterInput label="To" type="date" value={f.to} onChange={(v) => set("to", v)} />
          <FilterSelect label="Service" value={f.service} onChange={(v) => set("service", v)} options={offeredServices.map((s) => [s.id, s.short])} />
          <FilterSelect
            label="Rating"
            value={f.rating}
            onChange={(v) => set("rating", v)}
            options={[["low", "1-2 (low)"], ["5", "5 Excellent"], ["4", "4 Good"], ["3", "3 Average"], ["2", "2 Poor"], ["1", "1 Very Poor"]]}
          />
          <FilterSelect
            label="Status"
            value={f.status || f.resolved}
            onChange={(v) => {
              const next = new URLSearchParams(params);
              next.delete("status");
              next.delete("resolved");
              next.delete("open");
              if (v === "open" || v === "resolved") next.set("resolved", v);
              else if (v) next.set("status", v);
              setParams(next, { replace: true });
            }}
            options={[["pending", "Pending approval"], ["approved", "Published"], ["rejected", "Rejected"], ["open", "Unresolved"], ["resolved", "Resolved"]]}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted">
          <span aria-live="polite">
            {list.length} of {reviews.length} reviews
          </span>
          {active > 0 && (
            <button type="button" onClick={() => setParams({}, { replace: true })} className="inline-flex items-center gap-1 font-semibold text-champagne-deep hover:underline">
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {list.slice(0, limit).map((r) => (
          <ReviewRow key={r.id} review={r} open={openId === r.id} onToggle={() => setOpenId(openId === r.id ? null : r.id)} />
        ))}
      </ul>
      {list.length === 0 && <p className="rounded-2xl bg-white p-10 text-center text-muted">No reviews match these filters.</p>}
      {limit < list.length && (
        <div className="text-center">
          <button type="button" className="btn btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
            Show more ({list.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}

function FilterInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="pointer-events-none absolute top-1 left-4 text-[0.6rem] font-semibold tracking-wider text-muted uppercase">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input min-h-11 pt-3.5 pb-0.5 text-sm" />
    </label>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("input min-h-11 text-sm", !value && "text-muted")}>
        <option value="">{label}: all</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

const statusStyle: Record<ReviewStatus, string> = {
  pending: "bg-amber-50 text-amber-900 border-amber-300/60",
  approved: "bg-moss text-forest border-forest/20",
  rejected: "bg-[#f6e7e4] text-r1 border-r1/20",
};
const statusText: Record<ReviewStatus, string> = { pending: "Pending", approved: "Published", rejected: "Rejected" };

function ReviewRow({ review: r, open, onToggle }: { review: Review; open: boolean; onToggle: () => void }) {
  const [reply, setReply] = useState(r.response?.text ?? "");
  const [saved, setSaved] = useState(false);
  const ratingEntries = [...r.services.flatMap((s) => serviceById[s].questions.map((q) => ({ ...q, icon: serviceById[s].icon }))), ...generalQuestions.map((q) => ({ ...q, icon: "Sparkles" }))].filter(
    (q) => r.ratings[q.key],
  );

  return (
    <li className={cn("overflow-hidden rounded-2xl border bg-white shadow-card transition", open ? "border-champagne" : "border-line/70")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left hover:bg-ivory/60 sm:gap-4">
        <Face level={r.overall} active size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{r.guest.name || "Anonymous"}</span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold", statusStyle[r.status])}>{statusText[r.status]}</span>
            {r.resolved && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-r5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Resolved
              </span>
            )}
            {!r.publishConsent && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted" title="The guest did not agree to public display">
                <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" /> Private
              </span>
            )}
            {r.sample && <SampleTag />}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">
            {r.services.map((s) => serviceById[s].short).join(", ")} · {r.comment || [...r.issueReasons, ...r.enjoyed].slice(0, 3).join(", ") || ratingLabel(r.overall)}
          </p>
        </div>
        <span className="hidden shrink-0 text-xs text-muted sm:block">{relativeDate(r.createdAt)}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted transition", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-line/70 bg-ivory/40 p-4 sm:p-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
              <span>{formatDate(r.createdAt, true)}</span>
              {r.source && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> QR: {r.source}
                </span>
              )}
              {r.guest.email && (
                <a href={`mailto:${r.guest.email}`} className="inline-flex items-center gap-1 text-forest hover:underline">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {r.guest.email}
                </a>
              )}
              {r.guest.phone && (
                <a href={`tel:${r.guest.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-forest hover:underline">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {r.guest.phone}
                </a>
              )}
            </div>
            {r.comment && <p className="font-display text-xl leading-snug">“{r.comment}”</p>}
            <Group title="What went wrong" items={r.issueReasons} warm />
            <Group title="What made it special" items={r.delightReasons} />
            <Group title="Enjoyed" items={r.enjoyed} />
            <Group title="Could improve" items={r.improve} warm />
            {ratingEntries.length > 0 && (
              <div>
                <p className="mb-2 text-[0.68rem] font-semibold tracking-[0.18em] text-muted uppercase">Ratings</p>
                <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {ratingEntries.map((q) => (
                    <li key={q.key} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">
                        <ServiceIcon name={q.icon} className="mr-1.5 inline h-3.5 w-3.5 text-champagne-deep" />
                        {q.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        {ratingLabel(r.ratings[q.key])} <Face level={r.ratings[q.key]} active size={18} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-line/70 bg-white p-4">
              <p className="text-sm font-semibold">Public testimonial</p>
              {r.publishConsent ? (
                <>
                  <p className="mt-1 text-xs text-muted">The guest agreed to public display. Only their name (or "Anonymous") is shown, never contact details.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateReview(r.id, { status: "approved" })}
                      disabled={r.status === "approved"}
                      className="btn btn-primary min-h-10 flex-1 px-3 text-xs"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" /> {r.status === "approved" ? "Published" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReview(r.id, { status: "rejected" })}
                      disabled={r.status === "rejected"}
                      className="btn btn-ghost min-h-10 flex-1 px-3 text-xs"
                    >
                      <X className="h-4 w-4" aria-hidden="true" /> {r.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted">The guest asked to keep this review private, so it can't be published.</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => updateReview(r.id, { resolved: !r.resolved })}
              className={cn("btn min-h-11 w-full", r.resolved ? "btn-ghost" : "bg-r5 text-white hover:opacity-90")}
            >
              {r.resolved ? <Circle className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              {r.resolved ? "Mark as unresolved" : "Mark as resolved"}
            </button>

            <div className="rounded-xl border border-line/70 bg-white p-4">
              <label htmlFor={`reply-${r.id}`} className="flex items-center gap-1.5 text-sm font-semibold">
                <MessageSquareReply className="h-4 w-4" aria-hidden="true" /> Respond to this review
              </label>
              <p className="mt-1 text-xs text-muted">Shown under the review on the public page once it's published.</p>
              <textarea
                id={`reply-${r.id}`}
                rows={3}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  setSaved(false);
                }}
                className="input mt-2 min-h-24 py-2 text-sm"
                placeholder="Thank you for staying with us…"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted" aria-live="polite">
                  {saved ? "Response saved." : r.response ? `Last saved ${relativeDate(r.response.at)}` : ""}
                </span>
                <button
                  type="button"
                  disabled={!reply.trim() || reply.trim() === r.response?.text}
                  onClick={() => {
                    updateReview(r.id, { response: { text: reply.trim(), at: new Date().toISOString() } });
                    setSaved(true);
                  }}
                  className="btn btn-primary min-h-10 px-4 text-xs"
                >
                  Save response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Group({ title, items, warm }: { title: string; items: string[]; warm?: boolean }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-muted uppercase">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", warm ? "bg-[#fbeee4] text-ink" : "bg-moss text-forest")}>
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
