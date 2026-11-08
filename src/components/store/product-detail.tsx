import Link from "next/link";
import { ArrowRight, BookOpen, Check, ChevronRight, Tag } from "lucide-react";
import { LaunchBadge, LaunchNotify } from "@/components/commerce/launch-notice";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Price } from "@/components/store/price";
import { ProductArt } from "@/components/store/product-art";
import { MODALITY_CHIP, ProductCard } from "@/components/store/product-card";
import { StockBadge } from "@/components/store/stock-badge";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { nrtw } from "@/data/nrtw";
import { products } from "@/data/products";
import { PRODUCT_BADGE_LABEL, PRODUCT_CATEGORY_LABEL, type Product, type ProductCategory } from "@/data/types";
import { commerceEnabled, release } from "@/lib/site";

type Props = { product: Product };

const PAIRS_WITH_LIMIT = 3;

/** What opens at launch, per category, for the preview notice in the buy box. */
const LAUNCH_SUBJECT: Record<ProductCategory, string> = {
  "test-key": "This test key opens",
  suite: "This suite opens",
  "ce-pass": "CE Library passes open",
  app: "The app license opens",
};

/**
 * Release notice shown in place of the price while commerce is disabled: the launch badge, when this
 * product opens, and the free workbook the visitor can read today.
 */
function ReleaseNotice({ product }: Props) {
  const workbookHref = product.workbookSlug ? `/anatomy/${product.workbookSlug}` : "/anatomy";
  const workbookLabel = product.workbookSlug ? "Read the free workbook" : "Open the free workbooks";
  return (
    <div className="rounded-xl border border-pink/30 bg-pink/[0.06] p-4">
      <LaunchBadge full />
      <p className="mt-3 text-sm leading-relaxed text-fg">
        {release.label}. {LAUNCH_SUBJECT[product.category]} with the public launch in {release.launch}. Every workbook
        and self-quiz is free to use today.
      </p>
      <Link
        href={workbookHref}
        className="group mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blush transition-colors duration-150 hover:text-fg"
      >
        <BookOpen className="size-4" strokeWidth={1.75} aria-hidden />
        {workbookLabel}
        <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
      </Link>
    </div>
  );
}

type Spec = { label: string; value: string };

/** The buy-box readout: only the rows this product has a value for, attempts always last. */
function specsFor(product: Product): Spec[] {
  const specs: Spec[] = [];
  if (product.ceCredits !== null) specs.push({ label: "CE credits", value: product.ceCredits.toFixed(1) });
  if (product.questionCount !== null) specs.push({ label: "Questions", value: `${product.questionCount} items` });
  if (product.passMark !== null) specs.push({ label: "Pass mark", value: `${product.passMark}%` });
  specs.push({ label: "Attempts", value: product.attempts });
  return specs;
}

/**
 * Up to three other products: the same modality first, then anything that spans every modality (the suite,
 * the pass, the app), then the rest. Ties keep catalogue order.
 */
export function pairsWith(product: Product, catalogue: Product[] = products): Product[] {
  const rank = (other: Product) =>
    other.modality === product.modality ? 0 : other.modality === "all" || product.modality === "all" ? 1 : 2;
  return catalogue
    .map((other, index) => ({ other, index }))
    .filter(({ other }) => other.id !== product.id)
    .sort((a, b) => rank(a.other) - rank(b.other) || a.index - b.index)
    .slice(0, PAIRS_WITH_LIMIT)
    .map(({ other }) => other);
}

/**
 * Product page body. On phones it reads art, buy box, overview, inclusions, pairings. From `lg` the buy box
 * moves to a sticky right column that spans the art and the copy, so the purchase actions stay in view
 * while the description scrolls. The h1 lives in the buy box and precedes every h2 in DOM order.
 * During the Alpha/Beta preview the buy box carries the release notice, the facts and the launch
 * notification instead of the price, availability, purchase buttons and promo note.
 */
export function ProductDetail({ product }: Props) {
  const category = PRODUCT_CATEGORY_LABEL[product.category];
  const specs = specsFor(product);
  const related = pairsWith(product);
  const promoNoun = product.category === "suite" ? "suite" : "key";

  return (
    <div className="container-x pb-24 pt-24 sm:pt-28 lg:pb-32">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/store" className="inline-flex min-h-9 items-center transition-colors duration-150 hover:text-fg">
              Store
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4 text-subtle" strokeWidth={1.75} />
          </li>
          <li className="font-medium text-fg">{category}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-x-14 lg:gap-y-16 xl:grid-cols-[minmax(0,1fr)_26rem] xl:gap-x-20">
        {/* Art panel */}
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="hairline relative aspect-4/3 overflow-hidden rounded-2xl bg-ink-2">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
            <ProductArt variant={product.art} className="absolute inset-0" />
            {product.badge ? (
              <Badge tone="neon" className="absolute left-5 top-5">
                {PRODUCT_BADGE_LABEL[product.badge]}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="panel rounded-2xl p-6 sm:p-7 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Badge tone="outline">{MODALITY_CHIP[product.modality]}</Badge>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">{category}</span>
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-fg sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">{product.tagline}</p>

            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" className="mt-4" />

            <div className="mt-6 border-t border-white/8 pt-6">
              {commerceEnabled ? (
                <>
                  <Price amount={product.price} compareAt={product.compareAt} size="lg" />
                  <div className="mt-3">
                    <StockBadge status={product.stock} />
                  </div>
                </>
              ) : (
                <ReleaseNotice product={product} />
              )}
            </div>

            <dl className="mt-6 divide-y divide-white/8 border-y border-white/8">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">{spec.label}</dt>
                  <dd className="num text-right text-sm text-fg">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {commerceEnabled ? (
              <AddToCartButton product={product} layout="stack" className="mt-6" />
            ) : (
              <LaunchNotify productSlug={product.slug} className="mt-6" />
            )}

            {commerceEnabled && product.promoEligible ? (
              <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-pink/30 bg-pink/[0.06] px-3.5 py-3 text-sm leading-relaxed text-fg">
                <Tag className="mt-0.5 size-4 shrink-0 text-blush" strokeWidth={1.75} aria-hidden />
                <span>
                  Code <span className="font-mono font-semibold tracking-[0.08em]">{nrtw.code}</span> takes {nrtw.percent}%
                  off this {promoNoun} in the cart or at checkout for {nrtw.name}, {nrtw.dates}.
                </span>
              </p>
            ) : null}

            <p className="mt-5 flex items-center justify-between gap-4 font-mono text-xs text-muted">
              <span className="uppercase tracking-[0.14em]">SKU</span>
              <span className="select-all text-silver">{product.sku}</span>
            </p>
          </div>
        </div>

        {/* Copy */}
        <div className="lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="product-overview-heading">
            <h2 id="product-overview-heading" className="text-xl font-semibold text-fg sm:text-2xl">
              Overview
            </h2>
            <div className="mt-5 max-w-[68ch] space-y-5 text-base leading-7 text-fg/80 sm:text-[1.0625rem] sm:leading-8">
              {product.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="product-includes-heading" className="mt-12 border-t border-white/8 pt-10">
            <h2 id="product-includes-heading" className="text-xl font-semibold text-fg sm:text-2xl">
              What&rsquo;s included
            </h2>
            <ul role="list" className="hairline mt-6 divide-y divide-line rounded-2xl bg-card">
              {product.includes.map((item, i) => (
                <li key={item} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-ink text-blush">
                    <Check className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="flex-1 text-fg">{item}</span>
                  <span className="num text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="pairs-with-heading" className="reveal mt-20 border-t border-white/8 pt-12 sm:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <h2 id="pairs-with-heading" className="text-2xl font-semibold text-fg sm:text-3xl">
                Pairs with
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                The same modality first, then the suite and passes that cover every modality.
              </p>
            </div>
            <Link
              href="/store"
              className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blush transition-colors duration-150 hover:text-fg"
            >
              Browse the full store
              <ArrowRight
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          </div>
          <ul role="list" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <li key={other.id} className="min-w-0">
                <ProductCard product={other} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
