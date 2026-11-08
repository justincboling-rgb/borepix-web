import type { ComponentType } from "react";
import type { LabId } from "@/lib/content/types";
import { KSpaceLab } from "./kspace-lab";
import { LarmorLab } from "./larmor-lab";
import { RelaxationLab } from "./relaxation-lab";
import { SarLab } from "./sar-lab";
import { isLabId } from "./lab-meta";
import type { LabProps } from "./lab-frame";

const LABS: Record<LabId, ComponentType<LabProps>> = {
  larmor: LarmorLab,
  relaxation: RelaxationLab,
  kspace: KSpaceLab,
  sar: SarLab,
};

/**
 * Renders the interactive lab for a LabId. Works from Server Components (the labs themselves are client leaves).
 * Unknown ids render nothing, so a typo in content never breaks a lesson page.
 */
export function LabRenderer({ lab, headingLevel, className }: { lab: LabId } & LabProps) {
  if (!isLabId(lab)) return null;
  const Lab = LABS[lab];
  return <Lab headingLevel={headingLevel} className={className} />;
}
