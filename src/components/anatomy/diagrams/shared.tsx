import { cn } from "@/lib/cn";

/**
 * Shared contract for the three anatomy diagrams. Each is a pure 800×600 SVG drawn in silver line art
 * (stroke currentColor on text-silver) with the subject of every hotspot picked out in pink. When a
 * hotspot is active, the other subjects dim so the chosen structure reads first.
 */
export type DiagramProps = {
  /** Id of the active hotspot, or null when none is selected. */
  active?: string | null;
  className?: string;
};

/** Class for a hotspot subject group: pink, dimmed while a different subject is active. */
export function subjectClass(id: string, active: string | null | undefined): string {
  return cn(
    "text-pink transition-opacity duration-250 ease-out",
    active && active !== id ? "opacity-45" : "opacity-100",
  );
}

/** Filter url for the active subject; undefined for every other group. */
export function subjectFilter(id: string, active: string | null | undefined, glowId: string): string | undefined {
  return active === id ? `url(#${glowId})` : undefined;
}

/** Soft pink glow used on the active subject. Put it inside <defs>. */
export function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

export type Point = readonly [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A smooth curve through every point (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: readonly Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${r1(points[0][0])} ${r1(points[0][1])}`;
  let d = `M ${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${r1(c1x)} ${r1(c1y)}, ${r1(c2x)} ${r1(c2y)}, ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}
