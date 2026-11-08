import type { ContentCategory, ExamTrack, Question } from "@/lib/content/types";
import { radiographyQuestions } from "./radiography";
import { mriQuestions } from "./mri";

export const allQuestions: Question[] = [...radiographyQuestions, ...mriQuestions];

const byId = new Map(allQuestions.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function questionsFor(track: ExamTrack, category?: ContentCategory): Question[] {
  return allQuestions.filter((q) => q.track === track && (!category || q.category === category));
}

export function topicsFor(track: ExamTrack): string[] {
  return Array.from(new Set(questionsFor(track).map((q) => q.topic))).sort();
}

/**
 * Three questions for the landing page "Try a question" widget: one Radiography Image Production,
 * one MRI Safety, one MRI Image Production. Deterministic so server and client render the same set.
 */
export function getFeaturedQuestions(): Question[] {
  const pick = (track: ExamTrack, category: ContentCategory) =>
    questionsFor(track, category).find((q) => q.difficulty === 2) ?? questionsFor(track, category)[0];
  return [pick("mri", "safety"), pick("radiography", "image-production"), pick("mri", "image-production")].filter(
    (q): q is Question => Boolean(q),
  );
}
