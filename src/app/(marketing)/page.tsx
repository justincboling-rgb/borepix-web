import type { Metadata } from "next";
import { AffiliateCta } from "@/components/landing/affiliate-cta";
import { AppSection } from "@/components/landing/app-section";
import { CommunitySection } from "@/components/landing/community-section";
import { DomeBlueprint } from "@/components/landing/dome-blueprint";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { ModalityStrip } from "@/components/landing/modality-strip";
import { NrtwSection } from "@/components/landing/nrtw-section";
import { QuizSection } from "@/components/landing/quiz-section";
import { StoreSection } from "@/components/landing/store-section";
import { WorkbooksSection } from "@/components/landing/workbooks-section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <ModalityStrip />
      <DomeBlueprint />
      <WorkbooksSection />
      <QuizSection />
      <StoreSection />
      <NrtwSection />
      <CommunitySection />
      <AffiliateCta />
      <AppSection />
      <Faq />
      <FinalCta />
    </main>
  );
}
