import { useState, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { ratingScale } from "@/data/feedback";
import { cn } from "@/lib/utils";
import { Face, ratingColor } from "./ui";

function useArrowKeys(value: number | undefined, onChange: (v: number) => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (value ?? 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, (value ?? 2) - 1));
    }
  };
}

/** The big five-face scale used for the overall rating. */
export function BigFaceScale({ value, onChange, label }: { value?: number; onChange: (v: number) => void; label: string }) {
  const onKey = useArrowKeys(value, onChange);
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey} className="grid grid-cols-5 gap-1.5 sm:gap-3">
      {ratingScale.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active || (!value && r.value === 3) ? 0 : -1}
            onClick={() => onChange(r.value)}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-2xl border-2 px-1 py-3 transition-all duration-300 sm:py-5",
              active ? "border-transparent bg-white shadow-lift" : "border-transparent hover:bg-white/70",
            )}
            style={active ? { boxShadow: `0 0 0 2px ${ratingColor[r.value]}, var(--shadow-lift)` } : undefined}
          >
            <span className={cn("transition-transform duration-300", active ? "pop" : "group-hover:scale-105", !!value && !active && "opacity-55")}>
              <Face level={r.value} active={active} size={60} />
            </span>
            <span className={cn("text-[0.68rem] leading-tight font-semibold sm:text-sm", active ? "text-ink" : "text-muted")}>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** One compact row per category question. */
export function FaceRow({ id, label, value, onChange }: { id: string; label: string; value?: number; onChange: (v: number | undefined) => void }) {
  const onKey = useArrowKeys(value, onChange);
  const [justSet, setJustSet] = useState<number | null>(null);
  return (
    <div className="card p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
      <div className="flex items-baseline justify-between gap-2 sm:block">
        <p className="font-semibold text-ink" id={`q-${id}`}>
          {label}
        </p>
        <p className="h-5 text-xs font-semibold sm:mt-0.5" style={{ color: value ? ratingColor[value] : undefined }} aria-live="polite">
          {value ? ratingScale[value - 1].label : <span className="font-normal text-muted/70">Tap a face</span>}
        </p>
      </div>
      <div role="radiogroup" aria-labelledby={`q-${id}`} onKeyDown={onKey} className="mt-3 flex justify-between gap-1 sm:mt-0 sm:gap-2">
        {ratingScale.map((r) => {
          const active = value === r.value;
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={r.label}
              title={r.label}
              tabIndex={active || (!value && r.value === 3) ? 0 : -1}
              onClick={() => {
                onChange(active ? undefined : r.value);
                setJustSet(r.value);
              }}
              className="grid h-14 w-14 place-items-center rounded-full transition hover:bg-cream sm:h-12 sm:w-12"
            >
              <span className={cn("transition-transform", active && justSet === r.value && "pop", active && "scale-110", !!value && !active && "opacity-45")}>
                <Face level={r.value} active={active} size={42} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Selectable pill for "what did you enjoy" style questions. */
export function OptionPill({ label, selected, onToggle, tone = "forest" }: { label: string; selected: boolean; onToggle: () => void; tone?: "forest" | "warm" }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[0.95rem] font-medium transition-all duration-200 active:scale-[0.98]",
        selected
          ? tone === "warm"
            ? "border-r2 bg-[#fbeee4] text-ink"
            : "border-forest bg-moss text-forest"
          : "border-line bg-white text-ink hover:border-champagne",
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
          selected ? (tone === "warm" ? "border-r2 bg-r2 text-white" : "border-forest bg-forest text-white") : "border-line",
        )}
        aria-hidden="true"
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
