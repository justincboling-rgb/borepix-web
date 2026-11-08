"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart, Zap } from "lucide-react";
import { LaunchNotify } from "@/components/commerce/launch-notice";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { commerceEnabled } from "@/lib/site";
import { useCart } from "@/lib/store/cart";

/** How long the "Added" confirmation stays on the button. */
const ADDED_MS = 1200;

type Size = "sm" | "md" | "lg";

type Props = {
  product: Product;
  /** `row`: side by side when the container is at least 24rem wide, stacked below that. `stack`: always stacked. */
  layout: "row" | "stack";
  size?: Size;
  className?: string;
};

/**
 * The purchase actions for a product. While commerce is live: "Add to Cart" adds one unit without opening
 * the drawer (the toast confirms it) and flips to a brief "Added" state, and "Buy Now with 1-Click" opens
 * checkout for this product alone. During the Alpha/Beta preview the pair is replaced by the compact
 * "Notify me at launch" control, so no purchase path renders anywhere a product appears.
 */
export function AddToCartButton({ product, layout, size, className }: Props) {
  if (!commerceEnabled) {
    return <LaunchNotify compact productSlug={product.slug} className={className} />;
  }
  return <PurchaseButtons product={product} layout={layout} size={size} className={className} />;
}

function PurchaseButtons({ product, layout, size, className }: Props) {
  const add = useCart((s) => s.add);
  const buyNow = useCart((s) => s.buyNow);
  const [added, setAdded] = useState(false);
  const [addedTick, setAddedTick] = useState(0);

  // Each add restarts the timer. The cleanup also covers unmount and the route being hidden.
  useEffect(() => {
    if (addedTick === 0) return;
    const id = window.setTimeout(() => setAdded(false), ADDED_MS);
    return () => window.clearTimeout(id);
  }, [addedTick]);

  const onAdd = () => {
    add(product.id, 1, { openDrawer: false });
    setAdded(true);
    setAddedTick((n) => n + 1);
  };

  const onBuyNow = () => buyNow(product.id);

  const row = layout === "row";
  const buttonSize: Size = size ?? (row ? "sm" : "lg");
  // The `sm` button is 40px tall; every purchase control is a 44px tap target. A fixed height rather than a
  // second min-height, so it never competes with the size's own `min-h-*` utility.
  const tapTarget = buttonSize === "sm" ? "h-11" : null;

  return (
    <div className={cn("@container", className)}>
      <div className={cn("grid grid-cols-1", row ? "gap-2 @sm:grid-cols-2" : "gap-2.5")}>
        <Button
          variant="secondary"
          size={buttonSize}
          onClick={onAdd}
          data-added={added ? "true" : "false"}
          className={cn(
            "w-full",
            tapTarget,
            "data-[added=true]:border-success/50 data-[added=true]:bg-success/10 data-[added=true]:text-success",
            "data-[added=true]:hover:border-success/60 data-[added=true]:hover:bg-success/15 data-[added=true]:hover:text-success",
          )}
        >
          {added ? (
            <Check className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
          ) : (
            <ShoppingCart className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          )}
          {added ? "Added" : "Add to Cart"}
        </Button>

        <Button variant="primary" size={buttonSize} onClick={onBuyNow} className={cn("w-full", tapTarget)}>
          {row ? null : <Zap className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />}
          Buy Now with 1-Click
        </Button>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {added ? `${product.name} added to cart.` : ""}
      </span>
    </div>
  );
}
