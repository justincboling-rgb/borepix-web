"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { MODALITY_SHORT, type Quiz, type QuizCategory, type QuizQuestion } from "@/data/types";
import { cn } from "@/lib/cn";

export type QuizPreview = { quiz: Quiz; questions: QuizQuestion[] };

/** Short tab labels; the modality code sits above each one and the full title is on the quiz card. */
const TAB_LABEL: Record<QuizCategory, string> = {
  "mri-anatomy": "Cross-sectional anatomy",
  "ir-vascular": "Vascular pathways",
  "ct-protocols": "Advanced protocols",
};

type Props = {
  /** One entry per category, in display order. The server section builds these with previewQuestionsFor(). */
  previews: QuizPreview[];
  className?: string;
};

/**
 * Tab bar for the three quiz categories above a compact QuizRunner. A WAI-ARIA tablist: arrow keys,
 * Home and End move between tabs and activate them; the runner is keyed by category, so switching
 * tabs starts that preview from its first item.
 */
export function QuizPreviewTabs({ previews, className }: Props) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState<QuizCategory | null>(previews[0]?.quiz.slug ?? null);

  const tabId = (slug: QuizCategory) => `${uid}-tab-${slug}`;
  const panelId = `${uid}-panel`;
  const current = previews.find((p) => p.quiz.slug === active) ?? previews[0];

  if (!current) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const n = previews.length;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
        next = (index + 1) % n;
        break;
      case "ArrowLeft":
        next = (index - 1 + n) % n;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = n - 1;
        break;
    }
    if (next === null) return;
    e.preventDefault();
    const target = previews[next];
    if (!target) return;
    setActive(target.quiz.slug);
    document.getElementById(tabId(target.quiz.slug))?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Choose a self-quiz to preview"
        className="hairline isolate grid grid-cols-3 gap-1 rounded-xl bg-card p-1"
      >
        {previews.map(({ quiz }, i) => {
          const selected = quiz.slug === current.quiz.slug;
          return (
            <button
              key={quiz.slug}
              type="button"
              role="tab"
              id={tabId(quiz.slug)}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(quiz.slug)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors duration-150 sm:px-4 sm:text-sm",
                selected ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={reduce ? undefined : `${uid}-tab-pill`}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-lg border border-white/10 bg-white/[0.07]"
                  transition={{ type: "spring", stiffness: 520, damping: 44 }}
                />
              ) : null}
              <span className={cn("font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em]", selected ? "text-blush" : "text-muted")}>
                {MODALITY_SHORT[quiz.modality]}
              </span>
              <span className="text-balance leading-snug">{TAB_LABEL[quiz.slug]}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={panelId} aria-labelledby={tabId(current.quiz.slug)} className="mt-6">
        <QuizRunner key={current.quiz.slug} quiz={current.quiz} questions={current.questions} compact headingLevel="h3" />
      </div>
    </div>
  );
}
