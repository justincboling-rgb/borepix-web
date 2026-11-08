import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, KeyRound, ListChecks, type LucideIcon } from "lucide-react";
import { WorkbookCard } from "@/components/anatomy/workbook-card";
import { ButtonLink } from "@/components/ui/button";
import { workbooks } from "@/data/workbooks";
import { educationalNotice, site } from "@/lib/site";

const title = "Anatomy Workbooks";
const description =
  "Three free clinical workbooks for Radiologic Technologists: MRI cross-sectional anatomy, vascular IR pathways and advanced CT protocols, each with learning objectives, review-guide key points and an interactive diagram. Certify with the official test key.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/anatomy" },
  openGraph: { type: "website", siteName: site.name, title: `${title} | ${site.name}`, description, url: "/anatomy" },
  twitter: { card: "summary", title: `${title} | ${site.name}`, description },
};

type Step = {
  icon: LucideIcon;
  title: string;
  body: string;
  link: { label: string; href: string };
};

const STEPS: Step[] = [
  {
    icon: BookOpen,
    title: "Study free",
    body: "Read every module, work the interactive diagram and keep the review guide open on the scanner desk. No account, no charge, no time limit.",
    link: { label: "The three workbooks", href: "#workbooks" },
  },
  {
    icon: ListChecks,
    title: "Self-quiz",
    body: "Each workbook has a free self-quiz written from its modules, with a rationale for every item. Use it to find the module that needs another pass.",
    link: { label: "Open the self-quizzes", href: "/quizzes" },
  },
  {
    icon: KeyRound,
    title: "Submit the official test key",
    body: "When you are ready, the test key in the store unlocks the scored assessment. A passing submission records CE credit and issues your certificate of completion.",
    link: { label: "Browse test keys", href: "/store" },
  },
];

export default function AnatomyPage() {
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
            Anatomy
          </li>
        </ol>
      </nav>

      <header className="container-x pt-8 sm:pt-10">
        <div className="max-w-3xl">
          <p className="eyebrow">Anatomy workbooks</p>
          <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl">
            Three workbooks. Free to read, cover to cover.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            MRI cross-sectional anatomy, vascular IR pathways and advanced CT protocols, each written like the clinical
            workbook you would hand a technologist on their first week in the suite. Objectives and key points for every
            module, an interactive diagram for every workbook, and the official test key when you want the credit.
          </p>
        </div>
      </header>

      <section id="workbooks" aria-labelledby="workbooks-heading" className="container-x pt-14 sm:pt-16">
        <h2 id="workbooks-heading" className="sr-only">
          The workbooks
        </h2>
        <ul role="list" className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          {workbooks.map((workbook) => (
            <li key={workbook.slug} className="flex">
              <WorkbookCard workbook={workbook} headingLevel="h3" className="w-full" />
            </li>
          ))}
        </ul>
      </section>

      <section id="how-it-works" aria-labelledby="how-heading" className="container-x scroll-mt-24 pt-24 pb-24 sm:pt-32 sm:pb-32">
        <div className="border-t border-white/8 pt-12 sm:pt-16">
          <div className="max-w-3xl">
            <p className="eyebrow">How certification works</p>
            <h2 id="how-heading" className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">
              Study free. Quiz yourself. Certify when you are ready.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              The source materials and review guides stay free. Money changes hands once, for the official test key
              submission that records your CE credit.
            </p>
          </div>

          <ol role="list" className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-3">
            {STEPS.map(({ icon: Icon, title: stepTitle, body, link }, i) => (
              <li key={stepTitle} className="flex">
                <div className="hairline relative flex w-full flex-col rounded-2xl bg-card p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blush">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="num text-sm font-medium text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-fg sm:text-2xl">{stepTitle}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{body}</p>
                  <Link
                    href={link.href}
                    className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-6 font-medium text-blush"
                  >
                    {link.label}
                    <ArrowRight
                      className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/store" size="lg">
              Access CE Library & Store
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </ButtonLink>
            <ButtonLink href="/quizzes" variant="secondary" size="lg">
              Take a self-quiz
            </ButtonLink>
          </div>

          <p className="mt-12 max-w-3xl border-t border-white/8 pt-6 text-sm leading-relaxed text-muted">{educationalNotice}</p>
        </div>
      </section>
    </main>
  );
}
