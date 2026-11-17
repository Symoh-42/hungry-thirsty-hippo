// SAMPLE DATA ONLY. These reviews are generated so the management dashboard has something to show
// during the demo. They are not real guests and every one is tagged "Sample" wherever it appears.
// Turn them off with `sampleReviews: false` in siteConfig.ts, or use "Clear sample data" in the admin.

import type { Review } from "@/lib/types";
import { generalQuestions, offeredServices, serviceById, type ServiceId } from "./services";
import { delightReasons, enjoyedOptions, improveOptions, issueReasons, NOTHING_TO_IMPROVE } from "./feedback";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const names = [
  "Wanjiru K.", "Otieno M.", "Achieng O.", "Kamau N.", "Njeri W.", "Mutua J.", "Chebet R.", "Kiprop S.",
  "Amina H.", "Brian O.", "Faith M.", "David K.", "Grace A.", "Peter N.", "Mercy W.", "Joseph T.",
  "Lucy N.", "Samuel K.", "Esther C.", "Daniel M.",
];

const positive = [
  "Lovely quiet place to rest after a day at the lake.",
  "The masala chai in the morning was just right.",
  "Friendly staff, clean room and a hot shower. What more do you need?",
  "We shared the weekend platter as a family and there was plenty for everyone.",
  "Great value for Naivasha. We will be back.",
  "Breakfast was fresh and the service was quick.",
  "Felt welcome from the moment we arrived.",
  "Good kienyeji chicken, worth the wait.",
];
const mixed = [
  "Food was good but it took a while to arrive.",
  "Room was fine, Wi-Fi was a bit slow in the evening.",
  "Nice place overall. More vegetarian options would help.",
  "Decent stay. The bathroom could have been cleaner.",
];
const negative = [
  "Waited almost an hour for our food on a busy Saturday.",
  "The room had not been cleaned properly when we checked in.",
  "Our order came out wrong twice.",
];

/** Areas that tend to score a little lower, so the analytics show something to act on. */
const bias: Record<string, number> = {
  dining_speed: -0.8,
  room_value: -0.2,
  menu_variety: -0.5,
  drinks_variety: -0.6,
  bathroom_cleanliness: -0.4,
  food_quality: 0.3,
  taste_freshness: 0.3,
  room_staff: 0.4,
  dining_staff: 0.3,
};

export function generateSampleReviews(count = 68, now = new Date()): Review[] {
  const rand = mulberry32(20261117);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const pickSome = <T,>(arr: T[], min: number, max: number) => {
    const n = min + Math.floor(rand() * (max - min + 1));
    return [...arr].sort(() => rand() - 0.5).slice(0, n);
  };
  const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)));
  const serviceIds = offeredServices.map((s) => s.id).filter((id) => id !== "other");

  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    // Recent weeks trend slightly better, so the trend chart has a story.
    const recency = i / count;
    const overall = r < 0.05 ? 1 : r < 0.13 ? 2 : r < 0.27 - recency * 0.05 ? 3 : r < 0.6 ? 4 : 5;

    const services = new Set<ServiceId>();
    services.add(rand() < 0.75 ? "dining" : pick(serviceIds));
    if (rand() < 0.5) services.add("accommodation");
    if (rand() < 0.35) services.add("drinks");
    if (rand() < 0.08 && offeredServices.some((s) => s.id === "other")) services.add("other");
    const svc = [...services].filter((id) => offeredServices.some((s) => s.id === id));

    const ratings: Record<string, number> = {};
    for (const id of svc) {
      for (const q of serviceById[id].questions) {
        if (rand() < 0.9) ratings[q.key] = clamp(overall + (bias[q.key] ?? 0) + (rand() - 0.5) * 1.6);
      }
    }
    for (const q of generalQuestions) ratings[q.key] = clamp(overall + (rand() - 0.5) * 1.2);
    ratings.overall_satisfaction = overall;

    const daysAgo = Math.floor((1 - recency) * 88 + rand() * 2);
    const created = new Date(now);
    created.setDate(created.getDate() - daysAgo);
    created.setHours(8 + Math.floor(rand() * 13), Math.floor(rand() * 60), 0, 0);
    if (created > now) created.setTime(now.getTime() - 3600_000);

    const good = overall >= 4;
    const comment =
      rand() < 0.55 ? (overall >= 4 ? pick(positive) : overall === 3 ? pick(mixed) : pick(negative)) : "";
    const anonymous = rand() < 0.2;

    const review: Review = {
      id: `sample-${i + 1}`,
      createdAt: created.toISOString(),
      services: svc,
      source: rand() < 0.4 ? pick(["restaurant", "rooms", "reception"]) : undefined,
      overall,
      ratings,
      enjoyed: pickSome(enjoyedOptions.filter((o) => o !== "Great entertainment" || rand() < 0.2), good ? 2 : 0, good ? 4 : 2),
      improve:
        overall === 5 && rand() < 0.6
          ? [NOTHING_TO_IMPROVE]
          : pickSome(
              ["Faster service", "Faster service", "More food options", "Improved cleanliness", "Better room facilities", "Better communication", "More affordable pricing"].filter(
                (o) => improveOptions.includes(o),
              ),
              1,
              overall <= 2 ? 3 : 2,
            ).filter((v, idx, a) => a.indexOf(v) === idx),
      issueReasons: overall <= 2 ? pickSome(issueReasons.slice(0, 7), 1, 3) : [],
      delightReasons: overall === 5 ? pickSome(delightReasons, 1, 3) : [],
      comment,
      guest: { name: anonymous ? "" : pick(names), email: "", phone: "" },
      resolved: overall <= 2 ? rand() < 0.6 : rand() < 0.15,
      sample: true,
    };
    if (overall <= 2 && review.resolved) {
      review.response = {
        text: "Thank you for telling us. We are sorry we let you down and have shared this with the team.",
        at: new Date(Math.min(created.getTime() + 86400_000, now.getTime())).toISOString(),
      };
    }
    reviews.push(review);
  }
  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
