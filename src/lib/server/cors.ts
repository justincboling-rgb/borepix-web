import "server-only";

/**
 * CORS allowlist for route handlers. The site is same-origin today and sends no CORS headers at all,
 * which is the strictest setting. When an endpoint must be called from the browser on another origin,
 * use these helpers so only the two production origins (and localhost in development) are ever allowed.
 */

export const ALLOWED_ORIGINS: readonly string[] = [
  "https://borepix.com",
  "https://www.borepix.com",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3100"]),
];

export function isAllowedOrigin(origin: string | null): origin is string {
  return origin !== null && ALLOWED_ORIGINS.includes(origin);
}

/** Headers to attach to a response for an allowed origin; an empty object for anyone else. */
export function corsHeaders(origin: string | null, methods: string = "GET, POST"): Record<string, string> {
  if (!isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}
