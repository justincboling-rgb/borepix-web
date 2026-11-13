import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/legal-page";

export const metadata: Metadata = legalMetadata("terms");

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
