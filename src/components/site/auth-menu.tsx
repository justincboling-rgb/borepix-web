"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, LogIn, LogOut, Settings, UserRound, UserRoundPlus, KeyRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { accountLink, loginLink, release, signupLink } from "@/lib/site";
import { signOut, useHydrated, useProgress } from "@/lib/store/progress";

type Item = { label: string; href: string; icon: LucideIcon };

const SIGNED_OUT: Item[] = [
  { label: loginLink.label, href: loginLink.href, icon: LogIn },
  { label: signupLink.label, href: signupLink.href, icon: UserRoundPlus },
];

const SIGNED_IN: Item[] = [
  { label: accountLink.label, href: accountLink.href, icon: KeyRound },
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The header's person icon. Opens a compact menu that links to log in and sign up, or, once a profile
 * exists on this device, to the account, dashboard and settings plus sign out. Escape, outside clicks
 * and route changes close it; arrow keys move between items.
 */
export function AuthMenu({ className }: { className?: string }) {
  const uid = useId();
  const menuId = `${uid}-menu`;
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { profile } = useProgress();
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Close on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signedIn = hydrated && profile !== null;
  const items = signedIn ? SIGNED_IN : SIGNED_OUT;

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    const focusables = Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (focusables.length === 0) return;
    const index = focusables.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusables[(index + 1) % focusables.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusables[(index - 1 + focusables.length) % focusables.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      focusables[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      focusables[focusables.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={trigger}
        type="button"
        aria-label={signedIn ? `Account menu for ${profile.name}` : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-fg transition-colors duration-150 hover:bg-white/8",
          open && "bg-white/8",
        )}
      >
        <UserRound className="size-[1.375rem]" strokeWidth={1.5} aria-hidden />
        {signedIn ? (
          <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-pink ring-2 ring-ink" />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            id={menuId}
            ref={panel}
            role="menu"
            aria-label="Account"
            onKeyDown={onMenuKey}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: EASE } }}
            exit={reduce ? { opacity: 1, transition: { duration: 0 } } : { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.14, ease: EASE } }}
            className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-white/10 bg-card/95 p-2 shadow-panel backdrop-blur-xl"
          >
            <div className="px-3 pt-2 pb-3">
              {signedIn ? (
                <>
                  <p className="truncate text-sm font-semibold text-fg">{profile.name}</p>
                  <p className="truncate text-xs text-muted">{profile.email}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-fg">Your Borepix account</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">Progress, keys and certificates, in one place.</p>
                </>
              )}
            </div>
            <div className="border-t border-white/8 pt-1">
              {items.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-white/[0.06] focus-visible:bg-white/[0.06]"
                >
                  <Icon className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
                  {label}
                </Link>
              ))}
              {signedIn ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg focus-visible:bg-white/[0.06]"
                >
                  <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
                  Sign out
                </button>
              ) : null}
            </div>
            {!release.commerceEnabled ? (
              <p className="mt-1 border-t border-white/8 px-3 pt-3 pb-1 font-mono text-[0.625rem] leading-relaxed tracking-[0.12em] text-muted uppercase">
                {release.short}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
