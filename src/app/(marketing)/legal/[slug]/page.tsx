import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { ArrowRight, Info, Mail } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import {
  getLegalDoc,
  legalDocList,
  LEGAL_LAST_UPDATED,
  LEGAL_LAST_UPDATED_ISO,
  type LegalBlock,
  type LegalDoc,
} from "@/lib/content/legal";
import { legalPages, site, type LegalSlug } from "@/lib/site";
import { LegalText } from "../_components/legal-text";
import { LegalToc, type TocItem } from "../_components/legal-toc";

type Props = { params: Promise<{ slug: string }> };

const CONTACT_ID = "contact";

const pad = (n: number) => String(n).padStart(2, "0");

const bodyText = "text-base leading-7 text-fg/80 sm:text-[1.0625rem] sm:leading-8";

const sectionClass = "mt-12 border-t border-white/8 pt-10 sm:mt-14 sm:pt-12";

// cacheComponents is on, so `dynamicParams` is unavailable: unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return {};

  const path = `/legal/${doc.slug}`;
  const socialTitle = `${doc.title} | ${site.name}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title: socialTitle, description: doc.description, url: path },
    twitter: { card: "summary", title: socialTitle, description: doc.description },
  };
}

/**
 * The page is a static shell; everything that depends on the slug renders inside <Suspense>, so the
 * route stays instant under cacheComponents (see the instant-navigation guide).
 */
export default function LegalPage({ params }: Props) {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]" />

      <Suspense fallback={<PageSkeleton className="pb-24 pt-14 sm:pt-20" />}>
        <LegalBody params={params} />
      </Suspense>
    </main>
  );
}

async function LegalBody({ params }: Props) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  const toc: TocItem[] = [
    ...doc.sections.map((section) => ({ id: section.id, label: section.heading })),
    { id: CONTACT_ID, label: "Contact" },
  ];

  return (
    <>
      <div className="container-x pb-24 pt-14 sm:pt-20 lg:pb-32">
        <div className="mx-auto max-w-[68rem]">
          <header className="max-w-[70ch]">
            <p className="eyebrow">Legal</p>
            <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl">{doc.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">{doc.description}</p>
            <p className="num mt-6 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs text-muted">
              Last updated: <time dateTime={LEGAL_LAST_UPDATED_ISO}>{LEGAL_LAST_UPDATED}</time>
            </p>
          </header>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-20">
            {/* Table of contents: first in reading order, right-hand column from lg up. */}
            <div className="lg:col-start-2 lg:row-start-1">
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:py-1 lg:pl-1 lg:pr-3">
                <LegalToc items={toc} />
              </div>
            </div>

            <article className="min-w-0 max-w-[70ch] lg:col-start-1 lg:row-start-1">
              <InShort doc={doc} />

              {doc.sections.map((section, i) => (
                <section key={section.id} id={section.id} className={sectionClass}>
                  <SectionTitle index={i + 1}>{section.heading}</SectionTitle>
                  {section.blocks.map((block, j) => (
                    <Block key={j} block={block} current={doc.slug} />
                  ))}
                </section>
              ))}

              <section id={CONTACT_ID} className={sectionClass}>
                <SectionTitle index={toc.length}>Contact</SectionTitle>
                <p className={`mt-4 ${bodyText}`}>Questions about the {doc.title}? Email us and mention this page.</p>
                <a
                  href={`mailto:${site.supportEmail}`}
                  className={buttonClasses({ variant: "secondary", className: "mt-6 max-w-full" })}
                >
                  <Mail className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="truncate">{site.supportEmail}</span>
                </a>
              </section>
            </article>
          </div>

          <OtherDocs current={doc.slug} />
        </div>
      </div>
    </>
  );
}

function SectionTitle({ index, children }: { index: number; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-4 text-2xl font-semibold text-fg sm:text-[1.75rem]">
      <span aria-hidden className="num shrink-0 text-sm font-medium text-blush">
        {pad(index)}
      </span>
      <span>{children}</span>
    </h2>
  );
}

function InShort({ doc }: { doc: LegalDoc }) {
  return (
    <div className="panel rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-fg sm:text-xl">In short</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-[0.975rem] leading-7 text-fg/90 marker:text-pink">
        {doc.summary.map((point, i) => (
          <li key={i} className="pl-1.5">
            <LegalText text={point} current={doc.slug} />
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
        This summary is for convenience. The full text below is what applies.
      </p>
    </div>
  );
}

function Block({ block, current }: { block: LegalBlock; current: LegalSlug }) {
  switch (block.kind) {
    case "p":
      return (
        <p className={`mt-4 ${bodyText}`}>
          <LegalText text={block.text} current={current} />
        </p>
      );
    case "list":
      return (
        <ul className={`mt-4 list-disc space-y-2.5 pl-5 marker:text-pink ${bodyText}`}>
          {block.items.map((item, i) => (
            <li key={i} className="pl-1.5">
              <LegalText text={item} current={current} />
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <div className="mt-6 flex gap-3.5 rounded-2xl border border-pink/30 bg-pink/[0.06] p-5 sm:p-6">
          <Info className="mt-0.5 size-5 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-blush">Important</p>
            <p className="mt-2 text-base leading-7 text-fg sm:text-[1.0625rem] sm:leading-8">
              <LegalText text={block.text} current={current} />
            </p>
          </div>
        </div>
      );
  }
}

function OtherDocs({ current }: { current: LegalSlug }) {
  const others = legalDocList.filter((doc) => doc.slug !== current);

  return (
    <nav aria-labelledby="other-legal-docs" className="mt-20 border-t border-white/8 pt-12 sm:mt-24">
      <h2 id="other-legal-docs" className="text-xl font-semibold text-fg sm:text-2xl">
        Other legal documents
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((doc) => (
          <li key={doc.slug} className="min-w-0">
            <Link
              href={`/legal/${doc.slug}`}
              className="group panel flex h-full flex-col rounded-2xl p-5 transition-[border-color,transform] duration-250 ease-out-expo hover:border-white/20 motion-safe:hover:-translate-y-0.5"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-display text-base font-semibold text-fg">{doc.title}</span>
                <ArrowRight
                  className="mt-0.5 size-4 shrink-0 text-blush transition-transform duration-150 group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
              <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{doc.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
