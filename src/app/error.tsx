"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Route error boundary. Shows a generic message so no stack trace, query or internal path reaches the
 * visitor; the error itself stays in server and browser logs for the team. Only renders when a page
 * throws, so the normal UI is untouched.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Private diagnostics only. Next.js already strips the message from production server errors; the
    // digest lets the team find the matching entry in the server logs.
    console.error("Route error", error.digest ?? error.name);
  }, [error]);

  return (
    <main id="main" className="container-x flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">This page hit a problem.</h1>
      <p className="mt-4 max-w-xl text-muted">
        Nothing you entered was lost. Try the page again, or head back to the home page.
        {error.digest ? (
          <>
            {" "}
            Reference <span className="num text-fg">{error.digest}</span>.
          </>
        ) : null}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
