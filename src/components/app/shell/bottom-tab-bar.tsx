"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { appNavItems, isActivePath } from "./nav";

/** Mobile and tablet (below lg) fixed bottom tab bar with the five app sections. */
export function BottomTabBar() {
  return (
    <Suspense fallback={<TabBar pathname={null} />}>
      <ActiveTabBar />
    </Suspense>
  );
}

function ActiveTabBar() {
  const pathname = usePathname();
  return <TabBar pathname={pathname} />;
}

function TabBar({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink/90 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {appNavItems.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] leading-none transition-colors duration-150",
                  active ? "font-semibold text-fg" : "font-medium text-muted hover:text-fg",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-5 top-0 h-0.5 rounded-full bg-pink transition-opacity duration-150",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon
                  aria-hidden
                  strokeWidth={1.75}
                  className={cn("size-5 shrink-0", active ? "text-pink" : "text-silver/80")}
                />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
