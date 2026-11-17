import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const INK2 = "#6b665d";
const GRID = "#e9e1d4";
const FOREST = "#1e3a2f";
const tick = { fill: INK2, fontSize: 12 };

export function Panel({ title, sub, action, children, className }: { title: string; sub?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line/70 bg-white p-5 shadow-card sm:p-6", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function TipBox({ active, payload, label, fmt }: { active?: boolean; payload?: { value: number; payload: Record<string, unknown> }[]; label?: string; fmt: (v: number, p: Record<string, unknown>) => string }) {
  if (!active || !payload?.length || payload[0].value == null) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-0.5 text-muted">{fmt(payload[0].value, payload[0].payload)}</p>
    </div>
  );
}

/** Weekly average rating, one series, fixed 1-5 scale. */
export function TrendChart({ data, height = 240 }: { data: { label: string; avg: number | null; count: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={16} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={tick} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ stroke: "#c9a96e", strokeDasharray: "3 3" }}
          content={<TipBox fmt={(v, p) => `${Number(v).toFixed(2)} average · ${p.count} reviews`} />}
        />
        <Line type="monotone" dataKey="avg" stroke={FOREST} strokeWidth={2} dot={{ r: 4, fill: FOREST, stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Review volume per week: a separate chart rather than a second axis. */
export function VolumeChart({ data, height = 160 }: { data: { label: string; count: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }} barCategoryGap={4}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={16} />
        <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgb(201 169 110 / 0.12)" }} content={<TipBox fmt={(v) => `${v} review${v === 1 ? "" : "s"}`} />} />
        <Bar dataKey="count" fill="#c9a96e" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal score bars on a 0-5 scale with the value written at the end. */
export function ScoreBars({ data, height }: { data: { label: string; avg: number; count?: number }[]; height?: number }) {
  const h = height ?? Math.max(120, data.length * 40 + 20);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={8}>
        <XAxis type="number" domain={[0, 5]} hide />
        <YAxis type="category" dataKey="label" width={150} tick={{ ...tick, fill: "#262624" }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgb(201 169 110 / 0.12)" }}
          content={<TipBox fmt={(v, p) => `${Number(v).toFixed(2)} / 5${p.count ? ` · ${p.count} ratings` : ""}`} />}
        />
        <Bar dataKey="avg" fill={FOREST} radius={[0, 4, 4, 0]} maxBarSize={20} background={{ fill: "#f3ece0", radius: 4 }}>
          <LabelList dataKey="avg" position="right" formatter={(v: unknown) => Number(v).toFixed(1)} style={{ fill: "#262624", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal count bars (e.g. most-picked feedback options). */
export function CountBars({ data, color = FOREST }: { data: { label: string; count: number }[]; color?: string }) {
  const h = Math.max(120, data.length * 36 + 10);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={8}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={170} tick={{ ...tick, fill: "#262624" }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgb(201 169 110 / 0.12)" }} content={<TipBox fmt={(v) => `Chosen ${v} time${v === 1 ? "" : "s"}`} />} />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={18}>
          <LabelList dataKey="count" position="right" style={{ fill: "#262624", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Rating distribution 1-5 as vertical bars. */
export function DistributionChart({ data }: { data: { stars: number; count: number }[] }) {
  const d = [...data].sort((a, b) => a.stars - b.stars).map((x) => ({ ...x, label: `${x.stars}★` }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={d} margin={{ top: 18, right: 8, bottom: 0, left: -18 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgb(201 169 110 / 0.12)" }} content={<TipBox fmt={(v) => `${v} review${v === 1 ? "" : "s"}`} />} />
        <Bar dataKey="count" fill="#c9a96e" radius={[4, 4, 0, 0]} maxBarSize={44}>
          <LabelList dataKey="count" position="top" style={{ fill: "#262624", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Kpi({ label, value, sub, icon, tone }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; tone?: "good" | "warn" }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted">{label}</p>
        {icon && <span className={cn("text-champagne-deep", tone === "good" && "text-r5", tone === "warn" && "text-r2")}>{icon}</span>}
      </div>
      <p className="mt-2 font-display text-4xl leading-none font-semibold text-forest tabular-nums">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
