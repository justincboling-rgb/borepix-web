import Link from "next/link";
import { useId } from "react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Price } from "@/components/store/price";
import { ProductArt } from "@/components/store/product-art";
import { StockBadge } from "@/components/store/stock-badge";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { PRODUCT_BADGE_LABEL, PRODUCT_CATEGORY_LABEL, type Modality, type Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { commerceEnabled } from "@/lib/site";

/** Short modality chip for cards. The suite, pass and app cover every modality. */
export const MODALITY_CHIP: Record<Modality, string> = {
  mri: "MRI",
  ir: "IR",
  ct: "CT",
  mammo: "Mammo",
  all: "MR · IR · CT",
};

type Props = {
  product: Product;
  /** Heading level for the product name. Cards under a page h1 or a section h2 use h3. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * Storefront card. Art on top, then modality, name, tagline, rating, CE line, availability, price and the two
 * purchase actions. The name is the accessible link; the art link is pointer-only so keyboard users get one stop.
 * During the Alpha/Beta preview the availability pill and price give way to the launch badge, and the purchase
 * actions to the "Notify me at launch" control.
 */
export function ProductCard({ product, headingLevel: Heading = "h3", className }: Props) {
  const nameId = useId();
  const href = `/store/${product.slug}`;

  return (
    <article
      aria-labelledby={nameId}
      className={cn("card-lift hairline group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card", className)}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-4/3 overflow-hidden border-b border-line bg-ink-2">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
        <ProductArt
          variant={product.art}
          className="absolute inset-0 transition-transform duration-500 ease-out-expo motion-safe:group-hover:scale-[1.03]"
        />
      </Link>

      {product.badge ? (
        <Badge tone="neon" className="absolute left-4 top-4 z-10">
          {PRODUCT_BADGE_LABEL[product.badge]}
        </Badge>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge tone="outline">{MODALITY_CHIP[product.modality]}</Badge>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
            {PRODUCT_CATEGORY_LABEL[product.category]}
          </span>
        </div>

        <Heading id={nameId} className="mt-4 text-lg font-semibold leading-snug text-fg">
          <Link
            href={href}
            className="rounded-md decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:text-blush hover:underline"
          >
            {product.name}
          </Link>
        </Heading>

        <p className="mt-2 text-sm leading-relaxed text-muted">{product.tagline}</p>

        <RatingStars rating={product.rating} reviewCount={product.reviewCount} className="mt-4" />

        {product.ceCredits !== null ? (
          <p className="num mt-3 text-sm text-fg">
            {product.ceCredits.toFixed(1)} CE credits
            {product.questionCount !== null ? <span className="text-muted"> · {product.questionCount} items</span> : null}
          </p>
        ) : null}

        {commerceEnabled ? (
          <div className="mt-3">
            <StockBadge status={product.stock} />
          </div>
        ) : null}

        <div className="mt-auto border-t border-white/8 pt-4">
          <Price amount={product.price} compareAt={product.compareAt} className="mt-1" fallback="badge" />
          <AddToCartButton product={product} layout="row" className="mt-4" />
        </div>
      </div>
    </article>
  );
}
