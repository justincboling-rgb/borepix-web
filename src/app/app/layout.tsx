import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/shell/app-shell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Borepix" },
  robots: { index: false, follow: false },
};

/** Let the bottom tab bar extend under the home indicator; it pads itself with env(safe-area-inset-bottom). */
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
