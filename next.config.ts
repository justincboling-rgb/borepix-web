import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Baseline Content Security Policy for a Next.js App Router site whose only third-party code is Vercel Web Analytics.
 * - Scripts and styles are self-hosted; Next's hydration and Tailwind need inline allowances, and the
 *   development server also needs eval and a WebSocket for hot reloading.
 * - Fonts are self-hosted through next/font; images and the Three.js canvas use data: and blob: URLs.
 * - Vercel Web Analytics is same-origin in production (/_vercel/insights/script.js and /_vercel/insights/*);
 *   only its development debug build loads from va.vercel-scripts.com, so that host is allowed in development alone.
 * - Nothing may frame the site, and forms may only post back to it.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** Production security headers, applied to every response. */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  /** Never advertise the framework or ship readable production source. */
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /** The core policies moved from /legal/<slug> to clean root routes; old links keep working. */
  async redirects() {
    return [
      { source: "/legal/terms", destination: "/terms", permanent: true },
      { source: "/legal/privacy", destination: "/privacy", permanent: true },
      { source: "/legal/disclaimer", destination: "/disclaimer", permanent: true },
      { source: "/legal/dmca", destination: "/dmca", permanent: true },
    ];
  },
};

export default nextConfig;
