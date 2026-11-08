"use client";

/**
 * Borepix learner progress store.
 *
 * Front-end only for now: everything persists to localStorage under one versioned key, so the web app
 * works end to end without a backend. Swap the load/save functions for API calls when accounts exist.
 *
 * SSR-safe: components read state through useSyncExternalStore with a stable server snapshot,
 * so server HTML and the first client render always match.
 */

import { useSyncExternalStore } from "react";
import type { ContentCategory, ExamTrack } from "@/lib/content/types";
import type { PlanId } from "@/lib/site";

const STORAGE_KEY = "borepix:progress:v1";

export type Profile = {
  /** Display name: "First Last" when both parts are known. */
  name: string;
  email: string;
  track: ExamTrack;
  /** ISO date (YYYY-MM-DD) of the learner's scheduled exam, if set. */
  examDate?: string;
  plan?: PlanId | "trial";
  createdAt: number;
  firstName?: string;
  lastName?: string;
  /** E.164-style phone number with country code, e.g. "+12015550123". */
  phone?: string;
  postalCode?: string;
};

export type AnswerRecord = {
  qid: string;
  track: ExamTrack;
  category: ContentCategory;
  choice: number;
  correct: boolean;
  mode: "practice" | "exam" | "lesson";
  at: number;
  ms?: number;
};

export type ExamAnswer = {
  qid: string;
  category: ContentCategory;
  /** null when the question was left unanswered. */
  choice: number | null;
  correct: boolean;
  flagged: boolean;
};

export type ExamResult = {
  id: string;
  track: ExamTrack;
  startedAt: number;
  finishedAt: number;
  /** Seconds allowed when the attempt started. */
  timeLimitSec: number;
  total: number;
  correct: number;
  byCategory: Record<ContentCategory, { correct: number; total: number }>;
  answers: ExamAnswer[];
};

/** SM-2 style scheduling state for one flashcard. */
export type CardState = {
  ease: number;
  /** Interval in days. */
  interval: number;
  reps: number;
  lapses: number;
  /** Epoch ms when the card is next due. */
  due: number;
  lastReviewed: number;
};

/** 0 = again, 1 = hard, 2 = good, 3 = easy */
export type ReviewGrade = 0 | 1 | 2 | 3;

export type ProgressState = {
  version: 1;
  /** The signed-in profile, or null for a guest. */
  profile: Profile | null;
  /** The most recent profile that signed out on this device, so logging in with the same email restores it. */
  lastProfile: Profile | null;
  answers: AnswerRecord[];
  exams: ExamResult[];
  cards: Record<string, CardState>;
  lessonsDone: string[];
  /** Local calendar days (YYYY-MM-DD) with any study activity, ascending, unique. */
  studyDays: string[];
};

const EMPTY: ProgressState = Object.freeze({
  version: 1,
  profile: null,
  lastProfile: null,
  answers: [],
  exams: [],
  cards: {},
  lessonsDone: [],
  studyDays: [],
}) as ProgressState;

const MAX_ANSWERS = 5000;
const MAX_EXAMS = 100;

let state: ProgressState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    if (!parsed || parsed.version !== 1) return EMPTY;
    return {
      version: 1,
      profile: parsed.profile ?? null,
      lastProfile: parsed.lastProfile ?? null,
      answers: Array.isArray(parsed.answers) ? parsed.answers : [],
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      cards: parsed.cards && typeof parsed.cards === "object" ? parsed.cards : {},
      lessonsDone: Array.isArray(parsed.lessonsDone) ? parsed.lessonsDone : [],
      studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays : [],
    };
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = load();
    loaded = true;
  }
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked (private mode): keep working in memory */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function update(mutator: (s: ProgressState) => ProgressState) {
  ensureLoaded();
  state = mutator(state);
  save();
  emit();
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

/** Read the whole progress state. Re-renders on every change. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * True once the component has hydrated on the client and real (localStorage) state is available.
 * Use it to avoid flashing "empty" UI before stored progress appears.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
function noopSubscribe() {
  return () => {};
}

/* ───────────────────────── Dates ───────────────────────── */

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function withStudyDay(days: string[], ts: number): string[] {
  const k = dayKey(ts);
  return days.includes(k) ? days : [...days, k].sort();
}

/* ───────────────────────── Actions ───────────────────────── */

export function setProfile(profile: Profile) {
  update((s) => ({ ...s, profile }));
}

export function updateProfile(patch: Partial<Profile>) {
  update((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s));
}

/** Signs out on this device. Study history stays, and the profile is kept so the same email can sign back in. */
export function signOut() {
  update((s) => ({ ...s, profile: null, lastProfile: s.profile ?? s.lastProfile }));
}

/**
 * Local sign-in: restores the profile stored on this device for `email` (case-insensitive).
 * Returns false when no profile on this device matches.
 */
export function signInLocal(email: string): boolean {
  ensureLoaded();
  const want = email.trim().toLowerCase();
  const match = [state.profile, state.lastProfile].find((p) => p && p.email.trim().toLowerCase() === want);
  if (!match) return false;
  update((s) => ({ ...s, profile: match, lastProfile: null }));
  return true;
}

/** Clears study history (answers, exams, flashcard schedule, lessons, streak). The profile is kept. */
export function resetProgress() {
  update((s) => ({ ...EMPTY, profile: s.profile }));
}

export function recordAnswer(a: Omit<AnswerRecord, "at"> & { at?: number }) {
  const at = a.at ?? Date.now();
  update((s) => ({
    ...s,
    answers: [...s.answers, { ...a, at }].slice(-MAX_ANSWERS),
    studyDays: withStudyDay(s.studyDays, at),
  }));
}

export function saveExamResult(result: ExamResult) {
  update((s) => ({
    ...s,
    exams: [...s.exams.filter((e) => e.id !== result.id), result].slice(-MAX_EXAMS),
    answers: [
      ...s.answers,
      ...result.answers
        .filter((x) => x.choice !== null)
        .map<AnswerRecord>((x) => ({
          qid: x.qid,
          track: result.track,
          category: x.category,
          choice: x.choice as number,
          correct: x.correct,
          mode: "exam",
          at: result.finishedAt,
        })),
    ].slice(-MAX_ANSWERS),
    studyDays: withStudyDay(s.studyDays, result.finishedAt),
  }));
}

export function completeLesson(slug: string) {
  update((s) => ({
    ...s,
    lessonsDone: s.lessonsDone.includes(slug) ? s.lessonsDone : [...s.lessonsDone, slug],
    studyDays: withStudyDay(s.studyDays, Date.now()),
  }));
}

/* ───────────────────────── Spaced repetition (SM-2 variant) ───────────────────────── */

const DAY = 86_400_000;

export function nextCardState(prev: CardState | undefined, grade: ReviewGrade, now: number = Date.now()): CardState {
  const base: CardState = prev ?? { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, lastReviewed: 0 };
  // Map 4-button grades onto SM-2 quality 0–5.
  const q = [1, 3, 4, 5][grade];
  let { ease, interval, reps, lapses } = base;

  if (q < 3) {
    reps = 0;
    lapses += 1;
    interval = 0; // relearn: due again in 10 minutes
  } else {
    reps += 1;
    if (reps === 1) interval = grade === 3 ? 3 : 1;
    else if (reps === 2) interval = grade === 3 ? 8 : 6;
    else interval = Math.round(interval * ease * (grade === 1 ? 0.8 : grade === 3 ? 1.3 : 1));
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  const due = interval === 0 ? now + 10 * 60_000 : now + interval * DAY;
  return { ease: Number(ease.toFixed(2)), interval, reps, lapses, due, lastReviewed: now };
}

export function reviewCard(cardId: string, grade: ReviewGrade) {
  const now = Date.now();
  update((s) => ({
    ...s,
    cards: { ...s.cards, [cardId]: nextCardState(s.cards[cardId], grade, now) },
    studyDays: withStudyDay(s.studyDays, now),
  }));
}

/* ───────────────────────── Selectors ───────────────────────── */

/** Consecutive days of study ending today (or yesterday, so a streak is not lost before today's session). */
export function getStreak(s: ProgressState, now: number = Date.now()): number {
  if (!s.studyDays.length) return 0;
  const set = new Set(s.studyDays);
  let cursor = now;
  if (!set.has(dayKey(cursor))) {
    cursor -= DAY;
    if (!set.has(dayKey(cursor))) return 0;
  }
  let n = 0;
  while (set.has(dayKey(cursor))) {
    n += 1;
    cursor -= DAY;
  }
  return n;
}

export type Mastery = { category: ContentCategory; correct: number; total: number; pct: number | null };

/** Accuracy per content category for a track, using the most recent 200 answers per category. */
export function getCategoryMastery(s: ProgressState, track: ExamTrack): Mastery[] {
  const cats: ContentCategory[] = ["patient-care", "safety", "image-production", "procedures"];
  return cats.map((category) => {
    const rows = s.answers.filter((a) => a.track === track && a.category === category).slice(-200);
    const correct = rows.filter((r) => r.correct).length;
    return { category, correct, total: rows.length, pct: rows.length ? Math.round((correct / rows.length) * 100) : null };
  });
}

/**
 * Readiness estimate 0–100 for a track, or null with fewer than 20 answers.
 * Weighted toward recent performance; it is a study signal, not a score prediction.
 */
export function getReadiness(s: ProgressState, track: ExamTrack): number | null {
  const rows = s.answers.filter((a) => a.track === track).slice(-300);
  if (rows.length < 20) return null;
  let num = 0;
  let den = 0;
  rows.forEach((r, i) => {
    const w = 0.5 + (i / rows.length) * 1.5; // newer answers weigh up to 4x older ones
    num += (r.correct ? 1 : 0) * w;
    den += w;
  });
  return Math.round((num / den) * 100);
}

export function getDueCards(s: ProgressState, cardIds: string[], now: number = Date.now()): string[] {
  return cardIds.filter((id) => {
    const c = s.cards[id];
    return !c || c.due <= now;
  });
}
