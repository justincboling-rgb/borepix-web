/**
 * Seeded randomness for practice sessions and mock exams.
 *
 * Seeds are created inside event handlers (never during render), so server and client renders
 * stay deterministic and the same seed always reproduces the same order.
 */

/** mulberry32: a small, fast 32-bit PRNG. Same seed, same sequence. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by the given random source. Returns a new array. */
export function shuffleWith<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Shuffle with a fresh PRNG seeded by `seed`. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  return shuffleWith(items, mulberry32(seed));
}

/** A fresh unsigned 32-bit seed. Call from event handlers only. */
export function createSeed(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 0x100000000);
}

/** A unique id. Uses crypto.randomUUID where available (secure contexts), with a random fallback. */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const parts = Array.from({ length: 4 }, () => createSeed().toString(16).padStart(8, "0"));
  return parts.join("-");
}
