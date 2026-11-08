import { Check, Clock, Zap, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StockStatus } from "@/data/types";

type Tone = "success" | "warning";

const STOCK: Record<StockStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  digital: { label: "Instant digital delivery", tone: "success", icon: Zap },
  "in-stock": { label: "In stock", tone: "success", icon: Check },
  low: { label: "Low stock", tone: "warning", icon: Clock },
};

/** Availability pill. Colour never stands alone: every state carries an icon and a label. */
export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  const { label, tone, icon: Icon } = STOCK[status];
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </Badge>
  );
}
