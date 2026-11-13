#!/usr/bin/env node
/**
 * Secrets guard, run before every build (`npm run build` → `prebuild`).
 *
 * 1. No secret may be exposed to the browser: any NEXT_PUBLIC_* variable whose name looks like a
 *    credential fails the build. Only NEXT_PUBLIC_SITE_URL is expected on the client.
 * 2. No credential-looking literal may be committed in source: scans src/ for well-known key formats.
 *
 * Exit code 1 stops the build with the offending names; nothing else is printed about their values.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");

const ALLOWED_PUBLIC = new Set(["NEXT_PUBLIC_SITE_URL"]);
const SECRET_NAME = /(SECRET|PRIVATE|PASSWORD|PASSWD|TOKEN|API_KEY|APIKEY|ACCESS_KEY|CLIENT_SECRET|WEBHOOK|DSN|DATABASE_URL|CONNECTION_STRING)/i;

/** Literal patterns that only ever belong in server-side environment variables. */
const SECRET_LITERALS = [
  { name: "Stripe secret key", re: /\bsk_(live|test)_[0-9A-Za-z]{16,}/ },
  { name: "Stripe webhook secret", re: /\bwhsec_[0-9A-Za-z]{16,}/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "GitHub token", re: /\bgh[pousr]_[0-9A-Za-z]{30,}/ },
  { name: "OpenAI-style key", re: /\bsk-[0-9A-Za-z]{32,}/ },
  { name: "Private key block", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "Database URL with password", re: /\b(postgres|postgresql|mysql|mongodb(\+srv)?):\/\/[^:\s/]+:[^@\s/]+@/ },
];

const problems = [];

for (const name of Object.keys(process.env)) {
  if (!name.startsWith("NEXT_PUBLIC_")) continue;
  if (ALLOWED_PUBLIC.has(name)) continue;
  if (SECRET_NAME.test(name)) problems.push(`Environment variable ${name} looks like a secret but is exposed to the browser via NEXT_PUBLIC_. Rename it without the prefix and read it on the server only.`);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs|cjs|json|css|md)$/.test(entry)) out.push(full);
  }
  return out;
}

for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  for (const { name, re } of SECRET_LITERALS) {
    if (re.test(text)) problems.push(`${relative(ROOT, file)} contains what looks like a ${name}. Move it to a server-side environment variable.`);
  }
}

if (problems.length > 0) {
  console.error("\nSecrets check failed:\n");
  for (const p of problems) console.error(`  - ${p}`);
  console.error("\nSee .env.example for the expected variables.\n");
  process.exit(1);
}

console.log("Secrets check passed: no credentials exposed to the browser and none committed in src/.");
