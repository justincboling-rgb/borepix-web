/**
 * Progressive loader for the hero's scroll-scrub image sequence.
 *
 * Frames live in /public/frames (1920 px, desktop) and /public/frames-sm (960 px, phones and small tablets),
 * named frame_0001.jpg … frame_0326.jpg. They are fetched coarse-to-fine (every 32nd frame first, then 16th,
 * 8th, …) so scrubbing works within the first few hundred kilobytes and sharpens as the rest arrive.
 * The cache is module-level so a remount (route hidden and shown again) never refetches.
 */

export const FRAME_COUNT = 326;

export type FrameSetId = "lg" | "sm";

const BASE: Record<FrameSetId, string> = { lg: "/frames", sm: "/frames-sm" };

export function frameUrl(set: FrameSetId, index: number): string {
  return `${BASE[set]}/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

/** Pick the lighter set unless the canvas will be wider than ~1100 device pixels. */
export function chooseFrameSet(cssWidth: number, dpr: number): FrameSetId {
  return cssWidth * Math.min(dpr, 2) > 1100 ? "lg" : "sm";
}

/** Coarse-to-fine order: first, last, then halving strides. Every index appears exactly once. */
export function loadOrder(count: number): number[] {
  const seen = new Uint8Array(count);
  const order: number[] = [];
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  for (let stride = 32; stride >= 1; stride = Math.floor(stride / 2)) {
    for (let i = 0; i < count; i += stride) push(i);
  }
  return order;
}

type Listener = (index: number) => void;

export class FrameStore {
  readonly set: FrameSetId;
  readonly count: number;
  readonly images: (HTMLImageElement | null)[];
  loadedCount = 0;
  failed = 0;
  private queue: number[];
  private inFlight = 0;
  private readonly maxInFlight = 6;
  private listeners = new Set<Listener>();
  private active = 0;

  constructor(set: FrameSetId, count: number = FRAME_COUNT) {
    this.set = set;
    this.count = count;
    this.images = new Array(count).fill(null);
    this.queue = loadOrder(count);
  }

  /** Fraction of the coarse pass (every 8th frame) that has loaded; scrubbing feels complete at 1. */
  coarseProgress(): number {
    let have = 0;
    let need = 0;
    for (let i = 0; i < this.count; i += 8) {
      need++;
      if (this.images[i]) have++;
    }
    return need ? have / need : 1;
  }

  /** Nearest loaded frame to `index`, searching outward. */
  nearest(index: number): HTMLImageElement | null {
    const i = Math.max(0, Math.min(this.count - 1, Math.round(index)));
    if (this.images[i]) return this.images[i];
    for (let d = 1; d < this.count; d++) {
      const lo = this.images[i - d];
      if (lo) return lo;
      const hi = this.images[i + d];
      if (hi) return hi;
    }
    return null;
  }

  /** Subscribe to frame arrivals. Loading runs only while at least one subscriber is attached. */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    this.active++;
    this.pump();
    return () => {
      this.listeners.delete(fn);
      this.active--;
    };
  }

  private pump() {
    while (this.active > 0 && this.inFlight < this.maxInFlight && this.queue.length) {
      const index = this.queue.shift() as number;
      if (this.images[index]) continue;
      this.inFlight++;
      this.fetchFrame(index).finally(() => {
        this.inFlight--;
        this.pump();
      });
    }
  }

  private async fetchFrame(index: number) {
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(this.set, index);
    try {
      await img.decode();
      this.images[index] = img;
      this.loadedCount++;
      this.listeners.forEach((l) => l(index));
    } catch {
      this.failed++;
    }
  }
}

const stores = new Map<FrameSetId, FrameStore>();

export function getFrameStore(set: FrameSetId): FrameStore {
  let s = stores.get(set);
  if (!s) {
    s = new FrameStore(set);
    stores.set(set, s);
  }
  return s;
}
