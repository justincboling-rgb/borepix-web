"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { AuthMenu } from "@/components/site/auth-menu";
import { CartTrigger } from "@/components/site/cart-trigger";
import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { affiliateCta, ceLibraryCta, marketingNav, site } from "@/lib/site";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DESKTOP_QUERY = "(min-width: 1024px)";

/** "/" matches only the home page; every other link matches itself and its sub-routes. */
function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function panelVariants(reduce: boolean): Variants {
  if (reduce) {
    return { hidden: { opacity: 1 }, show: { opacity: 1 }, exit: { opacity: 1, transition: { duration: 0 } } };
  }
  return {
    hidden: { opacity: 0, y: -8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, staggerChildren: 0.035, delayChildren: 0.04 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE } },
  };
}

function itemVariants(reduce: boolean): Variants {
  if (reduce) return { hidden: { opacity: 1 }, show: { opacity: 1 } };
  return { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } };
}

/**
 * Sticky glass navigation: one horizontal line at every desktop width. Logo and motto on the left,
 * the six page links in the middle, then the cart, the account (person) menu and the CE Library CTA.
 * Below lg the links move into an animated panel; the cart and account icons stay in the bar.
 */
export function Nav() {
  const pathname = usePathname();
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Close the mobile menu on route change (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // While the menu is open: Escape closes it and returns focus to the toggle, page scroll is locked,
  // the first link takes focus, the panel fills the viewport below the header, and crossing into the
  // desktop layout closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const fit = () => {
      const bottom = header.current?.getBoundingClientRect().bottom ?? 64;
      if (panel.current) panel.current.style.height = `calc(100dvh - ${Math.max(0, Math.round(bottom))}px)`;
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    fit();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", fit);
    desktop.addEventListener("change", onDesktop);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", fit);
      desktop.removeEventListener("change", onDesktop);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      ref={header}
      className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-md backdrop-saturate-150"
    >
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-4 xl:gap-6">
        <Logo eager tagline={site.motto} className="shrink-0" />

        <ul className="hidden h-full min-w-0 items-center gap-0.5 whitespace-nowrap lg:flex">
          {marketingNav.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href} className="h-full shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-full items-center rounded-lg px-2.5 text-[0.8125rem] font-medium transition-colors duration-150 xl:px-3 xl:text-sm",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-active-indicator"}
                      aria-hidden
                      className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-pink xl:inset-x-3"
                      transition={{ type: "spring", stiffness: 520, damping: 44 }}
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <CartTrigger onOpen={close} />
          <AuthMenu />
          <div className="hidden pl-1 lg:block">
            <ButtonLink href={ceLibraryCta.href} size="sm" className="whitespace-nowrap">
              {ceLibraryCta.label}
            </ButtonLink>
          </div>
          <button
            ref={menuButton}
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-xl text-fg transition-colors duration-150 hover:bg-white/8 lg:hidden"
            aria-expanded={open}
            aria-controls={open ? "mobile-menu" : undefined}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-6" strokeWidth={1.75} aria-hidden />
            ) : (
              <Menu className="size-6" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            ref={panel}
            variants={panelVariants(reduce)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/8 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {marketingNav.map((item) => {
                const active = isActive(item.href, pathname);
                return (
                  <motion.li key={item.href} variants={itemVariants(reduce)}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={close}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-3 text-lg font-medium text-fg transition-colors duration-150",
                        active ? "bg-white/[0.05]" : "hover:bg-white/[0.06]",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn("h-5 w-0.5 shrink-0 rounded-full", active ? "bg-pink" : "bg-transparent")}
                      />
                      {item.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <motion.div variants={itemVariants(reduce)} className="container-x flex flex-col gap-3 border-t border-white/8 pt-5 pb-10">
              <ButtonLink href={ceLibraryCta.href} size="lg" className="w-full" onClick={close}>
                {ceLibraryCta.label}
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </ButtonLink>
              <ButtonLink href={affiliateCta.href} variant="secondary" size="lg" onClick={close} className="w-full text-blush">
                {affiliateCta.label}
              </ButtonLink>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
