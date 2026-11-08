import { ArrowRight, Check } from "lucide-react";
import { QuizPreviewTabs, type QuizPreview } from "@/components/quiz/quiz-preview-tabs";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { previewQuestionsFor, quizzes } from "@/data/quizzes";

/** Items shown per category on the landing page. The full quiz starts with the same items, in the same order. */
const PREVIEW_SIZE = 3;

/** Three true things about the engine, printed beside it. */
const FACTS = [
  "Free. No account, and nothing is saved.",
  "Checked item by item, with a rationale for every answer.",
  "Scored by topic at the end, so the weak spot has a name.",
] as const;

/**
 * Landing-page self-quiz band. Heading and facts on the left, the live preview on the right; on narrow
 * screens the preview follows the heading and the CTA row closes the section. Server component: the
 * preview questions are sliced here and handed to the client tabs, so the question bank stays out of
 * the client bundle.
 */
export function QuizSection() {
  const previews: QuizPreview[] = quizzes.map((quiz) => ({
    quiz,
    questions: previewQuestionsFor(quiz.slug, PREVIEW_SIZE),
  }));

  return (
    <section id="quizzes" aria-labelledby="quizzes-heading" className="relative isolate border-t border-white/8 bg-ink-2 py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
        <div className="lg:col-start-1 lg:row-start-1">
          <SectionHeading
            id="quizzes-heading"
            eyebrow="Self quizzes"
            title="Prove it before you pay for it."
            lede="Every self-quiz is free, scored on the spot and explained item by item. The official CE test key is the only paid step."
          />
          <ul aria-label="How the self-quizzes work" className="mt-8 grid gap-3">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-start gap-3 text-base leading-relaxed text-muted">
                <Check className="mt-1.5 size-4 shrink-0 text-blush" strokeWidth={2} aria-hidden />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <Reveal className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <QuizPreviewTabs previews={previews} />
        </Reveal>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:col-start-1 lg:row-start-2 lg:self-end">
          <ButtonLink href="/quizzes" variant="secondary" size="lg">
            Open the full self-quiz
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
          <ButtonLink href="/anatomy" variant="ghost" size="lg">
            Browse workbooks
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
