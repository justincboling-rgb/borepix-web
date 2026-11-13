import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-side gate for the founder dashboard (/admin).
 *
 * Set ADMIN_ACCESS_KEY (server-only, never NEXT_PUBLIC_) in the environment. A visit to
 * /admin?key=<ADMIN_ACCESS_KEY> exchanges the key for a secure, HTTP-only, SameSite cookie scoped to
 * /admin and redirects to the clean URL; later visits are checked against that cookie. Anyone without
 * it is sent to the home page. The cookie holds a SHA-256 digest, never the key itself.
 *
 * In production the gate fails closed: with no key configured, /admin is unreachable. In development
 * with no key configured the page stays open for local work.
 */

const COOKIE_NAME = "borepix_admin";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(`borepix-admin:${value}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison so a wrong key cannot be guessed from response timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function proxy(request: NextRequest) {
  const key = process.env.ADMIN_ACCESS_KEY;
  const home = new URL("/", request.url);

  if (!key) {
    return process.env.NODE_ENV === "production" ? NextResponse.redirect(home) : NextResponse.next();
  }

  const expected = await digest(key);
  const presented = request.nextUrl.searchParams.get("key");

  if (presented !== null) {
    if (!safeEqual(presented, key)) return NextResponse.redirect(home);
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("key");
    const response = NextResponse.redirect(clean);
    response.cookies.set({
      name: COOKIE_NAME,
      value: expected,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value ?? "";
  if (safeEqual(cookie, expected)) return NextResponse.next();
  return NextResponse.redirect(home);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
