"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Readout, Segmented } from "./controls";
import { CENTER_HALF, N, fullPeak, makeBase, reconstruct, type KMode } from "./kspace";
import { LabFrame, type LabProps } from "./lab-frame";

const BLOCK = CENTER_HALF * 2;

const MODES: { value: KMode; label: string; explain: string; kAlt: string; imgAlt: string }[] = [
  {
    value: "full",
    label: "Full k-space",
    explain: "Every sample is used, so the reconstruction matches the phantom exactly: full contrast and sharp edges.",
    kAlt: "Fully sampled k-space: a bright center fading toward dim edges.",
    imgAlt: "Reconstructed head phantom with sharp edges, clear ventricles and small dots visible.",
  },
  {
    value: "center",
    label: "Center only",
    explain: `Only the central ${BLOCK} × ${BLOCK} block is kept: overall contrast and most of the signal survive, but edges and small structures blur away.`,
    kAlt: `k-space with only the central ${BLOCK} by ${BLOCK} block kept; everything outside it is removed.`,
    imgAlt: "Blurry reconstruction: overall shapes and brightness are kept but edges are soft and the small dots disappear.",
  },
  {
    value: "periphery",
    label: "Periphery only",
    explain: "The central block is removed: the image loses its bulk signal and contrast, leaving only edges and fine detail.",
    kAlt: `k-space with the central ${BLOCK} by ${BLOCK} block removed; only the outer samples remain.`,
    imgAlt: "Edge-only reconstruction: outlines of the skull, ventricles and dots on a dark background.",
  },
  {
    value: "alternate",
    label: "Every other line",
    explain:
      "Skipping every other phase-encoding line halves the field of view in the phase direction, so the anatomy wraps onto itself (aliasing).",
    kAlt: "k-space with every other horizontal phase-encoding line removed, giving a striped pattern.",
    imgAlt: "Aliased reconstruction: two overlapping copies of the head, shifted by half the image vertically.",
  },
];

function Plane({
  pixels,
  label,
  title,
  axisX,
  axisY,
}: {
  pixels: Uint8ClampedArray<ArrayBuffer>;
  label: string;
  title: string;
  axisX: string;
  axisY: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(new ImageData(pixels, N, N), 0, 0);
  }, [pixels]);

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-fg">{title}</span>
        <span className="num text-xs text-muted">
          {N} × {N}
        </span>
      </figcaption>
      <div className="relative">
        <canvas
          ref={ref}
          width={N}
          height={N}
          role="img"
          aria-label={label}
          className="block aspect-square w-full rounded-xl border border-white/10 bg-ink [image-rendering:pixelated]"
        />
      </div>
      <p className="num mt-2 flex justify-between gap-2 text-xs text-muted">
        <span>{axisX}</span>
        <span>{axisY}</span>
      </p>
    </figure>
  );
}

export function KSpaceLab({ headingLevel = "h2", className }: LabProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const Sub = headingLevel === "h2" ? "h3" : "h4";
  const [mode, setMode] = useState<KMode>("full");

  // Phantom + forward FFT once per mount (about a millisecond at 64 × 64).
  const base = useMemo(() => makeBase(), []);
  const peak = useMemo(() => fullPeak(base), [base]);
  const result = useMemo(() => reconstruct(base, mode, peak), [base, mode, peak]);
  const info = MODES.find((m) => m.value === mode) ?? MODES[0];

  const total = N * N;
  const samplesPct = Math.round((result.samplesKept / total) * 1000) / 10;
  const energyPct = result.energyKept * 100;

  return (
    <LabFrame
      id={`lab-kspace-${uid}`}
      title="k-space lab"
      caption="The center of k-space carries image contrast and most of the signal; the periphery carries edges and fine detail."
      headingLevel={headingLevel}
      className={className}
    >
      <Segmented<KMode>
        legend="Sampling"
        value={mode}
        onChange={setMode}
        options={MODES.map((m) => ({ value: m.value, label: m.label }))}
      />
      <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-fg" aria-live="polite">
        {info.explain}
      </p>

      <div className="mt-6 grid gap-6 @md:grid-cols-2">
        <Plane
          pixels={result.kPixels}
          title="k-space (log magnitude)"
          label={info.kAlt}
          axisX="kx: frequency →"
          axisY="ky: phase ↕"
        />
        <Plane
          pixels={result.imgPixels}
          title="Reconstructed image"
          label={info.imgAlt}
          axisX="Inverse 2D FFT"
          axisY="Phase direction ↕"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 @xl:grid-cols-3">
        <Readout
          label="Samples kept"
          value={`${samplesPct}%`}
          unit={<span className="text-sm">({result.samplesKept.toLocaleString("en-US")})</span>}
        />
        <Readout label="Signal energy kept" value={`${energyPct >= 99.95 ? "100" : energyPct.toFixed(1)}%`} />
        <Readout label="Peak vs full image" value={`${Math.round(result.peakRelative * 100)}%`} />
      </div>

      <div className="mt-6 grid gap-4 text-sm leading-relaxed text-muted @2xl:grid-cols-2">
        <div>
          <Sub className="font-sans text-sm font-semibold text-fg">How to read it</Sub>
          <p className="mt-1">
            Each k-space point holds one spatial frequency of the whole image, not one pixel. Removed samples are shown in
            dark magenta. The reconstruction is scaled to its own peak so faint results stay visible; the readout above gives
            the true peak.
          </p>
        </div>
        <div>
          <Sub className="font-sans text-sm font-semibold text-fg">Scan time link</Sub>
          <p className="mt-1">
            Each phase-encoding line costs one TR. Acquiring half the lines halves scan time, which is why parallel imaging
            skips lines on purpose and then uses coil sensitivity information to remove the wrap.
          </p>
        </div>
      </div>
    </LabFrame>
  );
}
