import { CircleCheck, Flag, Target } from "lucide-react";
import { CATEGORIES, CATEGORY_LABEL, type ContentCategory } from "@/lib/content/types";
import { TISSUES, larmorMHz, t1Recovery, type Tissue } from "@/lib/mri-physics";
import { cn } from "@/lib/cn";

/**
 * Small, static UI vignettes for the Features bento grid. Built in HTML/SVG (no images) so they stay
 * sharp, themeable and light. Each one is a single labelled image for assistive tech; the tile text
 * around it carries the actual feature description.
 */

const well = "rounded-xl border border-white/8 bg-ink-2";
const chip = "rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted";

/* ─────────────── (a) Question bank ─────────────── */

const SAMPLE_CHOICES = ["Halve the mAs", "Increase kVp by 15%", "Double the SID", "Add a 12:1 grid"] as const;
const SAMPLE_ANSWER = 1;
const LETTERS = ["A", "B", "C", "D"] as const;

export function QuestionVignette() {
  return (
    <div
      role="img"
      aria-label="Example practice question with answer B, increase kVp by 15%, marked correct, followed by its rationale"
      className={cn(well, "p-4 sm:p-5")}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={chip}>Radiography</span>
        <span className={chip}>Image Production</span>
        <span className="rounded-full border border-pink/30 bg-pink/10 px-2.5 py-0.5 text-xs text-blush">
          Exposure factors
        </span>
      </div>

      <p className="mt-4 text-[0.95rem] leading-relaxed text-fg sm:text-base">
        With all other factors unchanged, which adjustment roughly doubles exposure to the image receptor?
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {SAMPLE_CHOICES.map((choice, i) => {
          const correct = i === SAMPLE_ANSWER;
          return (
            <li
              key={choice}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                correct ? "border-success/50 bg-success/10 text-fg" : "border-white/8 bg-white/[0.02] text-muted",
              )}
            >
              <span
                className={cn(
                  "num inline-flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                  correct ? "border-success bg-success text-ink" : "border-white/15 text-muted",
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1">{choice}</span>
              {correct ? (
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />
                  Correct
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-lg border border-white/8 bg-card p-3.5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-blush">Rationale</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          The 15 percent rule: raising kVp by about 15% doubles receptor exposure, the same effect as doubling
          mAs. Doubling SID cuts exposure to one quarter under the inverse square law.
        </p>
      </div>
    </div>
  );
}

/* ─────────────── (b) Timed mock exam ─────────────── */

type NavState = "answered" | "flagged" | "current" | "open";

const NAV_TOTAL = 30;
const NAV_CURRENT = 18;
const NAV_FLAGGED = new Set([6, 13]);
const NAV_SKIPPED = new Set([11]);

function navState(n: number): NavState {
  if (n === NAV_CURRENT) return "current";
  if (NAV_FLAGGED.has(n)) return "flagged";
  if (n < NAV_CURRENT && !NAV_SKIPPED.has(n)) return "answered";
  return "open";
}

const NAV_CELL: Record<NavState, string> = {
  answered: "bg-silver/70",
  flagged: "border border-warning/70 bg-warning/15 text-warning",
  current: "border-2 border-pink bg-pink/15",
  open: "border border-white/15",
};

export function ExamVignette() {
  const cells = Array.from({ length: NAV_TOTAL }, (_, i) => i + 1);
  return (
    <div
      role="img"
      aria-label="Example mock exam screen: 1 hour 12 minutes remaining on question 18, with a navigator showing answered, flagged and unanswered questions"
      className={cn(well, "p-4")}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Time remaining</p>
          <p className="num mt-0.5 text-2xl font-semibold tracking-tight text-fg">01:12:08</p>
        </div>
        <span className="num rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted">Question 18</span>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full w-[38%] rounded-full bg-pink" />
      </div>

      <ul className="mt-4 grid grid-cols-10 gap-1.5">
        {cells.map((n) => {
          const state = navState(n);
          return (
            <li
              key={n}
              className={cn("flex aspect-square items-center justify-center rounded-[5px]", NAV_CELL[state])}
            >
              {state === "flagged" ? <Flag aria-hidden strokeWidth={2} className="size-3" /> : null}
            </li>
          );
        })}
      </ul>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-silver/70" />
          Answered
        </li>
        <li className="flex items-center gap-1.5">
          <Flag aria-hidden strokeWidth={2} className="size-3 text-warning" />
          Flagged
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] border-2 border-pink" />
          Current
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] border border-white/25" />
          Unanswered
        </li>
      </ul>
    </div>
  );
}

/* ─────────────── (c) Readiness by category ─────────────── */

/** Illustrative values only, labelled "Example" in the UI. Not user data, not a claim. */
const EXAMPLE_READINESS: Record<ContentCategory, number> = {
  "patient-care": 78,
  safety: 64,
  "image-production": 71,
  procedures: 52,
};

export function ReadinessVignette() {
  const rows = CATEGORIES.map((id) => ({ id, label: CATEGORY_LABEL[id], value: EXAMPLE_READINESS[id] }));
  const weakest = rows.reduce((min, r) => (r.value < min.value ? r : min), rows[0]);
  const summary = rows.map((r) => `${r.label} ${r.value}%`).join(", ");

  return (
    <div
      role="img"
      aria-label={`Example readiness chart: ${summary}. ${weakest.label} is marked as the focus for the next session.`}
      className={cn(well, "p-4")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-fg">Readiness by category</p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
          Example
        </span>
      </div>
      <ul className="mt-4 grid gap-3.5">
        {rows.map((r) => {
          const focus = r.id === weakest.id;
          return (
            <li key={r.id}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className={focus ? "font-medium text-fg" : "text-muted"}>{r.label}</span>
                <span className="num text-fg">{r.value}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn("h-full rounded-full", focus ? "bg-pink" : "bg-silver/55")}
                  style={{ width: `${r.value}%` }}
                />
              </div>
              {focus ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-blush">
                  <Target aria-hidden strokeWidth={1.75} className="size-3.5" />
                  Focus next
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────── (d) MRI physics lab ─────────────── */

const FIELD = 1.5 as const;
const TR_MS = 500;
const T_MAX_MS = 2500;
const PLOT = { x0: 6, x1: 314, top: 10, bottom: 118 } as const;
const SHOWN: Tissue["id"][] = ["fat", "white-matter", "csf"];
/** Distinct dash patterns so curves are told apart by shape as well as color. */
const DASH: Partial<Record<Tissue["id"], string>> = { "white-matter": "7 4", csf: "1.5 4" };

const px = (tMs: number) => PLOT.x0 + (tMs / T_MAX_MS) * (PLOT.x1 - PLOT.x0);
const py = (mz: number) => PLOT.bottom - mz * (PLOT.bottom - PLOT.top);

function recoveryPath(t1Ms: number): string {
  const steps = 60;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * T_MAX_MS;
    points.push(`${i === 0 ? "M" : "L"}${px(t).toFixed(1)} ${py(t1Recovery(t, t1Ms)).toFixed(1)}`);
  }
  return points.join(" ");
}

/** Deterministic, computed once at module load from the shared physics helpers. */
const CURVES = TISSUES[FIELD].filter((t) => SHOWN.includes(t.id)).map((t) => ({
  id: t.id,
  label: t.label,
  color: t.color,
  dash: DASH[t.id],
  d: recoveryPath(t.t1),
  atTr: t1Recovery(TR_MS, t.t1),
}));

const LARMOR = larmorMHz(FIELD).toFixed(2);

export function PhysicsVignette() {
  const summary = CURVES.map((c) => `${c.label} ${Math.round(c.atTr * 100)} percent`).join(", ");
  const trX = px(TR_MS);

  return (
    <div
      role="img"
      aria-label={`Example T1 recovery curves at ${FIELD} tesla, Larmor frequency ${LARMOR} megahertz. Longitudinal magnetization recovered at TR ${TR_MS} milliseconds: ${summary}.`}
      className={cn(well, "p-4")}
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
        <span>
          B<sub className="text-[0.75em]">0</sub> <span className="text-fg">{FIELD} T</span>
        </span>
        <span>
          TR <span className="text-fg">{TR_MS} ms</span>
        </span>
        <span>
          f<sub className="text-[0.75em]">0</sub> <span className="text-fg">{LARMOR} MHz</span>
        </span>
      </div>

      <svg viewBox="0 0 320 128" className="mt-3 h-auto w-full" aria-hidden focusable="false">
        <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.top} y2={PLOT.top} className="stroke-white/10" strokeDasharray="2 4" />
        <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.bottom} y2={PLOT.bottom} className="stroke-white/15" />
        <line x1={trX} x2={trX} y1={PLOT.top - 4} y2={PLOT.bottom} className="stroke-pink" strokeDasharray="3 3" />
        <text x={trX + 5} y={PLOT.bottom - 5} className="fill-blush font-mono" fontSize="10">
          TR
        </text>
        {CURVES.map((c) => (
          <path
            key={c.id}
            d={c.d}
            fill="none"
            stroke={c.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={c.dash}
          />
        ))}
        {CURVES.map((c) => (
          <circle key={c.id} cx={trX} cy={py(c.atTr)} r={3.5} fill={c.color} className="stroke-ink" strokeWidth={1.5} />
        ))}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {CURVES.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5">
            <svg width="18" height="6" viewBox="0 0 18 6" aria-hidden focusable="false">
              <line
                x1="1"
                x2="17"
                y1="3"
                y2="3"
                stroke={c.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={c.dash}
              />
            </svg>
            <span className="text-muted">{c.label}</span>
            <span className="num text-fg">{Math.round(c.atTr * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">Mz recovered at TR. Representative T1 values at {FIELD} T.</p>
    </div>
  );
}

/* ─────────────── (e) Spaced-repetition flashcards ─────────────── */

const GRADES = ["Again", "Hard", "Good", "Easy"] as const;

export function FlashcardVignette() {
  return (
    <div
      role="img"
      aria-label="Example flashcard. Front: short TR and short TE in a spin-echo sequence produce which weighting? Back: T1 weighting, fat bright and fluid dark. Grade buttons Again, Hard, Good and Easy."
      className="relative px-3 pt-4 pb-1"
    >
      <div
        className={cn(
          "absolute inset-x-6 top-1 bottom-6 rounded-xl border border-white/8 bg-card-2/60 -rotate-[5deg]",
          "transition-transform duration-250 ease-out-expo motion-safe:group-hover:-rotate-[8deg]",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-5 top-2 bottom-4 rounded-xl border border-white/10 bg-card-2/80 rotate-[3deg]",
          "transition-transform duration-250 ease-out-expo motion-safe:group-hover:rotate-[6deg]",
        )}
      />
      <div className="relative rounded-xl border border-white/12 bg-card-2 p-4 shadow-panel">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">MRI · Weighting</span>
          <span className="num text-[0.6875rem] text-muted">Due today</span>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-fg">
          Short TR and short TE in a spin-echo sequence produce which weighting?
        </p>
        <div className="my-3 h-px bg-white/8" />
        <p className="text-sm font-semibold text-blush">T1 weighting</p>
        <p className="mt-0.5 text-xs text-muted">Fat bright, fluid dark.</p>
        <ul className="mt-3.5 grid grid-cols-4 gap-1.5">
          {GRADES.map((g) => (
            <li
              key={g}
              className={cn(
                "rounded-md border py-1.5 text-center text-[0.6875rem] font-medium",
                g === "Good" ? "border-pink/50 bg-pink/15 text-fg" : "border-white/10 text-muted",
              )}
            >
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────── (f) Web and mobile ─────────────── */

function SkeletonLine({ className }: { className?: string }) {
  return <span className={cn("block h-1.5 rounded-full bg-white/10", className)} />;
}

export function DevicesVignette() {
  return (
    <div
      role="img"
      aria-label="Illustration of Borepix in a desktop browser and on a phone"
      className="flex items-end justify-center gap-3 sm:gap-4"
    >
      {/* Browser window */}
      <div className="w-full max-w-[16rem] overflow-hidden rounded-lg border border-white/12 bg-ink-2">
        <div className="flex items-center gap-1.5 border-b border-white/8 px-2.5 py-2">
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="ml-2 h-3 flex-1 rounded-full bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-[2.25rem_1fr] gap-2.5 p-2.5">
          <div className="grid content-start gap-1.5">
            <SkeletonLine className="bg-pink/50" />
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </div>
          <div className="grid gap-2">
            <SkeletonLine className="w-2/3 bg-white/20" />
            <div className="flex h-12 items-end gap-1 rounded-md border border-white/8 p-1.5">
              <span className="h-[70%] flex-1 rounded-sm bg-silver/40" />
              <span className="h-[55%] flex-1 rounded-sm bg-silver/40" />
              <span className="h-[85%] flex-1 rounded-sm bg-silver/40" />
              <span className="h-[40%] flex-1 rounded-sm bg-pink/70" />
            </div>
            <SkeletonLine className="w-5/6" />
            <SkeletonLine className="w-1/2" />
          </div>
        </div>
      </div>

      {/* Phone outline */}
      <div className="w-[4.75rem] shrink-0 rounded-[1.05rem] border border-white/15 bg-ink-2 p-1.5">
        <div className="mx-auto mb-1.5 h-1 w-6 rounded-full bg-white/15" />
        <div className="grid gap-1.5 rounded-[0.7rem] border border-white/8 p-1.5 pb-3">
          <SkeletonLine className="w-3/4 bg-white/20" />
          <span className="block h-7 rounded-md border border-pink/40 bg-pink/10" />
          <SkeletonLine />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-2/3" />
          <span className="mt-1 block h-3 rounded-md bg-pink-strong/70" />
        </div>
      </div>
    </div>
  );
}
