/**
 * The five layers of the MRI bore, outermost first. Geometry is built in a frame where the bore axis is
 * +Y and "down" is +Z; the assembly is rotated so the axis points at the camera. `explode` is the distance
 * a layer travels along the axis at full explosion; `anchor` is where its callout chip attaches.
 */
export type DomePart = {
  id: "cover" | "magnet" | "gradient" | "rf" | "table";
  name: string;
  short: string;
  detail: string;
  /** Three engineering facts printed in the hardware blueprint section. */
  specs: readonly [string, string, string];
  explode: number;
  anchor: readonly [number, number, number];
};

export const DOME_PARTS: readonly DomePart[] = [
  {
    id: "cover",
    name: "Outer cover",
    short: "Housing · 70 cm bore liner",
    detail: "Composite covers and the bore liner. Everything the patient sees, and the only layer that plays no part in the physics.",
    specs: ["70 cm patient bore on wide-bore systems", "RF-transparent composite liner", "Docking rails and landmark laser"],
    explode: 2.15,
    anchor: [2.0, 1.05, 0],
  },
  {
    id: "magnet",
    name: "Superconducting magnet",
    short: "B₀ · 3.0 T · 4 K helium",
    detail: "Niobium-titanium windings in liquid helium at 4 K produce the static field, B₀. It is on whether the room is empty or not.",
    specs: ["1.5 T, 3.0 T and 7.0 T clinical and research systems", "NbTi windings at 4 K (−269 °C)", "Persistent current with zero resistance"],
    explode: 0.8,
    anchor: [1.9, 0.25, 0],
  },
  {
    id: "gradient",
    name: "Gradient coils",
    short: "Gx · Gy · Gz · spatial encoding",
    detail: "Three orthogonal coil sets tilt the field linearly across the bore to encode position. Their switching is the knocking you hear.",
    specs: ["Amplitude up to 80 mT/m", "Slew rate up to 200 T/m/s", "Selects the slice, encodes frequency and phase"],
    explode: -0.6,
    anchor: [1.25, -0.25, 0],
  },
  {
    id: "rf",
    name: "RF coil and shielding",
    short: "B₁ · birdcage · Faraday shield",
    detail: "The birdcage transmits the B₁ excitation pulse at the Larmor frequency and, in many protocols, receives the echo; the shielded room keeps every other radio signal out.",
    specs: ["Larmor frequency 127.7 MHz at 3.0 T", "Birdcage transmit; surface coils receive", "Faraday-shielded room keeps stray RF out"],
    explode: -1.75,
    anchor: [1.05, -0.65, 0],
  },
  {
    id: "table",
    name: "Patient table",
    short: "Couch · landmark · advance to isocenter",
    detail: "The couch lands the region of interest at isocenter, where B₀ is most homogeneous and the image is truest.",
    specs: ["Lands the region of interest at isocenter", "Detachable couch for a Zone IV emergency", "Coil connectors and restraints on the deck"],
    explode: 0,
    anchor: [0.45, 1.75, 0.62],
  },
] as const;

/* Material colors live here, not in the component, because WebGL needs numeric colors rather than tokens.
   They are the design-system pinks and neutrals. */
export const DOME_COLORS = {
  cover: 0xe9e9ee,
  magnet: 0xb9bcc6,
  gradient: 0x5b5e68,
  helix: 0xff66c4,
  rf: 0xff2d8a,
  pink: 0xff007f,
  table: 0x26262b,
  pedestal: 0x1a1a1f,
  patient: 0xf2f2f5,
} as const;
