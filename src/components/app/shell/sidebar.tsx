"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { HardDrive, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { appNavItems, isActivePath, SETTINGS_HREF } from "./nav";
import { ProfileBlock } from "./profile-block";
import { ShellLogo } from "./shell-logo";

/** Desktop (lg+) fixed left sidebar, 256px wide. */
export function Sidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-ink-2 lg:flex">
      <div className="flex h-16 shrink-0 items-center px-5">
        <ShellLogo />
      </div>

      {/* usePathname can suspend during prerender of unknown dynamic params; fall back to inactive links. */}
      <Suspense fallback={<SidebarNav pathname={null} />}>
        <ActiveSidebarNav />
      </Suspense>

      <div className="shrink-0 space-y-3 border-t border-white/8 p-4">
        <ProfileBlock />
        <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
          <HardDrive aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-silver/80" />
          Preview mode: progress is saved in this browser.
        </p>
      </div>
    </div>
  );
}

function ActiveSidebarNav() {
  const pathname = usePathname();
  return <SidebarNav pathname={pathname} />;
}

function SidebarNav({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="App" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-2">
      <p className="px-3 pb-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted">Study</p>
      <ul className="space-y-1">
        {appNavItems.map((item) => (
          <li key={item.href}>
            <SidebarLink href={item.href} label={item.label} Icon={item.Icon} active={isActivePath(pathname, item.href)} />
          </li>
        ))}
      </ul>
      <ul className="mt-auto space-y-1 pt-6">
        <li>
          <SidebarLink
            href={SETTINGS_HREF}
            label="Settings"
            Icon={Settings}
            active={isActivePath(pathname, SETTINGS_HREF)}
          />
        </li>
      </ul>
    </nav>
  );
}

function SidebarLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition-colors duration-150",
        active ? "bg-pink/10 font-semibold text-fg" : "font-medium text-muted hover:bg-white/[0.05] hover:text-fg",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-pink transition-opacity duration-150",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "size-5 shrink-0 transition-colors duration-150",
          active ? "text-pink" : "text-silver/70 group-hover:text-silver",
        )}
      />
      {label}
    </Link>
  );
}
