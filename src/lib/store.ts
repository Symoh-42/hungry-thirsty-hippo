// Review storage. This demo keeps everything in the browser's localStorage, so each device has its own copy.
// For a real launch, swap these functions for calls to the API described in the README; the rest of the app
// only talks to this file.

import { useSyncExternalStore } from "react";
import { siteConfig } from "../../siteConfig";
import { generateSampleReviews } from "@/data/sampleReviews";
import type { Review, ReviewDraft } from "./types";

const KEY = "hth.reviews.v1";
const SEEDED_KEY = "hth.seeded.v1";
const LAST_SUBMIT_KEY = "hth.lastSubmit.v1";

let cache: Review[] | null = null;
const listeners = new Set<() => void>();

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked: the in-memory copy still works for this visit */
  }
}

function load(): Review[] {
  if (cache) return cache;
  const raw = safeGet(KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as Review[];
      return cache;
    } catch {
      /* fall through to a fresh start */
    }
  }
  cache = siteConfig.sampleReviews && !safeGet(SEEDED_KEY) ? generateSampleReviews() : [];
  safeSet(SEEDED_KEY, "1");
  persist();
  return cache;
}

function persist() {
  safeSet(KEY, JSON.stringify(cache ?? []));
}

function commit(next: Review[]) {
  cache = next;
  persist();
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  });
}

export function useReviews(): Review[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    load,
  );
}

/** A simple fingerprint so the same review can't be submitted twice by a double tap or a resubmit. */
function fingerprint(d: ReviewDraft) {
  return JSON.stringify([d.services, d.overall, d.ratings, d.enjoyed, d.improve, d.comment.trim(), d.guest.name.trim()]);
}

export class DuplicateReviewError extends Error {}

export function addReview(draft: ReviewDraft): Review {
  const fp = fingerprint(draft);
  const last = safeGet(LAST_SUBMIT_KEY);
  if (last) {
    try {
      const { fp: lastFp, at } = JSON.parse(last) as { fp: string; at: number };
      if (lastFp === fp && Date.now() - at < 30 * 60_000) {
        throw new DuplicateReviewError("This review has already been submitted. Thank you!");
      }
    } catch (e) {
      if (e instanceof DuplicateReviewError) throw e;
    }
  }
  const review: Review = {
    ...draft,
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    resolved: false,
  };
  commit([review, ...load()]);
  safeSet(LAST_SUBMIT_KEY, JSON.stringify({ fp, at: Date.now() }));
  return review;
}

export function updateReview(id: string, patch: Partial<Review>) {
  commit(load().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function clearSampleReviews() {
  commit(load().filter((r) => !r.sample));
}

export function restoreSampleReviews() {
  commit([...load().filter((r) => !r.sample), ...generateSampleReviews()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/* ---------- Admin session (demo only) ---------- */

const ADMIN_KEY = "hth.admin.v1";
export function isAdmin() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === "1";
  } catch {
    return false;
  }
}
export function setAdmin(on: boolean) {
  try {
    if (on) sessionStorage.setItem(ADMIN_KEY, "1");
    else sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}
