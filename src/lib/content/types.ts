/**
 * Content model shared by the landing page, the web app and the content files.
 * Content files (questions, flashcards, lessons, blueprints) must satisfy these types exactly.
 */

export type ExamTrack = "radiography" | "mri";

/** The four ARRT® content categories used by both the Radiography and MRI exams. */
export type ContentCategory = "patient-care" | "safety" | "image-production" | "procedures";

export const TRACK_LABEL: Record<ExamTrack, string> = {
  radiography: "Radiography",
  mri: "MRI",
};

export const CATEGORY_LABEL: Record<ContentCategory, string> = {
  "patient-care": "Patient Care",
  safety: "Safety",
  "image-production": "Image Production",
  procedures: "Procedures",
};

export const CATEGORIES: ContentCategory[] = ["patient-care", "safety", "image-production", "procedures"];

export type Difficulty = 1 | 2 | 3;

export type Question = {
  /** Stable unique id, e.g. "rad-ip-014" or "mri-sa-003". Never reuse or renumber. */
  id: string;
  track: ExamTrack;
  category: ContentCategory;
  /** Short topic tag shown as a chip, e.g. "Exposure factors", "Zone IV screening". */
  topic: string;
  difficulty: Difficulty;
  /** The question stem. Plain text. */
  stem: string;
  /** Exactly four options, plain text, no "A." prefixes. */
  choices: [string, string, string, string];
  /** Index of the single best answer. */
  answer: 0 | 1 | 2 | 3;
  /** Why the answer is correct, 2–4 sentences, clinically precise. */
  rationale: string;
  /** Optional one-line note per choice explaining why it is wrong (or right). Same order as choices. */
  choiceNotes?: [string, string, string, string];
};

export type Flashcard = {
  id: string;
  track: ExamTrack;
  topic: string;
  front: string;
  back: string;
};

/** Interactive labs that MRI lessons can embed. Implemented in src/components/app/labs. */
export type LabId = "larmor" | "relaxation" | "kspace" | "sar";

export type LessonSection = {
  heading: string;
  /** Paragraphs of plain text. */
  body: string[];
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: "Foundations" | "Core" | "Advanced";
  minutes: number;
  sections: LessonSection[];
  keyPoints: string[];
  /** Optional embedded interactive lab, rendered after the sections. */
  lab?: LabId;
  /** Question ids (MRI track) used as the lesson check. */
  checkQuestionIds?: string[];
};

/** Published structure of an ARRT exam, used to shape mock exams and readiness reports. */
export type ExamBlueprint = {
  track: ExamTrack;
  name: string;
  /** Scored items on the real exam, if verified from ARRT's published materials. */
  scoredItems: number | null;
  /** Unscored pilot items, if verified. */
  pilotItems: number | null;
  /** Total appointment/testing minutes, if verified. */
  timeMinutes: number | null;
  categories: { id: ContentCategory; items: number | null }[];
  /** URL of the ARRT document the numbers came from. */
  source: string;
  /** ISO date the numbers were checked. */
  verifiedAt: string;
};
