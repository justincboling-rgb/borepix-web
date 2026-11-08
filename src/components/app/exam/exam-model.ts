/**
 * Mock exam model: drawing items, pacing, grading, the stage reducer and sessionStorage persistence.
 * Everything here is pure except the storage helpers, which are only called from the client.
 */

import type { ContentCategory, ExamTrack } from "@/lib/content/types";
import { CATEGORIES } from "@/lib/content/types";
import { blueprints } from "@/lib/content/blueprints";
import { getQuestion, questionsFor } from "@/lib/content/questions";
import type { ExamAnswer, ExamResult } from "@/lib/store/progress";
import { mulberry32, shuffleWith } from "@/components/app/practice/random";

export const EXAM_STORAGE_KEY = "borepix:exam:active";

/* ───────────────────────── Setup ───────────────────────── */

export type ExamLength = "quick" | "standard" | "full";

export const LENGTH_TARGET: Record<Exclude<ExamLength, "full">, number> = { quick: 25, standard: 50 };

export const APPROXIMATE_MINUTES_PER_ITEM = 1.2;

export function bankSize(track: ExamTrack): number {
  return questionsFor(track).length;
}

/** Items for a length choice, capped by the bank. */
export function itemCount(track: ExamTrack, length: ExamLength): { count: number; capped: boolean } {
  const bank = bankSize(track);
  if (length === "full") return { count: bank, capped: false };
  const target = LENGTH_TARGET[length];
  return { count: Math.min(target, bank), capped: bank < target };
}

export type Pace = { minutesPerItem: number; approximate: boolean };

/**
 * Minutes per item. Uses the blueprint's verified appointment time spread across scored and pilot items;
 * otherwise an approximate 1.2 minutes per item.
 */
export function examPace(track: ExamTrack): Pace {
  const bp = blueprints[track];
  if (bp.scoredItems && bp.timeMinutes) {
    return { minutesPerItem: bp.timeMinutes / (bp.scoredItems + (bp.pilotItems ?? 0)), approximate: false };
  }
  return { minutesPerItem: APPROXIMATE_MINUTES_PER_ITEM, approximate: true };
}

/** Time limit in seconds for `count` items, rounded up to a whole minute. */
export function timeLimitSec(count: number, pace: Pace): number {
  const seconds = Math.round(pace.minutesPerItem * 60 * count);
  return Math.max(1, Math.ceil(seconds / 60)) * 60;
}

/** True when every blueprint category has a verified item count (so the draw can be proportional). */
export function hasBlueprintWeights(track: ExamTrack): boolean {
  const cats = blueprints[track].categories;
  return (
    CATEGORIES.every((c) => typeof cats.find((x) => x.id === c)?.items === "number") &&
    cats.some((x) => (x.items ?? 0) > 0)
  );
}

/**
 * Split `total` across buckets in proportion to `weights` (largest remainder), never exceeding `caps`.
 * Shortfalls in a capped bucket are redistributed to buckets that still have room.
 * `tieRank` orders buckets whose remainders tie (lower rank wins); defaults to index order.
 */
export function allocate(
  total: number,
  weights: readonly number[],
  caps: readonly number[],
  tieRank: readonly number[] = weights.map((_, i) => i),
): number[] {
  const alloc = weights.map(() => 0);
  let remaining = Math.min(total, caps.reduce((a, b) => a + b, 0));

  while (remaining > 0) {
    const open = caps.flatMap((cap, i) => (alloc[i] < cap ? [i] : []));
    if (!open.length) break;
    const weightSum = open.reduce((s, i) => s + Math.max(0, weights[i]), 0);
    const weightOf = (i: number) => (weightSum > 0 ? Math.max(0, weights[i]) / weightSum : 1 / open.length);

    const shares = open.map((i) => {
      const exact = remaining * weightOf(i);
      return { i, exact, n: Math.floor(exact) };
    });
    let left = remaining - shares.reduce((s, x) => s + x.n, 0);
    const byRemainder = [...shares].sort((a, b) => b.exact - b.n - (a.exact - a.n) || tieRank[a.i] - tieRank[b.i]);
    for (const s of byRemainder) {
      if (left <= 0) break;
      s.n += 1;
      left -= 1;
    }

    let given = 0;
    for (const s of shares) {
      const g = Math.min(caps[s.i] - alloc[s.i], s.n);
      alloc[s.i] += g;
      given += g;
    }
    if (given === 0) break;
    remaining -= given;
  }
  return alloc;
}

/**
 * Draw `count` question ids for a track. Categories are weighted by the blueprint's item counts when verified,
 * otherwise equally; the combined list is shuffled so categories interleave like the real exam.
 */
export function drawExamItems(track: ExamTrack, count: number, seed: number): string[] {
  const rand = mulberry32(seed);
  const pools = CATEGORIES.map((c) => shuffleWith(questionsFor(track, c), rand));
  const bp = blueprints[track];
  const weights = hasBlueprintWeights(track)
    ? CATEGORIES.map((c) => bp.categories.find((x) => x.id === c)?.items ?? 0)
    : CATEGORIES.map(() => 1);
  // Random tie-break so a leftover item does not always land in the same category.
  const tieRank = shuffleWith(CATEGORIES.map((_, i) => i), rand);
  const alloc = allocate(count, weights, pools.map((p) => p.length), tieRank);
  const picked = pools.flatMap((p, i) => p.slice(0, alloc[i]));
  return shuffleWith(picked, rand).map((q) => q.id);
}

/* ───────────────────────── State ───────────────────────── */

export type ActiveExam = {
  version: 1;
  id: string;
  track: ExamTrack;
  qids: string[];
  /** Chosen option per item, null when unanswered. */
  answers: (number | null)[];
  flagged: boolean[];
  /** Current item index. */
  index: number;
  startedAt: number;
  /** Epoch ms when time runs out. The countdown is always derived from this. */
  deadline: number;
  timeLimitSec: number;
  approximatePace: boolean;
  /** Showing the review-and-submit screen. */
  reviewing: boolean;
};

export type FinishedExam = {
  result: ExamResult;
  autoSubmitted: boolean;
  approximatePace: boolean;
};

export type ExamState =
  | { stage: "setup" }
  | { stage: "exam"; exam: ActiveExam }
  | ({ stage: "results" } & FinishedExam);

export type ExamAction =
  | { type: "start"; exam: ActiveExam }
  | { type: "select"; choice: number }
  | { type: "toggleFlag" }
  | { type: "goto"; index: number }
  | { type: "review"; open: boolean }
  | { type: "finish"; finished: FinishedExam }
  | { type: "reset" };

function patchExam(state: ExamState, fn: (exam: ActiveExam) => ActiveExam): ExamState {
  return state.stage === "exam" ? { stage: "exam", exam: fn(state.exam) } : state;
}

export function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case "start":
      return { stage: "exam", exam: action.exam };
    case "select":
      return patchExam(state, (e) => {
        if (e.reviewing || action.choice < 0 || action.choice > 3) return e;
        const answers = e.answers.slice();
        answers[e.index] = action.choice;
        return { ...e, answers };
      });
    case "toggleFlag":
      return patchExam(state, (e) => {
        if (e.reviewing) return e;
        const flagged = e.flagged.slice();
        flagged[e.index] = !flagged[e.index];
        return { ...e, flagged };
      });
    case "goto":
      return patchExam(state, (e) => {
        const index = Math.min(Math.max(0, action.index), e.qids.length - 1);
        return index === e.index && !e.reviewing ? e : { ...e, index, reviewing: false };
      });
    case "review":
      return patchExam(state, (e) => (e.reviewing === action.open ? e : { ...e, reviewing: action.open }));
    case "finish":
      return state.stage === "exam" ? { stage: "results", ...action.finished } : state;
    case "reset":
      return { stage: "setup" };
  }
}

/** Initial state: resume an in-progress attempt from this tab's sessionStorage when there is one. */
export function initExamState(): ExamState {
  const exam = loadActiveExam();
  return exam ? { stage: "exam", exam } : { stage: "setup" };
}

/* ───────────────────────── Grading ───────────────────────── */

export function gradeExam(exam: ActiveExam, finishedAt: number): ExamResult {
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, { correct: 0, total: 0 }])) as Record<
    ContentCategory,
    { correct: number; total: number }
  >;
  const answers: ExamAnswer[] = [];
  exam.qids.forEach((qid, i) => {
    const q = getQuestion(qid);
    if (!q) return;
    const choice = exam.answers[i] ?? null;
    const correct = choice !== null && choice === q.answer;
    byCategory[q.category].total += 1;
    if (correct) byCategory[q.category].correct += 1;
    answers.push({ qid, category: q.category, choice, correct, flagged: exam.flagged[i] ?? false });
  });
  return {
    id: exam.id,
    track: exam.track,
    startedAt: exam.startedAt,
    finishedAt,
    timeLimitSec: exam.timeLimitSec,
    total: answers.length,
    correct: answers.filter((a) => a.correct).length,
    byCategory,
    answers,
  };
}

/* ───────────────────────── Persistence (client only) ───────────────────────── */

export function saveActiveExam(exam: ActiveExam) {
  try {
    window.sessionStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(exam));
  } catch {
    /* storage blocked or full: the attempt still works in memory */
  }
}

export function clearActiveExam() {
  try {
    window.sessionStorage.removeItem(EXAM_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Reads and validates the stored attempt. Items no longer in the bank are dropped. */
export function loadActiveExam(): ActiveExam | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(EXAM_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<ActiveExam> | null;
    if (
      !d ||
      d.version !== 1 ||
      typeof d.id !== "string" ||
      (d.track !== "radiography" && d.track !== "mri") ||
      !Array.isArray(d.qids) ||
      !Array.isArray(d.answers) ||
      !Array.isArray(d.flagged) ||
      !isFiniteNumber(d.startedAt) ||
      !isFiniteNumber(d.deadline) ||
      !isFiniteNumber(d.timeLimitSec)
    ) {
      clearActiveExam();
      return null;
    }
    const qids: string[] = [];
    const answers: (number | null)[] = [];
    const flagged: boolean[] = [];
    d.qids.forEach((qid, i) => {
      const q = typeof qid === "string" ? getQuestion(qid) : undefined;
      if (!q || q.track !== d.track) return;
      const a = d.answers?.[i];
      qids.push(qid);
      answers.push(typeof a === "number" && a >= 0 && a <= 3 ? a : null);
      flagged.push(d.flagged?.[i] === true);
    });
    if (!qids.length) {
      clearActiveExam();
      return null;
    }
    const index = isFiniteNumber(d.index) ? Math.min(Math.max(0, Math.trunc(d.index)), qids.length - 1) : 0;
    return {
      version: 1,
      id: d.id,
      track: d.track,
      qids,
      answers,
      flagged,
      index,
      startedAt: d.startedAt,
      deadline: d.deadline,
      timeLimitSec: d.timeLimitSec,
      approximatePace: d.approximatePace !== false,
      reviewing: d.reviewing === true,
    };
  } catch {
    clearActiveExam();
    return null;
  }
}

/* ───────────────────────── Formatting ───────────────────────── */

/** "1:05:09" or "45:09". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm.padStart(2, "0")}:${ss}`;
}

/** "1 hr 5 min", "45 min", "38 min 12 s". */
export function formatDuration(totalSeconds: number, withSeconds = false): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} hr`);
  if (m || (!h && !withSeconds)) parts.push(`${m} min`);
  if (withSeconds && (sec || (!h && !m))) parts.push(`${sec} s`);
  return parts.join(" ");
}
