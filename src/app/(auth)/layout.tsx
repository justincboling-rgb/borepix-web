import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/site/logo";
import { footerLegalLinks } from "@/lib/site";

const footerLinkClass = "inline-flex min-h-11 items-center text-sm text-muted transition-colors duration-150 hover:text-fg";

/** Minimal frame for log in and sign up: logo header, the centered auth card, legal footer links. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 h-[32rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-70" />

      <header className="container-x relative flex h-16 items-center">
        <Logo eager />
      </header>

      <main id="main" className="container-x relative flex flex-1 flex-col items-center justify-center py-6 sm:py-10 lg:py-14">
        {children}
      </main>

      <footer className="container-x relative pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-6 border-t border-white/8 pt-4">
          {footerLegalLinks.map((link) =>
            link.href.startsWith("mailto:") ? (
              <a key={link.href} href={link.href} className={footerLinkClass}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={footerLinkClass}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </footer>
    </div>
  );
}
