import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/site/logo";

/**
 * The site Logo reads usePathname, which suspends while prerendering a route whose dynamic params are
 * unknown at build time. The boundary keeps the rest of the shell in the static shell; the fallback is
 * visually identical.
 */
export function ShellLogo() {
  return (
    <Suspense fallback={<StaticLogo />}>
      <Logo eager />
    </Suspense>
  );
}

function StaticLogo() {
  return (
    <Link href="/" aria-label="Borepix home" className="inline-flex shrink-0 items-center gap-2.5 rounded-lg">
      <Image
        src="/logo.png"
        alt=""
        width={800}
        height={402}
        loading="eager"
        fetchPriority="high"
        className="h-8 w-auto"
      />
      <span className="font-display text-lg font-semibold tracking-tight text-fg">Borepix</span>
    </Link>
  );
}
