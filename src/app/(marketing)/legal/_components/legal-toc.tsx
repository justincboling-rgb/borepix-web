"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import { cn } from "@/lib/cn";

export type TocItem = { id: string; label: string };

/** A section counts as current once its top passes this line (fixed 64px nav plus breathing room). */
const ACTIVE_LINE_PX = 120;

const pad = (n: number) => String(n).padStart(2, "0");

/** Tracks which section is being read. Cleans up on unmount and when the route is hidden by Activity. */
function useActiveSection(idsKey: string) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = idsKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      let current: string | null = null;
      if (atBottom) {
        current = sections[sections.length - 1].id;
      } else {
        for (const el of sections) {
          if (el.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = el.id;
          else break;
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [idsKey]);

  return active;
}

/**
 * On-page table of contents. Below lg it is a collapsible panel above the document; from lg up it is a
 * sidebar list that marks the section currently in view. Only one variant is displayed at a time, so
 * assistive technology never sees both.
 */
export function LegalToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map((item) => item.id).join("|"));
  const details = useRef<HTMLDetailsElement>(null);

  const closeMobile = () => {
    if (details.current) details.current.open = false;
  };

  return (
    <>
      <details ref={details} className="group panel rounded-2xl lg:hidden">
        <summary className="flex min-h-13 list-none items-center justify-between gap-4 rounded-2xl px-5 font-medium text-fg [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-3">
            <ListOrdered className="size-5 text-blush" strokeWidth={1.75} aria-hidden />
            On this page
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <span className="num">{items.length} sections</span>
            <ChevronDown
              className="size-5 transition-transform duration-250 ease-out-expo group-open:rotate-180"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        </summary>
        <nav aria-label="On this page" className="border-t border-line p-2">
          <ol>
            {items.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={closeMobile}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-[0.95rem] leading-snug text-fg transition-colors duration-150 hover:bg-white/[0.05]"
                >
                  <span className="num w-6 shrink-0 text-xs text-muted" aria-hidden>
                    {pad(i + 1)}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>

      <nav aria-label="On this page" className="hidden lg:block">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">On this page</p>
        <ol className="mt-4 border-l border-line">
          {items.map((item, i) => {
            const current = item.id === active;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "-ml-px flex min-h-11 items-center gap-3 border-l-2 py-1.5 pl-4 pr-2 text-sm leading-snug transition-colors duration-150 pointer-fine:min-h-9",
                    current
                      ? "border-pink font-medium text-fg"
                      : "border-transparent text-muted hover:border-white/25 hover:text-fg",
                  )}
                >
                  <span className={cn("num w-5 shrink-0 text-xs", current ? "text-blush" : "text-muted")} aria-hidden>
                    {pad(i + 1)}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
