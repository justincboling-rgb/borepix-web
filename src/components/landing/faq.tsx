import Link from "next/link";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildFaqJsonLd, faqs, serializeJsonLd, type FaqItem } from "@/data/faq";
import { site } from "@/lib/site";

type Props = {
  /** Defaults to the full site FAQ. */
  items?: FaqItem[];
  /** "h1" when the section is the page itself (/faq); "h2" on the landing page. */
  headingLevel?: "h1" | "h2";
};

/**
 * FAQ built on native <details>/<summary>: keyboard and screen-reader support come from the browser and it
 * works before (or without) JavaScript. The FAQPage JSON-LD is generated from the same array, so render this
 * component once per page.
 */
export function Faq({ items = faqs, headingLevel = "h2" }: Props) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative py-24 sm:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(items)) }} />

      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-heading"
            as={headingLevel}
            eyebrow="FAQ"
            title="Straight answers."
            lede="How CE credit is recorded, where your keys live, how billing and refunds work, and what the Kearny supply drive does."
          />
          <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <Mail className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
            Something else?
            <a
              href={`mailto:${site.supportEmail}`}
              className="inline-flex min-h-11 items-center font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
            >
              {site.supportEmail}
            </a>
          </p>
        </div>

        <div className="reveal border-t border-white/8">
          {items.map((item, i) => (
            <details key={item.id} id={`faq-${item.id}`} open={i === 0} className="group border-b border-white/8">
              <summary className="flex min-h-16 list-none items-center justify-between gap-6 rounded-lg py-5 text-left text-base font-medium text-fg transition-colors duration-150 hover:text-blush sm:text-lg [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-silver transition-colors duration-150 group-open:border-pink/40 group-open:text-blush"
                >
                  <ChevronDown
                    className="size-4 transition-transform duration-250 ease-out-expo group-open:rotate-180"
                    strokeWidth={1.75}
                  />
                </span>
              </summary>

              <div className="max-w-[65ch] space-y-3 pr-4 pb-6 leading-relaxed text-muted sm:pr-14">
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {item.link ? (
                  <p>
                    <Link
                      href={item.link.href}
                      className="inline-flex min-h-11 items-center gap-1.5 font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush"
                    >
                      {item.link.label}
                      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
