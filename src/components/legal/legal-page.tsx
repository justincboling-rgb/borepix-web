import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { legalDocs } from "@/lib/content/legal";
import { legalHref, site, type LegalSlug } from "@/lib/site";

/** Metadata for a legal document at its canonical path. Used by the root legal routes. */
export function legalMetadata(slug: LegalSlug): Metadata {
  const doc = legalDocs[slug];
  const path = legalHref(slug);
  const socialTitle = `${doc.title} | ${site.name}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, title: socialTitle, description: doc.description, url: path },
    twitter: { card: "summary", title: socialTitle, description: doc.description },
  };
}

/** Full page for a legal document: the same shell and renderer every policy uses. */
export function LegalPage({ slug }: { slug: LegalSlug }) {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]" />
      <LegalDocument doc={legalDocs[slug]} />
    </main>
  );
}
