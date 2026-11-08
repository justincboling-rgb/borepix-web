import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Faq } from "@/components/landing/faq";
import { site } from "@/lib/site";

const title = "FAQ";
const description =
  "Answers about Borepix: what is free, how CE test keys and submissions work, how credit is recorded, the NRTW2026 promo, refunds, where keys live, the mobile app and the Kearny supply drive.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: { type: "website", siteName: site.name, title: `${title} | ${site.name}`, description, url: "/faq" },
  twitter: { card: "summary", title: `${title} | ${site.name}`, description },
};

const related = [
  { href: "/legal/refunds", title: "Refund Policy", description: "Keys are refundable until their first submission." },
  { href: "/legal/terms", title: "Terms of Service", description: "What you agree to when you buy a key or a pass." },
  { href: "/store", title: "Store", description: "Test keys, the Complete Suite, the CE Library pass and the app." },
  { href: "/about", title: "About Borepix", description: "Built in Kearny by technologists working across MR, IR and CT." },
] as const;

export default function FaqPage() {
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
            FAQ
          </li>
        </ol>
      </nav>

      {/* The section heading inside is the page h1. The component also prints the FAQPage JSON-LD once. */}
      <Faq headingLevel="h1" />

      <section aria-labelledby="faq-related-heading" className="container-x pb-24 sm:pb-32">
        <div className="border-t border-white/8 pt-12">
          <h2 id="faq-related-heading" className="text-xl font-semibold text-fg sm:text-2xl">
            Related
          </h2>
          <ul role="list" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  className="group panel flex h-full flex-col rounded-2xl p-5 transition-[border-color,transform] duration-250 ease-out-expo hover:border-white/20 motion-safe:hover:-translate-y-0.5"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-display text-base font-semibold text-fg">{item.title}</span>
                    <ArrowRight
                      className="mt-0.5 size-4 shrink-0 text-blush transition-transform duration-150 group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted">{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
