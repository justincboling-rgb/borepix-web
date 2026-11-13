import "server-only";

import { cookies } from "next/headers";

/**
 * Session cookie contract for the hosted accounts that launch with the backend.
 *
 * Sessions are never kept in localStorage or in a JavaScript-readable cookie: the token lives in an
 * HTTP-only, Secure (in production), SameSite=Lax cookie scoped to the whole site, so scripts and
 * cross-site requests cannot read or send it. Only server code (route handlers, server actions,
 * proxy.ts) touches these helpers; the `server-only` import makes a client import a build error.
 *
 * The value stored must be an opaque session id or a signed token issued by the auth backend, never
 * user data and never a password hash.
 */

export const SESSION_COOKIE = "borepix_session";

/** 30 days, refreshed on activity by the backend. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const base = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSessionCookie(token: string, maxAge: number = SESSION_MAX_AGE_SECONDS): Promise<void> {
  const store = await cookies();
  store.set({ name: SESSION_COOKIE, value: token, maxAge, ...base });
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set({ name: SESSION_COOKIE, value: "", maxAge: 0, ...base });
}
