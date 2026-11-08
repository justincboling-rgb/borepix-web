import { ChevronDown, Clock } from "lucide-react";
import type { WorkbookModule } from "@/data/types";
import { cn } from "@/lib/cn";

const pad2 = (n: number) => String(n).padStart(2, "0");

type Props = {
  modules: WorkbookModule[];
  /** Index of the module open on first paint, or null for all collapsed. */
  defaultOpen?: number | null;
  className?: string;
};

/**
 * The workbook's modules as a native details/summary accordion, numbered like a clinical workbook.
 * No JavaScript: the browser handles open state, so it works before hydration and in reader modes.
 */
export function ModuleList({ modules, defaultOpen = 0, className }: Props) {
  return (
    <ol role="list" className={cn("hairline divide-y divide-line overflow-hidden rounded-2xl bg-card", className)}>
      {modules.map((module, i) => (
        <li key={module.id}>
          <details className="group" open={i === defaultOpen}>
            <summary className="flex list-none items-start gap-4 px-5 py-5 transition-colors duration-150 hover:bg-white/[0.03] sm:px-6 [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="num mt-0.5 shrink-0 text-sm font-medium text-blush">
                {pad2(i + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-snug text-fg sm:text-lg">{module.title}</h3>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{module.summary}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 pt-0.5">
                <span className="num inline-flex items-center gap-1.5 text-xs text-muted">
                  <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
                  {module.minutes} min
                </span>
                <ChevronDown
                  className="size-5 text-silver transition-transform duration-250 ease-out-expo group-open:rotate-180"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
            </summary>

            <div className="grid gap-7 border-t border-white/8 px-5 pb-7 pt-5 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
              <div>
                <h4 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">Objectives</h4>
                <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-fg/90">
                  {module.objectives.map((objective, j) => (
                    <li key={objective} className="flex gap-3">
                      <span className="num shrink-0 text-blush">{j + 1}.</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">Key points</h4>
                <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-fg/90 marker:text-pink">
                  {module.keyPoints.map((point) => (
                    <li key={point} className="pl-1.5">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
