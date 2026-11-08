import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  Icon: LucideIcon;
  /** Large figure, e.g. "12". */
  value: ReactNode;
  /** Unit or label beside the figure, e.g. "day streak". */
  unit?: ReactNode;
  /** Supporting line under the figure. */
  detail?: ReactNode;
};

export function StatCard({ title, Icon, value, unit, detail }: Props) {
  return (
    <div className="panel flex flex-col rounded-2xl p-5">
      <h3 className="flex items-center gap-2 font-sans text-sm font-medium text-muted">
        <Icon aria-hidden strokeWidth={1.75} className="size-4 text-blush" />
        {title}
      </h3>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="num text-3xl font-semibold text-fg">{value}</span>
        {unit ? <span className="text-sm text-muted">{unit}</span> : null}
      </p>
      {detail ? <div className="mt-2 text-sm leading-relaxed text-muted">{detail}</div> : null}
    </div>
  );
}
