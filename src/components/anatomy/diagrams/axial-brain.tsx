import { useId, type SVGProps } from "react";
import { GlowFilter, subjectClass, subjectFilter, type DiagramProps } from "./shared";
import { cn } from "@/lib/cn";

/**
 * Schematic axial T2 slice at the level of the basal ganglia, displayed in radiological convention
 * (anterior at the top, the patient's right on the viewer's left). Silver line art for skull, cortex and
 * white matter; pink for the structures the workbook hotspots name. Deep structures are drawn once for
 * the viewer's right hemisphere and mirrored across the midline.
 */

const CX = 400;
const CY = 300;
const BRAIN_RX = 228;
const BRAIN_RY = 252;

/** x → 800 - x: mirrors the right-hemisphere drawing onto the left. */
const MIRROR = "matrix(-1 0 0 1 800 0)";

type Sulcus = { d: string };

/**
 * Short sulci along the cortical surface, pointing inward with a small curl. Angles near the midline
 * (falx) and the lateral surface (sylvian fissure) are left clear. Computed once at module scope.
 */
const SULCI: Sulcus[] = Array.from({ length: 30 }, (_, i) => {
  const theta = (i / 30) * Math.PI * 2 + 0.07;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  if (Math.abs(cos) < 0.1 || Math.abs(sin) < 0.16) return null;
  const px = CX + BRAIN_RX * cos;
  const py = CY + BRAIN_RY * sin;
  // Inward normal of the ellipse at this point.
  let nx = -cos / BRAIN_RX;
  let ny = -sin / BRAIN_RY;
  const len = Math.hypot(nx, ny);
  nx /= len;
  ny /= len;
  const depth = 18 + ((i * 7) % 3) * 6;
  const curl = i % 2 === 0 ? 7 : -7;
  const ex = px + nx * depth;
  const ey = py + ny * depth;
  const mx = px + nx * (depth * 0.55) - ny * curl;
  const my = py + ny * (depth * 0.55) + nx * curl;
  const r = (n: number) => Math.round(n * 10) / 10;
  return { d: `M ${r(px)} ${r(py)} Q ${r(mx)} ${r(my)} ${r(ex)} ${r(ey)}` };
}).filter((s): s is Sulcus => s !== null);

/** A path drawn for the right hemisphere and mirrored for the left. */
function Mirrored({ d, ...rest }: { d: string } & SVGProps<SVGPathElement>) {
  return (
    <>
      <path d={d} {...rest} />
      <path d={d} transform={MIRROR} {...rest} />
    </>
  );
}

export function AxialBrain({ active = null, className }: DiagramProps) {
  const uid = useId();
  const glowId = `${uid}-glow`;
  const titleId = `${uid}-title`;
  const subject = (id: string) => ({ className: subjectClass(id, active), filter: subjectFilter(id, active, glowId) });

  return (
    <svg
      viewBox="0 0 800 600"
      role="img"
      aria-label="Axial T2 brain slice at the level of the basal ganglia"
      aria-labelledby={titleId}
      className={cn("text-silver", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id={titleId}>Axial T2 brain slice at the level of the basal ganglia</title>
      <defs>
        <GlowFilter id={glowId} />
      </defs>

      {/* Orientation */}
      <g className="font-mono" fill="currentColor" stroke="none" fontSize="14" opacity="0.7">
        <text x="400" y="17" textAnchor="middle">
          A
        </text>
        <text x="400" y="596" textAnchor="middle">
          P
        </text>
        <text x="118" y="306" textAnchor="middle">
          R
        </text>
        <text x="682" y="306" textAnchor="middle">
          L
        </text>
      </g>

      {/* Skull: outer and inner table with the diploë filled between them */}
      <path
        d="M 146 300 A 254 278 0 1 0 654 300 A 254 278 0 1 0 146 300 Z M 158 300 A 242 266 0 1 1 642 300 A 242 266 0 1 1 158 300 Z"
        fill="currentColor"
        fillOpacity="0.07"
        fillRule="evenodd"
        strokeWidth="1.5"
      />
      <ellipse cx="400" cy="300" rx="242" ry="266" strokeWidth="1" opacity="0.6" />

      {/* Brain surface, gray-white boundary and sulci */}
      <ellipse cx={CX} cy={CY} rx={BRAIN_RX} ry={BRAIN_RY} strokeWidth="1.75" />
      <ellipse cx={CX} cy={CY} rx={BRAIN_RX - 24} ry={BRAIN_RY - 24} strokeWidth="1" strokeDasharray="3 7" opacity="0.35" />
      <g strokeWidth="1.25" opacity="0.8">
        {SULCI.map((s) => (
          <path key={s.d} d={s.d} />
        ))}
      </g>

      {/* Midline: septum pellucidum and the pineal gland */}
      <line x1="400" y1="190" x2="400" y2="254" strokeWidth="2" />
      <circle cx="400" cy="362" r="5" strokeWidth="1.5" />

      {/* External capsule and claustrum, lateral to the putamen */}
      <g strokeWidth="1" opacity="0.75">
        <Mirrored d="M 500 232 C 536 240, 556 296, 546 346" />
        <Mirrored d="M 508 232 C 548 242, 566 298, 554 350" strokeDasharray="2 4" />
      </g>

      {/* Posterior horns of the lateral ventricles and the splenium */}
      <g strokeWidth="1.5">
        <ellipse cx="444" cy="398" rx="7" ry="20" transform="rotate(30 444 398)" fill="currentColor" fillOpacity="0.12" />
        <ellipse cx="356" cy="398" rx="7" ry="20" transform="rotate(-30 356 398)" fill="currentColor" fillOpacity="0.12" />
        <path d="M 338 418 C 350 460, 450 460, 462 418 L 448 412 C 440 440, 360 440, 352 412 Z" fill="currentColor" fillOpacity="0.08" />
      </g>

      {/* ── Hotspot subjects ────────────────────────────────────────────── */}

      {/* Falx cerebri and interhemispheric fissure */}
      <g {...subject("falx")} strokeWidth="2.25">
        <path d="M 400 50 L 400 160" />
        <path d="M 400 462 L 400 550" />
        <path d="M 392 60 C 395 90, 395 120, 393 150" strokeWidth="1" opacity="0.6" />
        <path d="M 408 60 C 405 90, 405 120, 407 150" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Genu of the corpus callosum */}
      <g {...subject("cc-genu")} strokeWidth="1.75">
        <path d="M 334 198 C 346 156, 454 156, 466 198 L 452 204 C 442 178, 358 178, 348 204 Z" fill="currentColor" fillOpacity="0.14" />
      </g>

      {/* Frontal horns of the lateral ventricles */}
      <g {...subject("frontal-horn")} strokeWidth="1.75">
        <Mirrored
          d="M 404 192 C 418 184, 440 190, 446 206 C 438 222, 428 238, 414 250 C 406 246, 403 226, 404 192 Z"
          fill="currentColor"
          fillOpacity="0.22"
        />
      </g>

      {/* Head of the caudate nucleus */}
      <g {...subject("caudate")} strokeWidth="1.75">
        <Mirrored
          d="M 434 186 C 456 180, 474 196, 472 218 C 470 238, 460 252, 446 260 C 450 242, 450 224, 446 206 C 442 196, 438 190, 434 186 Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
      </g>

      {/* Internal capsule: anterior limb, genu, posterior limb */}
      <g {...subject("internal-capsule")} strokeWidth="1.75">
        <Mirrored d="M 480 222 L 494 228 L 474 288 L 506 370 L 492 378 L 458 292 Z" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* Globus pallidus: the medial wedge of the lentiform nucleus */}
      <g {...subject("globus-pallidus")} strokeWidth="1.75">
        <Mirrored
          d="M 494 228 L 474 288 L 506 370 C 506 344, 504 316, 506 290 C 506 268, 504 246, 494 228 Z"
          fill="currentColor"
          fillOpacity="0.1"
        />
      </g>

      {/* Putamen: the lateral part of the lentiform nucleus */}
      <g {...subject("putamen")} strokeWidth="1.75">
        <Mirrored
          d="M 494 228 C 526 238, 548 290, 540 338 C 534 362, 520 372, 506 370 C 506 344, 504 316, 506 290 C 506 268, 504 246, 494 228 Z"
          fill="currentColor"
          fillOpacity="0.14"
        />
      </g>

      {/* Thalamus */}
      <g {...subject("thalamus")} strokeWidth="1.75">
        <ellipse cx="436" cy="332" rx="28" ry="42" transform="rotate(-12 436 332)" fill="currentColor" fillOpacity="0.12" />
        <ellipse cx="364" cy="332" rx="28" ry="42" transform="rotate(12 364 332)" fill="currentColor" fillOpacity="0.12" />
      </g>

      {/* Third ventricle */}
      <g {...subject("third-ventricle")} strokeWidth="1.75">
        <rect x="395" y="286" width="10" height="60" rx="5" fill="currentColor" fillOpacity="0.28" />
      </g>

      {/* Sylvian fissure and insular cortex */}
      <g {...subject("sylvian")} strokeWidth="1.75">
        <Mirrored d="M 626 282 C 610 292, 592 298, 576 300 C 592 302, 610 308, 626 318" />
        <Mirrored d="M 614 288 L 620 270" strokeWidth="1.25" />
        <Mirrored d="M 614 312 L 620 330" strokeWidth="1.25" />
        <Mirrored d="M 512 226 C 558 236, 578 300, 562 356" strokeWidth="2.5" opacity="0.9" />
      </g>
    </svg>
  );
}
