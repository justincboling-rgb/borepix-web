import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BookOpen, ChevronRight, KeyRound, type LucideIcon } from "lucide-react";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Reveal } from "@/components/ui/reveal";
import { getProduct } from "@/data/products";
import { getQuiz, questionsFor, quizzes } from "@/data/quizzes";
import { MODALITY_SHORT, QUIZ_CATEGORIES, type Quiz } from "@/data/types";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// cacheComponents is on, so `dynamicParams` is unavailable: unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return QUIZ_CATEGORIES.map((slug) => ({ slug }));
}

function describe(quiz: Quiz, count: number): string {
  const product = getProduct(quiz.testKeySlug);
  const paid = product ? ` The ${product.name} is the only paid step.` : "";
  return `${quiz.description} ${count} free items, scored on the spot with a rationale for every answer.${paid}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) return {};

  const path = `/quizzes/${quiz.slug}`;
  const title = `${quiz.title} Self-Quiz`;
  const description = describe(quiz, questionsFor(quiz.slug).length);
  const socialTitle = `${title} | ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title: socialTitle, description, url: path },
    twitter: { card: "summary", title: socialTitle, description },
  };
}

/**
 * The page is a static shell; everything that depends on the slug renders inside <Suspense>, so the
 * route stays instant under cacheComponents (see the instant-navigation guide).
 */
export default function QuizPage({ params }: Props) {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      <Suspense fallback={<PageSkeleton className="pb-24" />}>
        <QuizBody params={params} />
      </Suspense>
    </main>
  );
}

async function QuizBody({ params }: Props) {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) notFound();

  const questions = questionsFor(quiz.slug);
  const product = getProduct(quiz.testKeySlug);

  return (
    <>
      <nav aria-label="Breadcrumb" className="container-x pt-10 sm:pt-14">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/" className="inline-flex min-h-9 items-center transition-colors duration-150 hover:text-fg">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4 text-subtle" strokeWidth={1.75} />
          </li>
          <li>
            <Link href="/quizzes" className="inline-flex min-h-9 items-center transition-colors duration-150 hover:text-fg">
              Self Quizzes
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4 text-subtle" strokeWidth={1.75} />
          </li>
          <li aria-current="page" className="font-medium text-fg">
            {quiz.title}
          </li>
        </ol>
      </nav>

      <header className="container-x pt-10 sm:pt-14">
        <Reveal className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge tone="outline">{MODALITY_SHORT[quiz.modality]}</Badge>
            <p className="num font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Self quiz · {questions.length} items · {quiz.minutes} min
            </p>
          </div>
          <h1 className="mt-5 text-4xl font-semibold text-fg sm:text-5xl">{quiz.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{quiz.description}</p>
        </Reveal>
      </header>

      <div className="container-x grid gap-10 pb-24 pt-12 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:pb-32 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <QuizRunner quiz={quiz} questions={questions} headingLevel="h2" />
        </div>

        <aside aria-labelledby="quiz-aside-heading" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="quiz-aside-heading" className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Alongside this quiz
          </h2>
          <ul role="list" className="mt-4 grid gap-4">
            <li>
              <AsideCard
                href={`/anatomy/${quiz.workbookSlug}`}
                icon={BookOpen}
                eyebrow="Free workbook"
                title={quiz.title}
                body="Modules, key points and the interactive diagram this quiz is drawn from. Read it before, or go back to it after."
                cta="Open the workbook"
              />
            </li>
            {product ? (
              <li>
                <AsideCard
                  href={`/store/${product.slug}`}
                  icon={KeyRound}
                  eyebrow="Official test key"
                  title={product.name}
                  body={product.tagline}
                  cta={commerceEnabled ? `Get the key · ${formatPrice(product.price)}` : "See the test key"}
                  facts={[
                    product.questionCount !== null ? `${product.questionCount} items` : null,
                    product.passMark !== null ? `${product.passMark}% pass mark` : null,
                    product.ceCredits !== null ? `${product.ceCredits.toFixed(1)} CE credits` : null,
                    product.attempts,
                  ].filter((fact): fact is string => fact !== null)}
                />
              </li>
            ) : null}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Nothing from this quiz is saved. Scores on the test key are recorded to your account.
          </p>
        </aside>
      </div>

      <OtherQuizzes current={quiz.slug} />
    </>
  );
}

type AsideCardProps = {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  facts?: string[];
};

function AsideCard({ href, icon: Icon, eyebrow, title, body, cta, facts }: AsideCardProps) {
  return (
    <article className="card-lift hairline relative flex flex-col rounded-2xl bg-card p-5 focus-within:border-pink/60">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blush">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</span>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug text-fg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      {facts && facts.length > 0 ? (
        <ul aria-label="Details" className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {facts.map((fact) => (
            <li key={fact} className="num text-xs text-muted">
              {fact}
            </li>
          ))}
        </ul>
      ) : null}
      {/* The link stretches over the card so the whole panel is the target; the text stays the accessible name. */}
      <Link
        href={href}
        className="group mt-4 inline-flex min-h-11 items-center gap-1.5 font-medium text-blush after:absolute after:inset-0 after:rounded-2xl after:content-['']"
      >
        {cta}
        <ArrowRight className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
      </Link>
    </article>
  );
}

function OtherQuizzes({ current }: { current: Quiz["slug"] }) {
  const others = quizzes.filter((quiz) => quiz.slug !== current);

  return (
    <nav aria-labelledby="other-quizzes-heading" className="container-x pb-24 sm:pb-32">
      <div className="border-t border-white/8 pt-12">
        <h2 id="other-quizzes-heading" className="text-xl font-semibold text-fg sm:text-2xl">
          The other self-quizzes
        </h2>
        <ul role="list" className="mt-6 grid gap-4 sm:grid-cols-2">
          {others.map((quiz) => (
            <li key={quiz.slug} className="min-w-0">
              <Link
                href={`/quizzes/${quiz.slug}`}
                className="group panel flex h-full flex-col rounded-2xl p-5 transition-[border-color,transform] duration-250 ease-out-expo hover:border-white/20 motion-safe:hover:-translate-y-0.5"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Badge tone="outline">{MODALITY_SHORT[quiz.modality]}</Badge>
                    <span className="font-display text-base font-semibold text-fg">{quiz.title}</span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-blush transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{quiz.description}</span>
                <span className="num mt-3 text-xs text-muted">
                  {questionsFor(quiz.slug).length} items · {quiz.minutes} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
