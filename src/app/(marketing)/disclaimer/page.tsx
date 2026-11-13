import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/legal-page";

export const metadata: Metadata = legalMetadata("disclaimer");

export default function DisclaimerPage() {
  return <LegalPage slug="disclaimer" />;
}
