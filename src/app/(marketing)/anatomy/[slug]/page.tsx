import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Check, ChevronRight, Clock, Layers, ListChecks } from "lucide-react";
import { InteractiveDiagram } from "@/components/anatomy/interactive-diagram";
import { ModuleList } from "@/components/anatomy/module-list";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getProduct } from "@/data/products";
import { MODALITY_LABEL, QUIZ_CATEGORY_LABEL } from "@/data/types";
import { DIAGRAM_CAPTION, getWorkbook, WORKBOOK_SLUGS, workbookMinutes, workbooks } from "@/data/workbooks";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { commerceEnabled, educationalNotice, release, site } from "@/lib/site";

type Params = Promise<{ slug: string }>;
type Props = { params: Params };

// cacheComponents is on, so `dynamicParams` is unavailable: unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return WORKBOOK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workbook = getWorkbook(slug);
  if (!workbook) return {};

  const path = `/anatomy/${workbook.slug}`;
  const socialTitle = `${workbook.title} | ${site.name}`;
  return {
    title: workbook.title,
    description: workbook.summary,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title: socialTitle, description: workbook.summary, url: path },
    twitter: { card: "summary", title: socialTitle, description: workbook.summary },
  };
}

/**
 * The page shell is static; everything that depends on the slug renders inside Suspense so a client
 * navigation between workbooks shows the skeleton at once and streams the workbook in behind it.
 */
export default function WorkbookPage({ params }: Props) {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />

      <Suspense fallback={<WorkbookSkeleton />}>
        <WorkbookContent params={params} />
      </Suspense>
    </main>
  );
}

function Breadcrumb({ current }: { current?: string }) {
  return (
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
          <Link
            href="/anatomy"
            aria-current={current ? undefined : "page"}
            className={cn(
              "inline-flex min-h-9 items-center transition-colors duration-150 hover:text-fg",
              current ? undefined : "font-medium text-fg",
            )}
          >
            Anatomy
          </Link>
        </li>
        {current ? (
          <>
            <li aria-hidden>
              <ChevronRight className="size-4 text-subtle" strokeWidth={1.75} />
            </li>
            <li aria-current="page" className="font-medium text-fg">
              {current}
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

/** Neutral placeholder with the page's own rhythm. Shown only during a client navigation between workbooks. */
function WorkbookSkeleton() {
  const bar = "rounded-md bg-white/[0.06]";
  return (
    <>
      <Breadcrumb />
      <div className="container-x pt-8 pb-24 sm:pt-10 lg:pb-32" aria-busy="true">
        <p className="sr-only" role="status">
          Loading workbook
        </p>
        <div aria-hidden className="motion-safe:animate-pulse">
          <div className="max-w-3xl">
            <div className={cn(bar, "h-3 w-40")} />
            <div className={cn(bar, "mt-6 h-11 w-3/4 sm:h-14")} />
            <div className={cn(bar, "mt-6 h-4 w-full")} />
            <div className={cn(bar, "mt-3 h-4 w-5/6")} />
            <div className="mt-7 flex gap-3">
              <div className={cn(bar, "h-6 w-16 rounded-full")} />
              <div className={cn(bar, "h-6 w-16 rounded-full")} />
              <div className={cn(bar, "h-6 w-24 rounded-full")} />
            </div>
          </div>
          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-20">
            <div className="min-w-0">
              <div className={cn(bar, "h-4 w-full")} />
              <div className={cn(bar, "mt-3 h-4 w-11/12")} />
              <div className={cn(bar, "mt-3 h-4 w-4/5")} />
              <div className="hairline mt-12 aspect-4/3 w-full rounded-2xl bg-ink-2" />
              <div className="hairline mt-14 h-64 rounded-2xl bg-card" />
            </div>
            <div className="space-y-5">
              <div className="hairline h-80 rounded-2xl bg-card" />
              <div className="hairline h-44 rounded-2xl bg-card" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function WorkbookContent({ params }: { params: Params }) {
  const { slug } = await params;
  const workbook = getWorkbook(slug);
  if (!workbook) notFound();

  const product = getProduct(workbook.testKeySlug);
  const minutes = workbookMinutes(workbook);
  const others = workbooks.filter((other) => other.slug !== workbook.slug);
  const quizHref = `/quizzes/${workbook.quizCategory}`;

  return (
    <>
      <Breadcrumb current={workbook.title} />

      <div className="container-x pt-8 pb-24 sm:pt-10 lg:pb-32">
        <header className="max-w-3xl">
          <p className="eyebrow">{workbook.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl">{workbook.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{workbook.summary}</p>

          <dl className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Modality</dt>
              <dd>
                <Badge tone="outline">{MODALITY_LABEL[workbook.modality]}</Badge>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Price</dt>
              <dd>
                <Badge tone="success">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                  Free
                </Badge>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Level</dt>
              <dd className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">{workbook.level}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
              <dt className="sr-only">Modules</dt>
              <dd className="num text-fg">{workbook.modules.length} modules</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
              <dt className="sr-only">Reading time</dt>
              <dd className="num text-fg">{minutes} min</dd>
            </div>
          </dl>
        </header>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-20">
          <article className="min-w-0">
            <div className="max-w-[70ch] space-y-4 text-base leading-relaxed text-fg/85 sm:text-lg">
              {workbook.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <section aria-labelledby="diagram-heading" className="mt-12">
              <h2 id="diagram-heading" className="text-2xl font-semibold text-fg sm:text-3xl">
                Interactive diagram
              </h2>
              <p className="mt-3 text-muted">
                Tap a marker to read its note, or arrow through the landmarks from the keyboard. Each marker names a
                structure the modules and the self-quiz return to.
              </p>
              <InteractiveDiagram
                diagram={workbook.diagram}
                hotspots={workbook.hotspots}
                title={workbook.title}
                caption={DIAGRAM_CAPTION[workbook.diagram]}
                className="mt-6"
              />
            </section>

            <section aria-labelledby="modules-heading" className="mt-14">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="modules-heading" className="text-2xl font-semibold text-fg sm:text-3xl">
                  Modules
                </h2>
                <p className="num text-sm text-muted">
                  {workbook.modules.length} modules · {minutes} min
                </p>
              </div>
              <ModuleList modules={workbook.modules} className="mt-6" />
            </section>
          </article>

          {/* Sidebar: the certifying key, the self-quiz and the other workbooks. Sticky from lg up. */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section aria-labelledby="certify-heading" className="hairline rounded-2xl bg-card p-6 shadow-panel">
              <p className="eyebrow">Certify this workbook</p>
              {product ? (
                <>
                  <h2 id="certify-heading" className="mt-3 text-xl font-semibold leading-snug text-fg">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{product.tagline}</p>

                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/8 pt-5 text-sm">
                    <div>
                      <dt className="text-muted">Test key</dt>
                      <dd className={cn("num mt-1 font-semibold text-fg", commerceEnabled ? "text-2xl" : "text-base text-blush")}>
                        {commerceEnabled ? formatPrice(product.price) : `Opens ${release.launchShort}`}
                      </dd>
                    </div>
                    {product.ceCredits !== null ? (
                      <div>
                        <dt className="text-muted">CE credits</dt>
                        <dd className="num mt-1 text-2xl font-semibold text-fg">{product.ceCredits.toFixed(1)}</dd>
                      </div>
                    ) : null}
                    {product.questionCount !== null ? (
                      <div>
                        <dt className="text-muted">Items</dt>
                        <dd className="num mt-1 text-fg">{product.questionCount}</dd>
                      </div>
                    ) : null}
                    {product.passMark !== null ? (
                      <div>
                        <dt className="text-muted">Pass mark</dt>
                        <dd className="num mt-1 text-fg">{product.passMark}%</dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-4 text-xs text-muted">{product.attempts}.</p>

                  <ButtonLink href={`/store/${product.slug}`} className="mt-6 w-full">
                    View the test key
                    <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                  </ButtonLink>
                </>
              ) : (
                <>
                  <h2 id="certify-heading" className="mt-3 text-xl font-semibold leading-snug text-fg">
                    Official test key
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    The scored assessment for this workbook is sold in the store. A passing submission records CE credit.
                  </p>
                  <ButtonLink href="/store" className="mt-6 w-full">
                    Browse test keys
                    <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                  </ButtonLink>
                </>
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted">
                The workbook stays free. The key is the only paid step and it is refundable until its first submission.
              </p>
            </section>

            <section aria-labelledby="quiz-heading" className="hairline rounded-2xl bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blush">
                  <ListChecks className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h2 id="quiz-heading" className="text-lg font-semibold text-fg">
                  Take the self-quiz
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {QUIZ_CATEGORY_LABEL[workbook.quizCategory]}: free, with a rationale for every item. Find the module that
                needs another pass before you certify.
              </p>
              <ButtonLink href={quizHref} variant="secondary" className="mt-5 w-full">
                Start the self-quiz
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </ButtonLink>
            </section>

            <nav aria-labelledby="other-workbooks-heading" className="hairline rounded-2xl bg-card p-6">
              <h2 id="other-workbooks-heading" className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Other workbooks
              </h2>
              <ul role="list" className="mt-3 divide-y divide-white/8">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/anatomy/${other.slug}`}
                      prefetch
                      className="group flex min-h-12 items-center justify-between gap-3 py-2 text-sm font-medium text-fg transition-colors duration-150 hover:text-blush"
                    >
                      <span>{other.title}</span>
                      <ArrowRight
                        className="size-4 shrink-0 text-blush transition-transform duration-150 group-hover:translate-x-0.5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>

        <p className="mt-16 max-w-3xl border-t border-white/8 pt-6 text-sm leading-relaxed text-muted">{educationalNotice}</p>
      </div>
    </>
  );
}
