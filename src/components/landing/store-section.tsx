import { ArrowRight, CalendarClock, Tag } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { nrtw } from "@/data/nrtw";
import { featuredProducts } from "@/data/products";
import { commerceEnabled, release } from "@/lib/site";

const LEDE_LIVE =
  "Workbooks and self-quizzes are free. The official test key is the only paid step. Buy it in one click and it is delivered to your account the moment the order clears, Amazon-style.";

const LEDE_PREVIEW = `Workbooks and self-quizzes are free. The official test key is the one step that certifies them, and it opens with the public launch in ${release.launch}. The catalogue is open to browse today.`;

/**
 * Landing storefront: the three featured keys as full product cards, a one-line strip and the link to the
 * whole catalogue. While commerce is live the strip carries the NRTW promo; during the Alpha/Beta preview
 * it states that the catalogue is open and keys issue at launch. Server component; the cards' controls are
 * the only client leaves.
 */
export function StoreSection() {
  return (
    <section id="store" aria-labelledby="store-heading" className="relative isolate bg-ink py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            id="store-heading"
            eyebrow="Test key marketplace"
            title="One key per curriculum."
            lede={commerceEnabled ? LEDE_LIVE : LEDE_PREVIEW}
          />
        </Reveal>

        <RevealGroup className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <RevealItem key={product.id} className="h-full min-w-0">
              <ProductCard product={product} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="hairline mt-8 flex flex-col gap-5 rounded-2xl bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="flex items-start gap-3 text-sm leading-relaxed text-muted sm:items-center">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-pink/30 bg-pink/10 text-blush">
              {commerceEnabled ? (
                <Tag className="size-4" strokeWidth={1.75} aria-hidden />
              ) : (
                <CalendarClock className="size-4" strokeWidth={1.75} aria-hidden />
              )}
            </span>
            {commerceEnabled ? (
              <span>
                <span className="font-mono font-semibold tracking-[0.08em] text-fg">{nrtw.code}</span> takes {nrtw.percent}% off
                every test key and suite for {nrtw.name}, {nrtw.dates}. Apply it in the cart.
              </span>
            ) : (
              <span>
                <span className="font-medium text-fg">Catalogue open now · keys issue at launch.</span> Compare every key
                today; purchases open with the public launch in {release.launch}.
              </span>
            )}
          </p>
          <ButtonLink href="/store" variant="secondary" className="shrink-0">
            {commerceEnabled ? "Browse the full store" : "Browse the catalogue"}
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
