import { BookOpenCheck, LayoutGrid, MonitorSmartphone, ScanLine, Timer, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Fact = { icon: LucideIcon; text: string };

/** Product facts only. No numbers, ratings or logos: everything here is true of the product today. */
const FACTS: Fact[] = [
  { icon: LayoutGrid, text: "Organized by ARRT® content category" },
  { icon: ScanLine, text: "Radiography and MRI tracks" },
  { icon: BookOpenCheck, text: "A full rationale for every answer" },
  { icon: Timer, text: "Timed exam simulation" },
  { icon: MonitorSmartphone, text: "Web app now, mobile app soon" },
];

/** Thin band of honest product facts directly under the hero. */
export function TrustStrip() {
  return (
    <section aria-label="What Borepix includes" className="relative border-y border-white/8 bg-ink-2/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-pink/45 to-transparent"
      />
      <div className="container-x">
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-8 gap-y-3.5 py-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6 lg:py-7"
        >
          {FACTS.map(({ icon: Icon, text }, i) => (
            <li
              key={text}
              className={cn(
                "flex items-center gap-3 text-sm leading-snug text-silver",
                // Odd count: the last fact spans the row in the two-column layout.
                i === FACTS.length - 1 && "sm:col-span-2 lg:col-span-1",
              )}
            >
              <Icon aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-blush" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
