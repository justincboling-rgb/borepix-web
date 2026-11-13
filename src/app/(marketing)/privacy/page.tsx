import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/legal-page";

export const metadata: Metadata = legalMetadata("privacy");

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
