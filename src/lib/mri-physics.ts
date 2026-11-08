/**
 * Small, dependency-free MRI physics helpers for the interactive labs.
 * Models are the simplified textbook forms used in registry prep; they are teaching tools,
 * not scanner simulations.
 */

/** Gyromagnetic ratio of hydrogen (γ/2π) in MHz per tesla. */
export const GAMMA_BAR_MHZ_PER_T = 42.577;

/** Larmor (precessional) frequency of hydrogen in MHz for a field strength in tesla. */
export function larmorMHz(b0Tesla: number): number {
  return GAMMA_BAR_MHZ_PER_T * b0Tesla;
}

/** Fraction of longitudinal magnetization recovered t ms after a 90° pulse: 1 − e^(−t/T1). */
export function t1Recovery(tMs: number, t1Ms: number): number {
  return 1 - Math.exp(-tMs / t1Ms);
}

/** Fraction of transverse magnetization remaining t ms after a 90° pulse: e^(−t/T2). */
export function t2Decay(tMs: number, t2Ms: number): number {
  return Math.exp(-tMs / t2Ms);
}

/**
 * Relative spin-echo signal: S = PD · (1 − e^(−TR/T1)) · e^(−TE/T2).
 * Ignores the TE/2 refocusing term and flip-angle effects; adequate for comparing tissue contrast.
 */
export function spinEchoSignal(trMs: number, teMs: number, t: Pick<Tissue, "pd" | "t1" | "t2">): number {
  return t.pd * t1Recovery(trMs, t.t1) * t2Decay(teMs, t.t2);
}

export type FieldStrength = 1.5 | 3;

export type Tissue = {
  id: "fat" | "white-matter" | "gray-matter" | "muscle" | "csf";
  label: string;
  /** Relative proton density, 0–1. */
  pd: number;
  /** T1 in ms. */
  t1: number;
  /** T2 in ms. */
  t2: number;
  /** Swatch color for charts (on dark backgrounds). */
  color: string;
};

/**
 * Representative relaxation times. Brain and muscle values follow Stanisz et al., Magn Reson Med 2005
 * (1.5 T / 3 T); fat and CSF use commonly taught approximations. Published values vary by method,
 * so the UI should label these as representative.
 */
export const TISSUES: Record<FieldStrength, Tissue[]> = {
  1.5: [
    { id: "fat", label: "Fat", pd: 0.9, t1: 260, t2: 80, color: "#FBBF24" },
    { id: "white-matter", label: "White matter", pd: 0.7, t1: 884, t2: 72, color: "#C9CDD6" },
    { id: "gray-matter", label: "Gray matter", pd: 0.8, t1: 1124, t2: 95, color: "#A69DB0" },
    { id: "muscle", label: "Muscle", pd: 0.75, t1: 1008, t2: 44, color: "#FF66C4" },
    { id: "csf", label: "CSF", pd: 1, t1: 4000, t2: 2000, color: "#B79CFF" },
  ],
  3: [
    { id: "fat", label: "Fat", pd: 0.9, t1: 370, t2: 70, color: "#FBBF24" },
    { id: "white-matter", label: "White matter", pd: 0.7, t1: 1084, t2: 69, color: "#C9CDD6" },
    { id: "gray-matter", label: "Gray matter", pd: 0.8, t1: 1820, t2: 99, color: "#A69DB0" },
    { id: "muscle", label: "Muscle", pd: 0.75, t1: 1412, t2: 50, color: "#FF66C4" },
    { id: "csf", label: "CSF", pd: 1, t1: 4300, t2: 2000, color: "#B79CFF" },
  ],
};

export type Weighting = "T1-weighted" | "T2-weighted" | "PD-weighted" | "Mixed weighting";

/**
 * Classic spin-echo weighting rules of thumb.
 * Short TR / short TE = T1W; long TR / long TE = T2W; long TR / short TE = PDW.
 * Thresholds are the usual teaching ranges and scale up a little at 3 T because T1 lengthens.
 */
export function classifyWeighting(trMs: number, teMs: number, field: FieldStrength = 1.5): Weighting {
  const shortTR = field === 3 ? 900 : 800;
  const longTR = 2000;
  const shortTE = 30;
  const longTE = 80;
  if (trMs <= shortTR && teMs <= shortTE) return "T1-weighted";
  if (trMs >= longTR && teMs >= longTE) return "T2-weighted";
  if (trMs >= longTR && teMs <= shortTE) return "PD-weighted";
  return "Mixed weighting";
}

/**
 * Relative SAR versus a reference of 1.5 T, 90° flip, 1 pulse per unit time.
 * SAR scales with B0², flip angle² and the number of RF pulses delivered per unit time.
 */
export function relativeSar(b0Tesla: number, flipDeg: number, pulsesPerUnitTime: number = 1): number {
  return (b0Tesla / 1.5) ** 2 * (flipDeg / 90) ** 2 * pulsesPerUnitTime;
}

/** Spatial resolution: pixel size (mm) = FOV (mm) / matrix. */
export function pixelSizeMm(fovMm: number, matrix: number): number {
  return fovMm / matrix;
}

/** Voxel volume in mm³. */
export function voxelVolumeMm3(fovMm: number, matrix: number, sliceMm: number): number {
  const p = pixelSizeMm(fovMm, matrix);
  return p * p * sliceMm;
}

/** Spin-echo-style 2D scan time in seconds: TR × phase-encoding steps × NEX (signal averages). */
export function scanTimeSec(trMs: number, phaseSteps: number, nex: number): number {
  return (trMs * phaseSteps * nex) / 1000;
}
