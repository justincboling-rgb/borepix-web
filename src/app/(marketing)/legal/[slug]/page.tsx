import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { LegalDocument } from "@/components/legal/legal-document";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { getLegalDoc } from "@/lib/content/legal";
import { legalHref, legalPages, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

/** Documents whose canonical home is under /legal. The rest live at root routes and redirect there. */
const UNDER_LEGAL = legalPages.filter((page) => page.href.startsWith("/legal/"));

// cacheComponents is on, so `dynamicParams` is unavailable: unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return UNDER_LEGAL.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return {};

  const path = legalHref(doc.slug);
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
export default function LegalSlugPage({ params }: Props) {
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
  // Documents that moved to a root route keep working at their old address.
  const canonical = legalHref(doc.slug);
  if (!canonical.startsWith("/legal/")) permanentRedirect(canonical);
  return <LegalDocument doc={doc} />;
}
