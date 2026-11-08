import type { ExamBlueprint, ExamTrack } from "@/lib/content/types";

/**
 * ARRT® exam structures, used to shape mock exams and readiness reports.
 * Every number below was read directly from an ARRT document on 2026-10-24. Components must still
 * handle null (fall back to equal category weighting) in case a future update cannot be verified.
 *
 * ── Radiography (primary pathway) ─────────────────────────────────────────────────────────────
 * Category counts, scoredItems and pilotItems:
 *   ARRT "Examination Content Specifications: Radiography", board approved January 2021,
 *   implementation date January 1, 2022 (in effect through February 28, 2027), page 1 table:
 *   Patient Care 33, Safety 50, Image Production 51, Procedures 66, Total 200 scored questions;
 *   footnote 2: "Each exam includes an additional 30 unscored (pilot) questions."
 *   Linked from https://www.arrt.org/earn-arrt-credentials/credential-options/radiography
 * timeMinutes:
 *   ARRT "2026 Primary Eligibility Pathway Handbook", Section 4 "Pace Yourself" chart (handbook p. 44):
 *   Radiography: Scored Items 200, Pilot Items 30, Total Items 230, Test Time 230 min.
 *   (Appointment length is 250 minutes: test time plus 8-minute tutorial, 2-minute NDA, 10-minute survey.)
 *   https://assets-us-01.kc-usercontent.com:443/406ac8c6-58e8-00b3-e3c1-0c312965deb2/e2811114-6ed8-49d3-8dd0-1f53769aa33d/arrt-primary-handbook.pdf
 * Scheduled change: ARRT has published revised Radiography content specifications (board approved
 *   January 2026, implementation date March 1, 2027): Patient Care 31, Safety 46, Image Production 51,
 *   Procedures 72, Total 200 scored, plus 30 unscored pilot questions. Update this entry on that date.
 *   https://assets-us-01.kc-usercontent.com:443/406ac8c6-58e8-00b3-e3c1-0c312965deb2/99c55d51-15bb-4a87-89f3-d6e7013d8a74/Radiography_Content_Specifications_2027.pdf
 *
 * ── Magnetic Resonance Imaging (primary pathway) ──────────────────────────────────────────────
 * Category counts, scoredItems and pilotItems:
 *   ARRT "Examination Content Specifications: Magnetic Resonance Imaging", board approved January 2024,
 *   implementation date February 1, 2025, page 1 table: Patient Care 16, Safety 21,
 *   Image Production 106, Procedures 57, Total 200 scored questions;
 *   footnote 2: "The exam includes an additional 30 unscored (pilot) questions."
 *   Linked from https://www.arrt.org/earn-arrt-credentials/credential-options/mri
 * timeMinutes:
 *   Same 2026 Primary Eligibility Pathway Handbook chart (handbook p. 43):
 *   MRI: Scored Items 200, Pilot Items 30, Total Items 230, Test Time 230 min (appointment 250 minutes).
 *
 * timeMinutes stores the test time (230 minutes for 230 items), not the 250-minute appointment.
 */
export const blueprints: Record<ExamTrack, ExamBlueprint> = {
  radiography: {
    track: "radiography",
    name: "Radiography",
    scoredItems: 200,
    pilotItems: 30,
    timeMinutes: 230,
    categories: [
      { id: "patient-care", items: 33 },
      { id: "safety", items: 50 },
      { id: "image-production", items: 51 },
      { id: "procedures", items: 66 },
    ],
    source:
      "https://assets-us-01.kc-usercontent.com:443/406ac8c6-58e8-00b3-e3c1-0c312965deb2/c28cf141-f45c-44ef-acde-984929886e01/RAD_CS_2022.pdf",
    verifiedAt: "2026-10-24",
  },
  mri: {
    track: "mri",
    name: "Magnetic Resonance Imaging",
    scoredItems: 200,
    pilotItems: 30,
    timeMinutes: 230,
    categories: [
      { id: "patient-care", items: 16 },
      { id: "safety", items: 21 },
      { id: "image-production", items: 106 },
      { id: "procedures", items: 57 },
    ],
    source:
      "https://assets-us-01.kc-usercontent.com:443/406ac8c6-58e8-00b3-e3c1-0c312965deb2/8a6d78b2-c8bf-4a57-b824-85a9bc5a98e5/Magnetic%20Resonance%20Imaging%20Content%20Specifications%202025.pdf",
    verifiedAt: "2026-10-24",
  },
};
