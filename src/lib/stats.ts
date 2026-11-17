import { allQuestions, questionByKey, services, themeLabels, type ServiceId, type Theme } from "@/data/services";
import { NOTHING_TO_IMPROVE } from "@/data/feedback";
import type { Review } from "./types";

export const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const fmt1 = (n: number) => (Number.isFinite(n) && n > 0 ? n.toFixed(1) : "–");

export function distribution(reviews: Review[]) {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.overall === stars).length,
  }));
}

/** Average of every category rating a review gave for one service. */
function serviceScore(r: Review, id: ServiceId) {
  const keys = services.find((s) => s.id === id)?.questions.map((q) => q.key) ?? [];
  const vals = keys.map((k) => r.ratings[k]).filter((v): v is number => typeof v === "number");
  return vals.length ? avg(vals) : r.overall;
}

export function byService(reviews: Review[], ids: ServiceId[]) {
  return ids.map((id) => {
    const rs = reviews.filter((r) => r.services.includes(id));
    return { id, count: rs.length, avg: avg(rs.map((r) => serviceScore(r, id))) };
  });
}

export function byTheme(reviews: Review[], themes: Theme[]) {
  return themes.map((t) => {
    const keys = allQuestions.filter((q) => q.theme === t).map((q) => q.key);
    const vals = reviews.flatMap((r) => keys.map((k) => r.ratings[k]).filter((v): v is number => typeof v === "number"));
    return { theme: t, label: themeLabels[t], avg: avg(vals), count: vals.length };
  });
}

export function byQuestion(reviews: Review[]) {
  const sums = new Map<string, number[]>();
  for (const r of reviews) for (const [k, v] of Object.entries(r.ratings)) sums.set(k, [...(sums.get(k) ?? []), v]);
  return [...sums.entries()]
    .filter(([k]) => questionByKey[k])
    .map(([k, vals]) => ({ key: k, label: questionByKey[k].label, service: questionByKey[k].service, avg: avg(vals), count: vals.length }));
}

export function countOptions(reviews: Review[], field: "enjoyed" | "improve" | "issueReasons" | "delightReasons") {
  const m = new Map<string, number>();
  for (const r of reviews) for (const o of r[field]) if (o !== NOTHING_TO_IMPROVE) m.set(o, (m.get(o) ?? 0) + 1);
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function periodCounts(reviews: Review[], now = new Date()) {
  const today = startOfDay(now);
  const week = new Date(today);
  week.setDate(week.getDate() - ((today.getDay() + 6) % 7)); // Monday
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const since = (d: Date) => reviews.filter((r) => new Date(r.createdAt) >= d).length;
  return { today: since(today), week: since(week), month: since(month) };
}

/** Weekly average rating and volume for the last `weeks` weeks (oldest first). */
export function weeklyTrend(reviews: Review[], weeks = 12, now = new Date()) {
  const end = startOfDay(now);
  end.setDate(end.getDate() + 1);
  return Array.from({ length: weeks }, (_, i) => {
    const to = new Date(end);
    to.setDate(to.getDate() - (weeks - 1 - i) * 7);
    const from = new Date(to);
    from.setDate(from.getDate() - 7);
    const rs = reviews.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= from && d < to;
    });
    return {
      label: from.toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
      avg: rs.length ? Number(avg(rs.map((r) => r.overall)).toFixed(2)) : null,
      count: rs.length,
    };
  });
}

export const positiveShare = (reviews: Review[]) =>
  reviews.length ? Math.round((reviews.filter((r) => r.overall >= 4).length / reviews.length) * 100) : 0;
