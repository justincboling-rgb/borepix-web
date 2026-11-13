import "server-only";

/**
 * Fixed-window rate limiter for route handlers and server actions (sign-in, sign-up, password reset,
 * waitlist, redeem). Keyed by a caller-supplied identity, normally the client IP plus the route name.
 *
 * The store is in-memory, so on serverless hosting each instance counts separately; that still caps
 * burst abuse per instance and is the documented minimum until a shared store (Redis, Upstash, Vercel
 * KV) replaces `memory`. Swap the store without touching callers.
 */

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfterSeconds: number };

type Bucket = { count: number; resetAt: number };

interface RateLimitStore {
  hit(key: string, windowMs: number): Bucket;
}

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>();

  hit(key: string, windowMs: number): Bucket {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (existing && existing.resetAt > now) {
      existing.count += 1;
      return existing;
    }
    const fresh = { count: 1, resetAt: now + windowMs };
    this.buckets.set(key, fresh);
    if (this.buckets.size > 10_000) this.sweep(now);
    return fresh;
  }

  private sweep(now: number) {
    for (const [key, bucket] of this.buckets) if (bucket.resetAt <= now) this.buckets.delete(key);
  }
}

const memory = new MemoryStore();

export type RateLimitOptions = {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  store?: RateLimitStore;
};

/** Defaults for the routes the threat model names. Tighten, never loosen, without a documented reason. */
export const RATE_LIMITS = {
  signIn: { limit: 10, windowMs: 15 * 60_000 },
  signUp: { limit: 5, windowMs: 60 * 60_000 },
  passwordReset: { limit: 5, windowMs: 60 * 60_000 },
  waitlist: { limit: 10, windowMs: 60 * 60_000 },
  redeemKey: { limit: 20, windowMs: 60 * 60_000 },
} as const satisfies Record<string, RateLimitOptions>;

export function rateLimit(key: string, { limit, windowMs, store = memory }: RateLimitOptions): RateLimitResult {
  const bucket = store.hit(key, windowMs);
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000)) };
  }
  return { ok: true, remaining: limit - bucket.count };
}

/** Best-effort client address from the proxy headers Vercel and most hosts set. */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
