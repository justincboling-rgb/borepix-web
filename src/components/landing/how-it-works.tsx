import { ArrowRight, Check, ScanLine, Target, Timer, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: ScanLine,
    title: "Diagnose",
    body: "Start with a baseline mock exam. Borepix scores it by ARRT® content category, so you begin with evidence instead of a guess.",
    points: ["Timed baseline mock exam", "A score for each content category"],
  },
  {
    n: "02",
    icon: Target,
    title: "Train",
    body: "Targeted practice goes to your weakest content category first. Spaced-repetition review keeps earlier material from slipping while you work.",
    points: ["Practice filtered to your weak spots", "Flashcards on a spaced-repetition schedule"],
  },
  {
    n: "03",
    icon: Timer,
    title: "Simulate",
    body: "Sit full timed mock exams in an exam-style interface. Then review every rationale, including the questions you got right.",
    points: ["One question per screen, flag for review", "A rationale for every item"],
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />
      <div className="container-x relative">
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          className="reveal"
          title={
            <>
              Diagnose. Train. <span className="text-gradient">Simulate.</span>
            </>
          }
          lede="Find the gaps, close them, then prove it under exam conditions. Repeat the loop until your weakest category stops being weak."
        />

        <ol className="mt-14 sm:mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const last = i === STEPS.length - 1;
            return (
              <li
                key={step.n}
                className={cn(
                  "reveal relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 lg:block",
                  !last && "pb-12 lg:pb-0",
                )}
              >
                {/* Connector: vertical on small screens, horizontal from lg. */}
                {!last ? (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-6 top-14 bottom-2 w-px bg-linear-to-b from-pink/60 to-white/10",
                      "lg:left-16 lg:-right-4 lg:top-6 lg:bottom-auto lg:h-px lg:w-auto lg:bg-linear-to-r",
                    )}
                  />
                ) : null}

                <span className="num relative flex size-12 items-center justify-center rounded-full border border-pink/45 bg-ink text-sm font-semibold text-blush ring-4 ring-ink">
                  <span className="sr-only">Step </span>
                  {step.n}
                </span>

                <div className="pt-2.5 lg:mt-8 lg:pt-0">
                  <h3 className="flex items-center gap-2.5 text-2xl font-semibold text-fg">
                    <Icon aria-hidden strokeWidth={1.75} className="size-5 text-silver" />
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-prose leading-relaxed text-muted">{step.body}</p>
                  <ul role="list" className="mt-5 grid gap-2.5">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-fg">
                        <Check aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blush" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="reveal mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <ButtonLink href="/signup" size="lg">
            Start with a baseline exam
            <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
          </ButtonLink>
          <p className="text-sm text-muted">Your results set the plan from there.</p>
        </div>
      </div>
    </section>
  );
}
