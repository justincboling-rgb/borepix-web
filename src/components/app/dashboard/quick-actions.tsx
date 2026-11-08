import Link from "next/link";
import { ArrowRight, Layers, Magnet, Target, Timer, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type QuickAction = {
  href: string;
  title: string;
  detail: string;
  Icon: LucideIcon;
  /** The one emphasized action in the view. */
  primary?: boolean;
};

export const ACTION_ICONS = { practice: Target, flashcards: Layers, mri: Magnet, exam: Timer } as const;

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <section aria-labelledby="next-steps-heading">
      <h2 id="next-steps-heading" className="text-xl font-semibold text-fg">
        Next steps
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {actions.map(({ href, title, detail, Icon, primary }) => (
          <li key={href} className="flex">
            <Link
              href={href}
              className={cn(
                "group flex w-full items-start gap-4 rounded-2xl border p-4 transition-[border-color,background-color,transform] duration-150 active:scale-[0.99] sm:p-5",
                primary
                  ? "glow-pink border-pink/45 bg-pink/[0.07] hover:bg-pink/[0.11]"
                  : "border-line bg-card hover:border-white/20 hover:bg-card-2",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border",
                  primary ? "border-pink/40 bg-pink/15 text-pink" : "border-white/10 bg-white/[0.04] text-silver",
                )}
              >
                <Icon aria-hidden strokeWidth={1.75} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug text-fg">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{detail}</span>
              </span>
              <ArrowRight
                aria-hidden
                strokeWidth={1.75}
                className="mt-0.5 size-5 shrink-0 text-silver/70 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
