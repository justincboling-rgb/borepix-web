import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, House } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";
import { marketingNav, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist on Borepix. Return to the home page or open the study app.",
};

/**
 * Root 404. Renders inside the root layout only (no marketing Nav/Footer), for unmatched URLs and for
 * notFound() calls that no nearer boundary catches.
 */
export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]" />

      <header className="container-x flex h-16 items-center">
        <Logo />
      </header>

      <main id="main" className="container-x flex flex-1 flex-col items-center justify-center py-16 text-center">
        <BoreGraphic />

        <p className="eyebrow mt-10">Error 404 · Page not found</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold text-fg sm:text-5xl lg:text-6xl">
          That page isn’t in the protocol.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          The address may have a typo, or the page may have moved. Head back to the home page, or pick up where you
          left off in the study app.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/" size="lg">
            <House className="size-5" strokeWidth={1.75} aria-hidden />
            Back to home
          </ButtonLink>
          <ButtonLink href="/app" variant="secondary" size="lg">
            Open the study app
            <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
          </ButtonLink>
        </div>

        <nav aria-label="Popular pages" className="mt-12">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {marketingNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-150 hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="container-x flex flex-col items-center justify-center gap-1 py-8 text-center text-sm text-subtle sm:flex-row sm:gap-3">
        <p>
          © {site.copyrightYear} {site.name}
        </p>
        <span aria-hidden className="hidden sm:inline">
          ·
        </span>
        <p>
          Need help?{" "}
          <a
            href={`mailto:${site.supportEmail}`}
            className="text-blush underline decoration-blush/40 underline-offset-4 hover:decoration-blush"
          >
            {site.supportEmail}
          </a>
        </p>
      </footer>
    </div>
  );
}

/** Decorative MRI bore: silver housing, dark bore, one pink ring with a slow pulse (static under reduced motion). */
function BoreGraphic() {
  return (
    <div aria-hidden className="relative grid size-44 place-items-center sm:size-52">
      <div className="absolute inset-0 rounded-full bg-pink/15 blur-3xl" />
      <div className="absolute inset-0 rounded-full border border-white/12 bg-linear-to-b from-silver/[0.14] to-white/[0.02]" />
      <div className="absolute inset-[13%] rounded-full border border-white/10 bg-ink-2" />
      <div className="absolute inset-[27%] rounded-full border border-pink/60 shadow-[var(--shadow-glow)]" />
      <div className="absolute inset-[27%] rounded-full border border-pink/40 motion-safe:animate-[bp-pulse-ring_2.8s_var(--ease-out-expo)_infinite]" />
      <span className="num relative text-3xl font-medium tracking-tight text-blush sm:text-4xl">404</span>
    </div>
  );
}
