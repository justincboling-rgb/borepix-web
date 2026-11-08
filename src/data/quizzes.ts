import { quizQuestions } from "./quiz-questions";
import { QUIZ_CATEGORIES, QUIZ_CATEGORY_LABEL, type Quiz, type QuizCategory, type QuizQuestion } from "./types";

/**
 * The three free self-quizzes, one per workbook. Each previews the certifying test key sold in the store:
 * the quiz is free and unscored beyond the session, the key is the only paid step.
 */
export const quizzes: Quiz[] = [
  {
    slug: "mri-anatomy",
    title: QUIZ_CATEGORY_LABEL["mri-anatomy"],
    modality: "mri",
    description:
      "Basal ganglia to cardiac planes. Identify the structure, the level and the plane the way a lead MRI technologist reads a localizer.",
    minutes: 12,
    workbookSlug: "mri-cross-sectional-anatomy",
    testKeySlug: "advanced-cross-sectional-anatomy-complete-suite",
  },
  {
    slug: "ir-vascular",
    title: QUIZ_CATEGORY_LABEL["ir-vascular"],
    modality: "ir",
    description:
      "Femoral and radial access, Seldinger steps, arch and visceral anatomy, dose and contrast decisions, and the complications you must recognise first.",
    minutes: 14,
    workbookSlug: "vascular-ir-pathways",
    testKeySlug: "interventional-radiology-vascular-access-key",
  },
  {
    slug: "ct-protocols",
    title: QUIZ_CATEGORY_LABEL["ct-protocols"],
    modality: "ct",
    description:
      "Phase timing, bolus tracking, iodine delivery rate, dual-energy reconstructions, dose metrics and the renal and paediatric adjustments a CT lead signs off.",
    minutes: 13,
    workbookSlug: "advanced-ct-protocols",
    testKeySlug: "advanced-ct-protocols-contrast-timing-test-key",
  },
];

/** True when a URL slug names one of the three quiz categories. */
export function isQuizCategory(slug: string): slug is QuizCategory {
  return (QUIZ_CATEGORIES as string[]).includes(slug);
}

export function getQuiz(slug: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.slug === slug);
}

/** Every item in a category, in bank order. */
export function questionsFor(category: QuizCategory): QuizQuestion[] {
  return quizQuestions.filter((question) => question.category === category);
}

/** The first `n` items of a category. Deterministic, so the landing preview and the full quiz agree. */
export function previewQuestionsFor(category: QuizCategory, n: number): QuizQuestion[] {
  return questionsFor(category).slice(0, Math.max(0, n));
}

export function questionCountFor(category: QuizCategory): number {
  return questionsFor(category).length;
}
