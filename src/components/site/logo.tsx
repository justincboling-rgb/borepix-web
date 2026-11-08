"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  eager?: boolean;
  /** Optional slogan printed under the wordmark, e.g. "Enter the dome". Bold silver. */
  tagline?: string;
};

/**
 * Borepix "bp" monogram with the lowercase wordmark. Links to the top of the home page; when already
 * on the home page it scrolls to the top instead of re-navigating.
 */
export function Logo({ className, eager = false, tagline }: Props) {
  const pathname = usePathname();

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (window.location.hash) history.replaceState(null, "", "/");
  }

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={tagline ? `borepix home. ${tagline}` : "borepix home"}
      className={cn("inline-flex shrink-0 items-center gap-2.5 rounded-lg", className)}
    >
      <Image
        src="/logo.png"
        alt=""
        width={800}
        height={402}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="h-8 w-auto"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-fg lowercase">borepix</span>
        {tagline ? (
          <span aria-hidden className="mt-1 text-[0.6875rem] leading-none font-bold tracking-[0.04em] text-zinc-300">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
