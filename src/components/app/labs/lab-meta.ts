import type { LabId } from "@/lib/content/types";

/** Display names for lab badges and tables of contents. Safe to import from Server Components. */
export const LAB_META: Record<LabId, { name: string; short: string }> = {
  larmor: { name: "Larmor frequency lab", short: "Larmor lab" },
  relaxation: { name: "T1 and T2 relaxation lab", short: "Relaxation lab" },
  kspace: { name: "k-space lab", short: "k-space lab" },
  sar: { name: "SAR lab", short: "SAR lab" },
};

export function isLabId(value: unknown): value is LabId {
  return typeof value === "string" && value in LAB_META;
}
