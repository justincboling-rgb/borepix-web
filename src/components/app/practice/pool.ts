import type { ContentCategory, ExamTrack, Question } from "@/lib/content/types";
import { CATEGORIES } from "@/lib/content/types";
import { questionsFor, topicsFor } from "@/lib/content/questions";
import type { AnswerRecord } from "@/lib/store/progress";

export type SessionLength = "10" | "20" | "all";

export const SESSION_LENGTHS: { value: SessionLength; label: string }[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "all", label: "All" },
];

export type PracticeFilters = {
  track: ExamTrack;
  category: ContentCategory | "all";
  /** A topic name, or "all". */
  topic: string;
  /** Only questions never answered, or whose most recent answer was incorrect. */
  onlyNeedsWork: boolean;
  length: SessionLength;
};

export function parseTrack(value: string | null): ExamTrack | null {
  return value === "radiography" || value === "mri" ? value : null;
}

export function parseCategory(value: string | null): ContentCategory | null {
  return value && (CATEGORIES as string[]).includes(value) ? (value as ContentCategory) : null;
}

/** Most recent result per question id (true = last attempt correct), across every study mode. */
export function lastResultByQuestion(answers: readonly AnswerRecord[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const a of answers) map.set(a.qid, a.correct);
  return map;
}

/** Topics available for a track, narrowed to the chosen category. Sorted (topicsFor order). */
export function topicOptions(track: ExamTrack, category: ContentCategory | "all"): string[] {
  if (category === "all") return topicsFor(track);
  const inCategory = new Set(questionsFor(track, category).map((q) => q.topic));
  return topicsFor(track).filter((t) => inCategory.has(t));
}

/** Questions matching track, category and topic (ignores the needs-work toggle). */
export function filteredQuestions(f: Pick<PracticeFilters, "track" | "category" | "topic">): Question[] {
  const base = questionsFor(f.track, f.category === "all" ? undefined : f.category);
  return f.topic === "all" ? base : base.filter((q) => q.topic === f.topic);
}

/** Questions that are unanswered or were missed on the most recent attempt. */
export function needsWork(questions: readonly Question[], last: Map<string, boolean>): Question[] {
  return questions.filter((q) => last.get(q.id) !== true);
}

export function sessionSize(poolSize: number, length: SessionLength): number {
  return length === "all" ? poolSize : Math.min(poolSize, Number(length));
}
