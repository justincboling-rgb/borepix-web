import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { TryQuestionWidget } from "@/components/landing/interactive/try-question-widget";
import { getFeaturedQuestions } from "@/lib/content/questions";

/** Landing "Try a question" section. Server-rendered shell; the quiz itself is a client leaf. */
export function TryQuestion() {
  const questions = getFeaturedQuestions();

  return (
    <section id="try" aria-labelledby="try-title" className="relative isolate py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-pink/[0.07] blur-3xl" />
      </div>

      <div className="container-x">
        <SectionHeading
          id="try-title"
          align="center"
          eyebrow="Try it now"
          title="Try a registry-style question."
          lede="Borepix writes original practice questions in the style of the ARRT® Radiography and MRI exams. Pick an answer, check it, and read the rationale."
        />

        {questions.length > 0 ? (
          <TryQuestionWidget questions={questions} />
        ) : (
          <div className="panel mx-auto mt-12 max-w-3xl rounded-2xl px-5 py-10 text-center sm:px-10">
            <p className="text-muted">Sample questions are on the way.</p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/signup" size="lg">
                Start studying
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        )}

        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted">
          Original Borepix questions, not actual exam items. Answers on this page are not saved.
        </p>
      </div>
    </section>
  );
}
