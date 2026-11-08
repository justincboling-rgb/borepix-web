import { useId } from "react";
import { Lock } from "lucide-react";

const SIZE = 160;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Minimum answers before getReadiness returns a value (mirrors the store selector). */
export const READINESS_MIN_ANSWERS = 20;

type Props = {
  /** 0–100, or null while locked. */
  value: number | null;
  /** Answers on this track so far, shown while locked. */
  answered: number;
};

/** Static SVG ring. No animated stroke: motion is limited to transform and opacity. */
export function ReadinessRing({ value, answered }: Props) {
  // useId output can contain characters that are awkward inside url(#…); keep it to [A-Za-z0-9_-].
  const gradientId = `readiness-${useId().replace(/[^\w-]/g, "")}`;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const label =
    value === null
      ? `Readiness locked: ${Math.min(answered, READINESS_MIN_ANSWERS)} of ${READINESS_MIN_ANSWERS} answers so far`
      : `Readiness ${pct} out of 100`;

  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90" role="img" aria-label={label}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-blush)" }} />
            <stop offset="55%" style={{ stopColor: "var(--color-pink)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-rose)" }} />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-white/8"
          strokeDasharray={value === null ? "2 6" : undefined}
        />
        {value !== null && pct > 0 ? (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
          />
        ) : null}
      </svg>
      <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {value === null ? (
          <>
            <Lock strokeWidth={1.75} className="size-6 text-silver" />
            <span className="num mt-2 text-sm text-muted">
              {Math.min(answered, READINESS_MIN_ANSWERS)}/{READINESS_MIN_ANSWERS}
            </span>
          </>
        ) : (
          <>
            <span className="num text-4xl font-semibold text-fg">{pct}</span>
            <span className="num mt-1 text-xs text-muted">/ 100</span>
          </>
        )}
      </div>
    </div>
  );
}
