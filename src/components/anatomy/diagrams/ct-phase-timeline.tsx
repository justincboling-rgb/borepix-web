import { useId } from "react";
import { GlowFilter, smoothPath, subjectClass, subjectFilter, type DiagramProps, type Point } from "./shared";
import { cn } from "@/lib/cn";

/**
 * Contrast-enhancement curves after a single intravenous bolus: aortic attenuation in pink, hepatic
 * parenchyma in silver, on a 0–300 second axis. The shaded windows are the phases a protocol can be
 * timed to; the dashed line is the bolus-tracking threshold and the dotted upright marks the trigger.
 *
 * The time axis is linear from 0 to 120 s across the left 70% of the plot and linear from 120 to 300 s
 * across the rest, with a break mark on the axis. Every decision a technologist makes happens in the
 * first two minutes, so that stretch gets the room; the delayed phase still appears in full.
 *
 * Phase windows are derived from the trigger: early arterial = trigger + 5–10 s, late arterial =
 * trigger + 15–20 s. The CT workbook key points, its hotspot notes and the CT quiz quote the same
 * numbers; change them together.
 */

const X0 = 72;
const X1 = 772;
const Y0 = 520;
const Y1 = 78;
const T_BREAK = 120;
const T_MAX = 300;
const HU_MAX = 400;
/** Where the compressed segment of the time axis begins: 70% of the plot width. */
const BREAK_X = X0 + 0.7 * (X1 - X0);

const tx = (t: number) =>
  t <= T_BREAK
    ? X0 + (t / T_BREAK) * (BREAK_X - X0)
    : BREAK_X + ((t - T_BREAK) / (T_MAX - T_BREAK)) * (X1 - BREAK_X);
const hy = (hu: number) => Y0 - (hu / HU_MAX) * (Y0 - Y1);
const r1 = (n: number) => Math.round(n * 10) / 10;

const THRESHOLD_HU = 100;
/** Seconds into the injection when the aortic ROI crosses the threshold, with normal cardiac output. */
const TRIGGER_T = 15;

/** Aortic attenuation (t seconds, HU) for 100 mL at 4 mL/s with a saline chaser. Crosses 100 HU at the trigger. */
const AORTA: Point[] = [
  [0, 40], [10, 42], [13, 60], [TRIGGER_T, THRESHOLD_HU], [18, 185], [22, 275], [25, 318], [28, 335], [32, 318],
  [36, 282], [42, 228], [50, 180], [60, 150], [70, 130], [85, 112], [100, 102], [120, 96], [150, 90], [180, 86],
  [240, 80], [300, 74],
];

/** Hepatic parenchymal attenuation for the same injection. Peaks inside the portal venous window. */
const LIVER: Point[] = [
  [0, 56], [15, 56], [25, 60], [35, 68], [45, 84], [55, 104], [62, 114], [68, 118], [75, 116], [85, 112],
  [100, 108], [120, 102], [150, 96], [180, 92], [240, 86], [300, 82],
];

const toPlot = (points: Point[]): Point[] => points.map(([t, hu]) => [r1(tx(t)), r1(hy(hu))]);

const AORTA_PATH = smoothPath(toPlot(AORTA));
const LIVER_PATH = smoothPath(toPlot(LIVER));

const HU_TICKS = [0, 100, 200, 300, 400];
const TIME_TICKS = [0, 20, 40, 60, 80, 100, 120, 180, 240, 300];

/** Baseline of each label row above the plot. Row 1 labels carry a leader tick down to the plot. */
const LABEL_Y: Record<1 | 2, number> = { 1: 54, 2: 70 };

type Window = {
  id: string;
  /** Seconds after the start of injection. */
  from: number;
  to: number;
  label: string;
  row: 1 | 2;
  /** Centre the label on the window (default) or start it at the window's left edge. */
  align?: "center" | "start";
};

const WINDOWS: Window[] = [
  { id: "early-arterial", from: TRIGGER_T + 5, to: TRIGGER_T + 10, label: "Early arterial", row: 1 },
  { id: "late-arterial", from: TRIGGER_T + 15, to: TRIGGER_T + 20, label: "Late arterial", row: 2, align: "start" },
  { id: "portal", from: 60, to: 70, label: "Portal venous", row: 1 },
  { id: "delayed", from: 180, to: 300, label: "Delayed", row: 1 },
];

const DESCRIPTION =
  "Contrast enhancement curves over 300 seconds with early arterial, late arterial, portal venous and delayed phase windows and the bolus-tracking threshold";

export function CtPhaseTimeline({ active = null, className }: DiagramProps) {
  const uid = useId();
  const glowId = `${uid}-glow`;
  const titleId = `${uid}-title`;
  const subject = (id: string) => ({ className: subjectClass(id, active), filter: subjectFilter(id, active, glowId) });

  return (
    <svg
      viewBox="0 0 800 600"
      role="img"
      aria-label={DESCRIPTION}
      aria-labelledby={titleId}
      className={cn("text-silver", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id={titleId}>{DESCRIPTION}</title>
      <defs>
        <GlowFilter id={glowId} />
      </defs>

      {/* Gridlines */}
      <g strokeWidth="1" strokeDasharray="2 6" opacity="0.22">
        {HU_TICKS.slice(1).map((hu) => (
          <line key={hu} x1={X0} y1={r1(hy(hu))} x2={X1} y2={r1(hy(hu))} />
        ))}
      </g>

      {/* Axes. The time axis is interrupted by a break mark where its scale changes. */}
      <g strokeWidth="1.5">
        <line x1={X0} y1={Y1} x2={X0} y2={Y0} />
        <line x1={X0} y1={Y0} x2={r1(BREAK_X + 10)} y2={Y0} />
        <line x1={r1(BREAK_X + 22)} y1={Y0} x2={X1} y2={Y0} />
        <line x1={r1(BREAK_X + 9)} y1={Y0 + 6} x2={r1(BREAK_X + 17)} y2={Y0 - 6} />
        <line x1={r1(BREAK_X + 15)} y1={Y0 + 6} x2={r1(BREAK_X + 23)} y2={Y0 - 6} />
      </g>
      <g className="font-mono" fill="currentColor" stroke="none" fontSize="12" opacity="0.85">
        {HU_TICKS.map((hu) => (
          <text key={hu} x={X0 - 10} y={r1(hy(hu)) + 4} textAnchor="end">
            {hu}
          </text>
        ))}
        {TIME_TICKS.map((t) => (
          <text key={t} x={r1(tx(t))} y={Y0 + 22} textAnchor="middle">
            {t}
          </text>
        ))}
        <text x={X0 - 10} y={Y1 - 14} textAnchor="end">
          HU
        </text>
        <text x={(X0 + X1) / 2} y="574" textAnchor="middle" fontSize="13">
          Seconds after the start of injection · axis compressed after 120 s
        </text>
      </g>
      <g strokeWidth="1.5" opacity="0.85">
        {TIME_TICKS.map((t) => (
          <line key={t} x1={r1(tx(t))} y1={Y0} x2={r1(tx(t))} y2={Y0 + 6} />
        ))}
      </g>

      {/* Phase windows, each labelled above the plot with a leader tick down to its band. */}
      {WINDOWS.map((w) => {
        const x = r1(tx(w.from));
        const width = r1(tx(w.to) - tx(w.from));
        const cx = r1(x + width / 2);
        const labelY = LABEL_Y[w.row];
        return (
          <g key={w.id} {...subject(w.id)}>
            <rect x={x} y={Y1} width={width} height={Y0 - Y1} fill="currentColor" fillOpacity="0.12" strokeWidth="1" strokeOpacity="0.5" />
            <line x1={cx} y1={labelY + 5} x2={cx} y2={Y1} strokeWidth="1" strokeOpacity="0.6" />
            <text
              x={w.align === "start" ? x : cx}
              y={labelY}
              textAnchor={w.align === "start" ? "start" : "middle"}
              className="font-mono"
              fill="currentColor"
              stroke="none"
              fontSize="13"
            >
              {w.label}
            </text>
            {w.id === "portal" ? <circle cx={r1(tx(68))} cy={r1(hy(118))} r="5" fill="currentColor" stroke="none" /> : null}
          </g>
        );
      })}

      {/* Injection: contrast bolus then the saline chaser */}
      <g {...subject("injection")}>
        <rect x={X0} y="26" width={r1(tx(25) - X0)} height="10" rx="2" fill="currentColor" fillOpacity="0.6" strokeWidth="1" />
        <rect x={r1(tx(25))} y="26" width={r1(tx(35) - tx(25))} height="10" rx="2" strokeWidth="1" strokeDasharray="3 3" />
        <text x={r1(tx(35) + 10)} y="35" className="font-mono" fill="currentColor" stroke="none" fontSize="12">
          Contrast 100 mL at 4 mL/s, then saline
        </text>
      </g>

      {/* Unenhanced baselines */}
      <g {...subject("baseline")} strokeWidth="2.5">
        <line x1={X0} y1={r1(hy(40))} x2={r1(tx(12))} y2={r1(hy(40))} />
        <line x1={X0} y1={r1(hy(56))} x2={r1(tx(18))} y2={r1(hy(56))} />
      </g>

      {/* Bolus-tracking threshold */}
      <g {...subject("threshold")}>
        <line x1={X0} y1={r1(hy(THRESHOLD_HU))} x2={X1} y2={r1(hy(THRESHOLD_HU))} strokeWidth="1.5" strokeDasharray="6 6" />
        <text x={X1 - 4} y={r1(hy(THRESHOLD_HU)) - 12} textAnchor="end" className="font-mono" fill="currentColor" stroke="none" fontSize="12">
          Threshold {THRESHOLD_HU} HU
        </text>
      </g>

      {/* Trigger: the aortic ROI crosses the threshold */}
      <g {...subject("trigger")}>
        <line x1={r1(tx(TRIGGER_T))} y1={Y0} x2={r1(tx(TRIGGER_T))} y2={r1(hy(THRESHOLD_HU))} strokeWidth="1.5" strokeDasharray="1 5" />
        <circle cx={r1(tx(TRIGGER_T))} cy={r1(hy(THRESHOLD_HU))} r="5" fill="currentColor" stroke="none" />
      </g>

      {/* Nephrographic phase bracket on the time axis */}
      <g {...subject("nephro")}>
        <path d={`M ${r1(tx(90))} 498 L ${r1(tx(90))} 514 L ${r1(tx(120))} 514 L ${r1(tx(120))} 498`} strokeWidth="1.5" />
        <text x={r1(tx(105))} y="490" textAnchor="middle" className="font-mono" fill="currentColor" stroke="none" fontSize="12">
          Nephrographic 90–120 s
        </text>
      </g>

      {/* Enhancement curves */}
      <path d={LIVER_PATH} strokeWidth="3" />
      <text x={r1(tx(90))} y="440" className="font-mono" fill="currentColor" stroke="none" fontSize="13" opacity="0.9">
        Liver parenchyma
      </text>
      <g className="text-pink">
        <path d={AORTA_PATH} strokeWidth="3" />
        <text x={r1(tx(30) + 6)} y={r1(hy(335) - 8)} className="font-mono" fill="currentColor" stroke="none" fontSize="13">
          Aorta
        </text>
      </g>
    </svg>
  );
}
