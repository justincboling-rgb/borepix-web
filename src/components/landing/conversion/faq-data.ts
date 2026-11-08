import { CATEGORIES, CATEGORY_LABEL } from "@/lib/content/types";

export type FaqItem = {
  /** Stable slug, used for element ids. */
  id: string;
  question: string;
  /** Plain-text paragraphs. Rendered on the page and reused verbatim for the FAQPage JSON-LD. */
  answer: string[];
  /** Optional follow-up link rendered after the answer. */
  link?: { href: string; label: string };
};

const categoryLabels = CATEGORIES.map((c) => CATEGORY_LABEL[c]);
const categoryList = `${categoryLabels.slice(0, -1).join(", ")} and ${categoryLabels[categoryLabels.length - 1]}`;

/**
 * Landing-page FAQ. Every answer must stay true of the product as built: no CE-credit claims, no score
 * predictions, and "coming soon" for anything not live yet.
 */
export const faqs: FaqItem[] = [
  {
    id: "affiliation",
    question: "Is Borepix affiliated with or endorsed by ARRT®?",
    answer: [
      "No. Borepix is an independent educational provider. It is not affiliated with, sponsored by, or endorsed by The American Registry of Radiologic Technologists (ARRT). ARRT® is a registered trademark of ARRT.",
    ],
  },
  {
    id: "real-questions",
    question: "Are these real ARRT exam questions?",
    answer: [
      "No. Every Borepix question is original. Questions are written to reflect the content categories ARRT publishes for each exam and the style of registry items, but none of them are actual exam items.",
      "Each question includes a rationale that explains why the best answer is correct.",
    ],
  },
  {
    id: "exams",
    question: "Which exams does Borepix cover?",
    answer: [
      `Radiography and MRI today. Both question banks are organized by the four content categories used on those exams: ${categoryList}.`,
    ],
  },
  {
    id: "mock-exams",
    question: "How do mock exams work?",
    answer: [
      "Mock exams are timed and run in an exam-style interface where you can flag questions and return to them before you submit. When you finish, you get a breakdown by content category and a full review of every item with its rationale.",
      "Scores are raw percentages on Borepix practice items. They are not ARRT scaled scores and do not predict your result on exam day.",
    ],
  },
  {
    id: "mobile",
    question: "Can I study on my phone?",
    answer: [
      "Yes. The Borepix web app works in modern mobile browsers today, with nothing to download. Native iOS and Android apps are coming soon.",
    ],
    link: { href: "/#app", label: "About the mobile app" },
  },
  {
    id: "mri-mastery",
    question: "What is MRI Mastery?",
    answer: [
      "MRI Mastery is the Borepix MRI curriculum: structured lessons on MRI physics, safety and image production, from foundations through advanced topics. Lessons pair plain-language explanations with key points and knowledge-check questions.",
      "Some lessons include interactive labs for Larmor frequency, T1 and T2 relaxation, k-space and SAR, so you can change a parameter and see what happens.",
    ],
    link: { href: "/#mri-lab", label: "See the MRI lab" },
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer: [
      "Yes. You can cancel at any time from your account settings. The Monthly plan renews every month and the Annual plan renews every 12 months until you cancel. We email a reminder before each annual renewal.",
    ],
  },
  {
    id: "refunds",
    question: "What is the refund policy?",
    answer: [
      "The Annual plan includes a 14-day money-back guarantee. Monthly fees are non-refundable once the billing date has passed.",
    ],
    link: { href: "/legal/refunds", label: "Read the full refund policy" },
  },
  {
    id: "progress",
    question: "Where is my progress saved?",
    answer: [
      "Today, in this browser on this device. Your answers, mock exam results and flashcard schedule are stored locally, so clearing browser data or switching devices starts you fresh. Syncing progress to your account across devices is planned.",
    ],
  },
];

/** schema.org FAQPage built from the same items the page renders, so the two can never drift. */
export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
    })),
  };
}

/**
 * Serialize JSON-LD for a <script> tag. JSON.stringify does not escape "<", so a stray "</script>" in copy
 * could break out of the tag; escaping it (per the Next.js JSON-LD guide) keeps the payload inert.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
