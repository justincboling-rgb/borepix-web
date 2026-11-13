import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/legal-page";

export const metadata: Metadata = legalMetadata("dmca");

export default function DmcaPage() {
  return <LegalPage slug="dmca" />;
}
