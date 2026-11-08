"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useCart, useCartCount } from "@/lib/store/cart";

type Props = {
  className?: string;
  /** Runs just before the drawer opens. The nav uses it to close the mobile menu. */
  onOpen?: () => void;
};

/**
 * Icon button that opens the cart drawer. The badge shows the number of units in the cart and pops
 * when that number goes up. The count is 0 until the store hydrates, so server and first paint agree.
 */
export function CartTrigger({ className, onOpen }: Props) {
  const count = useCartCount();
  const openDrawer = useCart((s) => s.openDrawer);
  const reduce = useReducedMotion();

  // Remember the last count so the badge pops only when something was added (state adjusted during
  // render, not in an effect).
  const [seen, setSeen] = useState({ count, increased: false });
  if (seen.count !== count) setSeen({ count, increased: count > seen.count });

  const pop = seen.increased && !reduce;
  const label = count === 0 ? "Open cart" : `Open cart, ${count} ${count === 1 ? "item" : "items"}`;

  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.();
        openDrawer();
      }}
      aria-label={label}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-fg transition-colors duration-150 hover:bg-white/8",
        className,
      )}
    >
      <ShoppingCart className="size-[1.375rem]" strokeWidth={1.5} aria-hidden />
      {count > 0 ? (
        <motion.span
          key={count}
          aria-hidden
          initial={pop ? { scale: 0.5, opacity: 0 } : false}
          animate={{ scale: pop ? [0.5, 1.25, 1] : 1, opacity: 1 }}
          transition={pop ? { duration: 0.4, times: [0, 0.6, 1], ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
          className="num absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-strong px-1.5 text-[0.6875rem] leading-none font-semibold text-white ring-2 ring-ink"
        >
          {count}
        </motion.span>
      ) : null}
    </button>
  );
}
