"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { DomeFallback, DomeSkeleton } from "./dome-static";

const DomeScene = dynamic(() => import("./dome-scene").then((m) => m.DomeScene), {
  ssr: false,
  loading: () => <DomeSkeleton />,
});

/**
 * The hero's interactive MRI bore. Fills its positioned parent (give it a height). Three.js loads on
 * the client only; browsers without WebGL get the static diagram.
 */
export function MriDome({ className }: { className?: string }) {
  const [unsupported, setUnsupported] = useState(false);
  const onUnsupported = useCallback(() => setUnsupported(true), []);
  if (unsupported) return <DomeFallback className={className} />;
  return <DomeScene className={className} onUnsupported={onUnsupported} />;
}
