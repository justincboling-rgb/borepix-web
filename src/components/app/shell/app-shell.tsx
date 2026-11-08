import type { ReactNode } from "react";
import { BottomTabBar } from "./bottom-tab-bar";
import { GuestBanner } from "./guest-banner";
import { MobileTopBar } from "./mobile-top-bar";
import { Sidebar } from "./sidebar";

/**
 * Web app frame. Server component that composes small client leaves, so pages passed as children stay
 * Server Components.
 *
 * - lg+: fixed 256px sidebar, content offset with lg:pl-64.
 * - below lg: sticky top bar and a fixed bottom tab bar; main reserves bottom padding (tab bar height plus
 *   the safe-area inset) so page content is never hidden behind it.
 *
 * main has no horizontal padding: pages wrap their content in `container-x py-8`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:pl-64">
      <Sidebar />
      {/* No stacking context here, so fixed overlays inside pages can still layer above the shell. */}
      <div className="haze-top flex min-h-dvh flex-col bg-[length:100%_24rem] bg-no-repeat pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:pl-0 lg:pr-0">
        <MobileTopBar />
        <GuestBanner />
        <main id="main" className="flex-1 pb-[calc(5.5rem_+_env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
