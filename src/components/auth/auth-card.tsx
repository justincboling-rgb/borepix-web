import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { BrandPanel } from "./brand-panel";

/**
 * The split auth card: brand panel on the left (a slim strip on small screens), the form column on the
 * right. `children` is the form column: heading, form, then the switch to the other screen.
 */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="panel enter w-full max-w-5xl overflow-hidden rounded-2xl lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <BrandPanel />
      <div className="p-5 sm:p-8 lg:flex lg:flex-col lg:justify-center lg:p-10 xl:px-14 xl:py-12">{children}</div>
    </div>
  );
}

/** The page's single h1 and its one-line lede. */
export function AuthHeading({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-semibold text-fg sm:text-3xl">{title}</h1>
      <p className="mt-2 text-muted">{lede}</p>
    </div>
  );
}

/** "Or" divider followed by the link to the other auth screen. */
export function AuthSwitch({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-7">
      <div aria-hidden className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-sm font-medium text-muted">Or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <ButtonLink href={href} variant="secondary" size="lg" className="mt-6 w-full">
        {label}
      </ButtonLink>
    </div>
  );
}
