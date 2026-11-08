import { Layers, LayoutDashboard, Magnet, Target, Timer, type LucideIcon } from "lucide-react";
import { appNav } from "@/lib/site";

type AppNavIconName = (typeof appNav)[number]["icon"];

const ICONS: Record<AppNavIconName, LucideIcon> = {
  LayoutDashboard,
  Target,
  Timer,
  Magnet,
  Layers,
};

export type AppNavItem = { label: string; href: string; Icon: LucideIcon };

/** appNav from site config with its icon names resolved to lucide components. */
export const appNavItems: AppNavItem[] = appNav.map((item) => ({
  label: item.label,
  href: item.href,
  Icon: ICONS[item.icon],
}));

export const SETTINGS_HREF = "/app/settings";

/** Exact match for the dashboard (/app), prefix match for every other section. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}
