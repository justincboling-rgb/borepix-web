import type { Lesson } from "@/lib/content/types";
import { cn } from "@/lib/cn";

const BARS: Record<Lesson["level"], number> = { Foundations: 1, Core: 2, Advanced: 3 };

/** Lesson level chip. A three-step bar glyph repeats the level visually; the text carries the meaning. */
export function LevelChip({ level, className }: { level: Lesson["level"]; className?: string }) {
  const filled = BARS[level] ?? 1;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted",
        className,
      )}
    >
      <span aria-hidden className="inline-flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn("w-[3px] rounded-full", n <= filled ? "bg-silver" : "bg-white/15")}
            style={{ height: `${4 + n * 2}px` }}
          />
        ))}
      </span>
      {level}
    </span>
  );
}
