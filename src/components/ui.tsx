import type { CSSProperties, ReactNode } from "react";
import {
  BedDouble,
  CupSoda,
  Flower2,
  Mountain,
  PartyPopper,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { cn, img } from "@/lib/utils";
import { siteConfig } from "../../siteConfig";

/* ---------- Honesty labels ---------- */

export function ConfirmLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex translate-y-[-1px] items-center rounded-sm border border-amber-500/50 bg-amber-100 px-1.5 py-px align-middle font-sans text-[0.56rem] font-bold tracking-[0.12em] text-amber-900 not-italic uppercase",
        className,
      )}
      title={`Detail to be confirmed by ${siteConfig.name} before publication`}
    >
      To confirm
    </span>
  );
}

/** Renders text; any "(confirm)" becomes a visible TO CONFIRM label. */
export function Txt({ children }: { children: string }) {
  if (!children.includes("(confirm")) return <>{children}</>;
  const clean = children.replace(/\s*\((confirm[^)]*)\)/g, "").trim();
  return (
    <>
      {clean}
      <ConfirmLabel />
    </>
  );
}

export function SampleTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.14em] text-amber-900 uppercase",
        className,
      )}
      title="Demonstration review generated for this concept. Not a real guest."
    >
      Sample
    </span>
  );
}

/* ---------- Brand ---------- */

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src={img("hippo-icon.png")}
        alt=""
        width={44}
        height={44}
        className={cn("h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11", light ? "drop-shadow-[0_2px_6px_rgb(0_0_0/0.4)]" : "")}
      />
      <span className={cn("font-script leading-[0.9]", light ? "text-white" : "text-hippo", compact ? "text-[1.35rem]" : "text-[1.45rem] sm:text-[1.65rem]")}>
        The Hungry &amp;
        <br />
        Thirsty Hippo
      </span>
    </span>
  );
}

/* ---------- Icons ---------- */

const icons: Record<string, LucideIcon> = { BedDouble, CupSoda, Flower2, Mountain, PartyPopper, Sparkles, UtensilsCrossed, Waves };

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.6} />;
}

/* ---------- Ratings ---------- */

export const ratingColor = ["", "var(--color-r1)", "var(--color-r2)", "var(--color-r3)", "var(--color-r4)", "var(--color-r5)"];

/** Mouth paths from frown (1) to big smile (5), on a 48x48 face. */
const mouths = [
  "",
  "M15 34 Q24 25 33 34",
  "M16 32 Q24 28 32 32",
  "M16 31 L32 31",
  "M15 29 Q24 36 33 29",
  "M13 27 Q24 41 35 27 Z",
];

export function Face({ level, active, size = 48 }: { level: number; active?: boolean; size?: number }) {
  const color = ratingColor[level];
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="block">
      <circle cx="24" cy="24" r="21" fill={active ? color : "white"} stroke={color} strokeWidth={active ? 0 : 2} />
      {level === 1 && <path d="M14 15 L20 18 M34 15 L28 18" stroke={active ? "white" : color} strokeWidth="2.2" strokeLinecap="round" />}
      <circle cx="17.5" cy="21" r="2.6" fill={active ? "white" : color} />
      <circle cx="30.5" cy="21" r="2.6" fill={active ? "white" : color} />
      <path
        d={mouths[level]}
        stroke={active ? "white" : color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={level === 5 ? (active ? "white" : color) : "none"}
      />
      {level === 5 && active && (
        <>
          <circle cx="12" cy="28" r="2.8" fill="white" opacity="0.25" />
          <circle cx="36" cy="28" r="2.8" fill="white" opacity="0.25" />
        </>
      )}
    </svg>
  );
}

export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-sand" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-champagne" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* ---------- Layout bits ---------- */

export function SectionHeading({ eyebrow, title, intro, center, className }: { eyebrow: string; title: ReactNode; intro?: ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      <p className={cn("eyebrow", center && "justify-center")}>{eyebrow}</p>
      <h2 className="h2 mt-4 text-forest">{title}</h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}
    </div>
  );
}

export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
