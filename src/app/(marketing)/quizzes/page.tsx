import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Info } from "lucide-react";
import { QuizPicker } from "@/components/quiz/quiz-picker";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getProduct } from "@/data/products";
import { quizzes } from "@/data/quizzes";
import { educationalNotice, site } from "@/lib/site";

const title = "Self Quizzes";
const description =
  "Three free self-quizzes for Radiologic Technologists: MRI cross-sectional anatomy, vascular IR pathways and advanced CT protocols. Scored on the spot with a rationale for every item. The official CE test key is the only paid step.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/quizzes" },
  openGraph: { type: "website", siteName: site.name, title: `${title} | ${site.name}`, description, url: "/quizzes" },
  twitter: { card: "summary", title: `${title} | ${site.name}`, description },
};

/** The pass mark the three certifying keys share, or null when they differ. */
function sharedPassMark(): number | null {
  const marks = new Set(quizzes.map((quiz) => getProduct(quiz.testKeySlug)?.passMark ?? null));
  if (marks.size !== 1) return null;
  const [mark] = marks;
  return mark ?? null;
}

export default function QuizzesPage() {
  const passMark = sharedPassMark();

  const steps = [
    {
      title: "One best answer per item",
      body: "Choose, then check. The rationale appears at once, with a note on each distractor where the item carries them.",
    },
    {
      title: "Move freely",
      body: "Go back to any checked item; your answer is still there. The order is fixed, so question seven is always question seven.",
    },
    {
      title: "Scored by topic",
      body: "The score is correct items over total, as a percent, broken down by topic so the next hour of review has a target.",
    },
    {
      title: "Nothing is recorded",
      body: `Self-quiz scores stay in the browser tab and earn no credit. CE credit is recorded only on a passing test-key submission${
        passMark !== null ? `, scored against a ${passMark}% pass mark` : ""
      }.`,
    },
  ] as const;

  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      <nav aria-label="Breadcrumb" className="container-x pt-10 sm:pt-14">
        <ol className="flex items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/" className="inline-flex min-h-9 items-center transition-colors duration-150 hover:text-fg">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4 text-subtle" strokeWidth={1.75} />
          </li>
          <li aria-current="page" className="font-medium text-fg">
            Self Quizzes
          </li>
        </ol>
      </nav>

      <header className="container-x pt-10 sm:pt-14">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Self quizzes</p>
          <h1 className="mt-5 text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl">Three quizzes. Free, scored, explained.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            One quiz per workbook, written at the level a lead technologist reasons at. Take them as often as you like.
            The official CE test key is the only paid step.
          </p>
        </Reveal>
      </header>

      <section aria-label="Choose a self-quiz" className="container-x pt-14 sm:pt-16">
        <QuizPicker headingLevel="h2" />
      </section>

      <section aria-labelledby="quiz-scoring-heading" className="container-x pb-24 pt-20 sm:pb-32 sm:pt-24">
        <div className="grid gap-10 border-t border-white/8 pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Scoring</p>
            <h2 id="quiz-scoring-heading" className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
              How scoring works.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              The same engine runs every quiz on the site. Here is exactly what it counts.
            </p>
            <div className="mt-8">
              <ButtonLink href="/anatomy" variant="secondary">
                Browse the free workbooks
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </ButtonLink>
            </div>
          </div>

          <div>
            <ol className="hairline divide-y divide-line rounded-2xl bg-card">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 p-5 sm:gap-6 sm:p-6">
                  <span aria-hidden className="num mt-0.5 shrink-0 text-sm font-medium text-blush">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex gap-3.5 rounded-2xl border border-pink/30 bg-pink/[0.06] p-5 sm:p-6">
              <Info className="mt-0.5 size-5 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-blush">Study aid</p>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{educationalNotice}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
