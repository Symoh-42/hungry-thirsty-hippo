import { MessageSquareReply, Quote } from "lucide-react";
import { serviceById } from "@/data/services";
import { NOTHING_TO_IMPROVE } from "@/data/feedback";
import type { Review } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { SampleTag, ServiceIcon, Stars } from "./ui";

export function ReviewCard({ review, compact, className }: { review: Review; compact?: boolean; className?: string }) {
  const name = review.guest.name.trim() || "Anonymous guest";
  const highlights = [...review.delightReasons, ...review.enjoyed].slice(0, compact ? 3 : 5);
  return (
    <article className={cn("card flex h-full flex-col p-5 sm:p-6", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss font-display text-lg font-semibold text-forest" aria-hidden="true">
            {name === "Anonymous guest" ? "A" : name[0]}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{name}</p>
            <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        {review.sample && <SampleTag />}
      </header>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Stars value={review.overall} />
        {review.services.map((s) => (
          <span key={s} className="chip py-0.5">
            <ServiceIcon name={serviceById[s].icon} className="h-3.5 w-3.5 text-champagne-deep" />
            {serviceById[s].short}
          </span>
        ))}
      </div>
      {review.comment && (
        <p className="relative mt-4 font-display text-[1.2rem] leading-snug text-ink">
          <Quote className="absolute -top-1 -left-1 h-4 w-4 -scale-x-100 text-champagne/60" aria-hidden="true" />
          <span className="pl-4">{review.comment}</span>
        </p>
      )}
      {highlights.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Highlights">
          {highlights.map((h) => (
            <li key={h} className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-medium text-forest">
              {h}
            </li>
          ))}
        </ul>
      )}
      {!compact && review.improve.filter((i) => i !== NOTHING_TO_IMPROVE).length > 0 && (
        <p className="mt-3 text-xs text-muted">
          <span className="font-semibold">Could improve:</span> {review.improve.filter((i) => i !== NOTHING_TO_IMPROVE).join(", ")}
        </p>
      )}
      {!compact && review.response && (
        <div className="mt-4 rounded-xl border-l-2 border-champagne bg-ivory p-3 text-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-forest">
            <MessageSquareReply className="h-3.5 w-3.5" aria-hidden="true" /> Response from management
          </p>
          <p className="mt-1 text-muted">{review.response.text}</p>
        </div>
      )}
    </article>
  );
}
