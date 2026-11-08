import { CircleCheck, CircleMinus, Contrast, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Three-state availability used by the comparison table. */
export type Availability = "included" | "partial" | "none";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  included: "Included",
  partial: "Partial",
  none: "Not included",
};

/** Each state has its own shape (check, half-filled, dash) so color is never the only signal. */
const ICON: Record<Availability, LucideIcon> = {
  included: CircleCheck,
  partial: Contrast,
  none: CircleMinus,
};

const TONE: Record<Availability, string> = {
  included: "text-success",
  partial: "text-warning",
  none: "text-subtle",
};

type Props = {
  value: Availability;
  /** Short qualifier shown under the label, e.g. "Some titles include online tests". */
  note?: string;
  className?: string;
};

/** Icon + visible text label (+ optional note) for one comparison cell. */
export function AvailabilityMark({ value, note, className }: Props) {
  const Icon = ICON[value];
  return (
    <span className={cn("flex items-start gap-2", className)}>
      <Icon aria-hidden strokeWidth={1.75} className={cn("mt-px size-5 shrink-0", TONE[value])} />
      <span className="min-w-0">
        <span className={cn("block text-sm font-medium", value === "none" ? "text-muted" : "text-fg")}>
          {AVAILABILITY_LABEL[value]}
        </span>
        {note ? <span className="mt-0.5 block text-xs leading-snug text-muted">{note}</span> : null}
      </span>
    </span>
  );
}
