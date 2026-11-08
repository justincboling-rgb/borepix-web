/**
 * k-space teaching math: a synthetic head phantom, a radix-2 FFT and the sampling masks used by the k-space lab.
 * Pure functions, no DOM. Everything works on N × N grids stored row-major in Float64Arrays.
 */

export const N = 64;

/* ───────────────────────── FFT ───────────────────────── */

/**
 * In-place iterative radix-2 Cooley–Tukey FFT. `re` and `im` must have the same power-of-two length.
 * The inverse transform is scaled by 1/n.
 */
export function fft1d(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length;
  if (n & (n - 1)) throw new Error("FFT length must be a power of two");

  // Bit-reversal permutation.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }

  // Butterflies.
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let start = 0; start < n; start += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < half; k++) {
        const a = start + k;
        const b = a + half;
        const br = re[b] * cr - im[b] * ci;
        const bi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - br;
        im[b] = im[a] - bi;
        re[a] += br;
        im[a] += bi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

/** 2D FFT of an n × n grid (rows, then columns), in place. */
export function fft2d(re: Float64Array, im: Float64Array, n: number, inverse = false): void {
  const rRe = new Float64Array(n);
  const rIm = new Float64Array(n);
  for (let y = 0; y < n; y++) {
    const o = y * n;
    for (let x = 0; x < n; x++) {
      rRe[x] = re[o + x];
      rIm[x] = im[o + x];
    }
    fft1d(rRe, rIm, inverse);
    for (let x = 0; x < n; x++) {
      re[o + x] = rRe[x];
      im[o + x] = rIm[x];
    }
  }
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      rRe[y] = re[y * n + x];
      rIm[y] = im[y * n + x];
    }
    fft1d(rRe, rIm, inverse);
    for (let y = 0; y < n; y++) {
      re[y * n + x] = rRe[y];
      im[y * n + x] = rIm[y];
    }
  }
}

/** Swap quadrants so the zero frequency sits at the center (its own inverse for even n). */
export function fftShift(src: Float64Array, n: number): Float64Array {
  const out = new Float64Array(src.length);
  const h = n >> 1;
  for (let y = 0; y < n; y++) {
    const sy = (y + h) % n;
    for (let x = 0; x < n; x++) {
      out[y * n + x] = src[sy * n + ((x + h) % n)];
    }
  }
  return out;
}

/* ───────────────────────── Phantom ───────────────────────── */

type Ellipse = { x: number; y: number; a: number; b: number; deg: number; value: number };

/**
 * A simple head phantom in the spirit of Shepp–Logan, with contrast exaggerated so the inner
 * structures are visible at 64 × 64. Coordinates span −1…1; intensities add.
 */
const ELLIPSES: Ellipse[] = [
  { x: 0, y: 0, a: 0.69, b: 0.92, deg: 0, value: 1 }, // skull
  { x: 0, y: -0.0184, a: 0.6624, b: 0.874, deg: 0, value: -0.72 }, // brain
  { x: 0.22, y: 0, a: 0.11, b: 0.31, deg: -18, value: 0.48 }, // right ventricle
  { x: -0.22, y: 0, a: 0.16, b: 0.41, deg: 18, value: 0.48 }, // left ventricle
  { x: 0, y: 0.35, a: 0.21, b: 0.25, deg: 0, value: 0.22 },
  { x: 0, y: 0.1, a: 0.046, b: 0.046, deg: 0, value: 0.35 },
  { x: 0, y: -0.1, a: 0.046, b: 0.046, deg: 0, value: 0.35 },
  { x: -0.08, y: -0.605, a: 0.046, b: 0.023, deg: 0, value: 0.45 },
  { x: 0, y: -0.605, a: 0.023, b: 0.023, deg: 0, value: 0.45 },
  { x: 0.06, y: -0.605, a: 0.023, b: 0.046, deg: 0, value: 0.45 },
];

/** Rasterize the phantom with 3 × 3 supersampling for smooth edges. Values roughly 0…1. */
export function makePhantom(n: number = N): Float64Array {
  const img = new Float64Array(n * n);
  const ss = 3;
  const prepared = ELLIPSES.map((e) => {
    const r = (e.deg * Math.PI) / 180;
    return { ...e, cos: Math.cos(r), sin: Math.sin(r) };
  });
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      let sum = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = ((col + (sx + 0.5) / ss) / n) * 2 - 1;
          const py = 1 - ((row + (sy + 0.5) / ss) / n) * 2;
          for (const e of prepared) {
            const dx = px - e.x;
            const dy = py - e.y;
            const u = dx * e.cos + dy * e.sin;
            const v = -dx * e.sin + dy * e.cos;
            if ((u * u) / (e.a * e.a) + (v * v) / (e.b * e.b) <= 1) sum += e.value;
          }
        }
      }
      img[row * n + col] = sum / (ss * ss);
    }
  }
  return img;
}

/* ───────────────────────── Sampling ───────────────────────── */

export type KMode = "full" | "center" | "periphery" | "alternate";

/** Half-width of the central block: 8 of 64 lines each side, so the block is 16 × 16 (25% of each axis). */
export const CENTER_HALF = N / 8;

/** Whether a sample at (row, col) of the CENTERED k-space grid is kept. Rows are phase-encoding lines (ky). */
export function keepSample(mode: KMode, row: number, col: number, n: number = N): boolean {
  const c = n >> 1;
  const inCenter = row >= c - CENTER_HALF && row < c + CENTER_HALF && col >= c - CENTER_HALF && col < c + CENTER_HALF;
  switch (mode) {
    case "full":
      return true;
    case "center":
      return inCenter;
    case "periphery":
      return !inCenter;
    case "alternate":
      return (row - c) % 2 === 0;
  }
}

export type KSpaceBase = {
  /** Centered k-space, real and imaginary parts. */
  kRe: Float64Array;
  kIm: Float64Array;
  /** log(1 + |K|) for display, centered. */
  logMag: Float64Array;
  logMax: number;
  totalEnergy: number;
};

export function makeBase(n: number = N): KSpaceBase {
  const re = makePhantom(n);
  const im = new Float64Array(n * n);
  fft2d(re, im, n);
  const kRe = fftShift(re, n);
  const kIm = fftShift(im, n);
  const logMag = new Float64Array(n * n);
  let logMax = 0;
  let totalEnergy = 0;
  for (let i = 0; i < n * n; i++) {
    const m2 = kRe[i] * kRe[i] + kIm[i] * kIm[i];
    totalEnergy += m2;
    const l = Math.log1p(Math.sqrt(m2));
    logMag[i] = l;
    if (l > logMax) logMax = l;
  }
  return { kRe, kIm, logMag, logMax, totalEnergy };
}

export type KSpaceResult = {
  /** RGBA pixels of the sampled k-space (log magnitude; removed samples tinted). */
  kPixels: Uint8ClampedArray<ArrayBuffer>;
  /** RGBA pixels of the magnitude reconstruction, auto-scaled to its own peak. */
  imgPixels: Uint8ClampedArray<ArrayBuffer>;
  samplesKept: number;
  energyKept: number;
  /** Peak of this reconstruction relative to the peak of the full reconstruction. */
  peakRelative: number;
};

export function reconstruct(base: KSpaceBase, mode: KMode, fullPeak: number | null, n: number = N): KSpaceResult {
  const mRe = new Float64Array(n * n);
  const mIm = new Float64Array(n * n);
  const kPixels = new Uint8ClampedArray(n * n * 4);
  let kept = 0;
  let energy = 0;

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const i = row * n + col;
      const p = i * 4;
      if (keepSample(mode, row, col, n)) {
        kept += 1;
        mRe[i] = base.kRe[i];
        mIm[i] = base.kIm[i];
        energy += base.kRe[i] * base.kRe[i] + base.kIm[i] * base.kIm[i];
        const g = Math.round((base.logMag[i] / base.logMax) * 255);
        kPixels[p] = g;
        kPixels[p + 1] = g;
        kPixels[p + 2] = g;
      } else {
        // Removed samples: dark magenta so they read as "not acquired" rather than "low signal".
        kPixels[p] = 70;
        kPixels[p + 1] = 8;
        kPixels[p + 2] = 44;
      }
      kPixels[p + 3] = 255;
    }
  }

  const re = fftShift(mRe, n);
  const im = fftShift(mIm, n);
  fft2d(re, im, n, true);

  const mag = new Float64Array(n * n);
  let peak = 0;
  for (let i = 0; i < n * n; i++) {
    const m = Math.hypot(re[i], im[i]);
    mag[i] = m;
    if (m > peak) peak = m;
  }

  const imgPixels = new Uint8ClampedArray(n * n * 4);
  const scale = peak > 0 ? 255 / peak : 0;
  for (let i = 0; i < n * n; i++) {
    const g = Math.round(mag[i] * scale);
    const p = i * 4;
    imgPixels[p] = g;
    imgPixels[p + 1] = g;
    imgPixels[p + 2] = g;
    imgPixels[p + 3] = 255;
  }

  return {
    kPixels,
    imgPixels,
    samplesKept: kept,
    energyKept: base.totalEnergy > 0 ? energy / base.totalEnergy : 0,
    peakRelative: fullPeak && fullPeak > 0 ? peak / fullPeak : 1,
  };
}

/** Peak magnitude of the fully sampled reconstruction (the phantom itself). */
export function fullPeak(base: KSpaceBase, n: number = N): number {
  const re = fftShift(base.kRe, n);
  const im = fftShift(base.kIm, n);
  fft2d(re, im, n, true);
  let peak = 0;
  for (let i = 0; i < n * n; i++) peak = Math.max(peak, Math.hypot(re[i], im[i]));
  return peak;
}
