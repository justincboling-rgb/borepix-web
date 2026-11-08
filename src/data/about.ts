/**
 * About Us copy. Facts only: Borepix is built in Kearny, New Jersey by co-founders who are radiologic
 * technologists working across MR, IR and CT. No names, headcounts, founding dates, press or funding are
 * stated anywhere on the page, because none are published.
 */

export type AboutValue = {
  id: string;
  title: string;
  /** Two sentences. */
  body: string;
};

export type AboutBuild = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export type About = {
  eyebrow: string;
  title: string;
  mission: string;
  story: readonly string[];
  values: readonly AboutValue[];
  builds: readonly AboutBuild[];
};

export const about = {
  eyebrow: "About Borepix",
  title: "Built for the suite, by the suite.",
  mission:
    "Borepix exists so that a Radiologic Technologist can master MRI, Interventional Radiology and CT without guessing. Free workbooks and self-quizzes teach the material. Official test keys prove it, record the CE credit and put a certificate in the technologist's hands.",
  story: [
    "Borepix is built in Kearny, New Jersey, a few blocks from the Hudson, by co-founders who are Radiologic Technologists. Between them they work across MR, IR and CT, and the material here is written the way they wished it had been taught: cross-sectional anatomy slice by slice, vascular pathways in the order a wire travels, CT protocols as decisions made against the clock.",
    "The ecosystem starts free. Every workbook and every self-quiz is open to read and retake. Money changes hands only when a technologist wants credit: an official CE test key, a CE Library pass or the mobile app license. The free material never expires and is never a teaser for the paid material.",
    "Borepix is an independent educational provider. It is not affiliated with, sponsored by, or endorsed by ARRT® or ASRT. Everything on the site is written by Borepix to reflect current clinical practice, and none of it is a registry exam item.",
  ],
  values: [
    {
      id: "precision",
      title: "Precision over volume",
      body: "Every item is written to the level a lead technologist reasons at, then checked against current practice. A smaller bank that is right beats a larger one that is close.",
    },
    {
      id: "free-first",
      title: "Free first",
      body: "The workbooks and quizzes cost nothing and stay that way. Paying for a test key is a decision about credit, not about access.",
    },
    {
      id: "judgement",
      title: "Judgement, not recall",
      body: "The suite rewards the technologist who knows why a protocol changes when renal function does. Rationales explain the decision, not just the answer.",
    },
    {
      id: "neighbours",
      title: "Built where we live",
      body: "Borepix is a Kearny company and acts like one. A portion of every test key funds a supply drive for The Hoboken Shelter, our partner shelter a few miles away.",
    },
  ],
  builds: [
    {
      id: "workbooks",
      title: "Clinical workbooks",
      description:
        "Free review guides with interactive diagrams for MRI cross-sectional anatomy, vascular IR pathways and advanced CT protocols.",
      href: "/anatomy",
      cta: "Open the workbooks",
    },
    {
      id: "quizzes",
      title: "Self-quizzes",
      description: "Free, original questions with full rationales. One bank per workbook, retake as often as you like.",
      href: "/quizzes",
      cta: "Take a quiz",
    },
    {
      id: "test-keys",
      title: "Official CE test keys",
      description: "Scored assessments with three attempts, 180 days to complete and a certificate on a passing submission.",
      href: "/store",
      cta: "Shop test keys",
    },
    {
      id: "ce-library",
      title: "CE Library",
      description: "A 12-month pass to every test key, workbook and reference atlas, plus the registry-prep web app.",
      href: "/store",
      cta: "See the annual pass",
    },
    {
      id: "mobile-app",
      title: "Mobile app",
      description: "Workbooks, quizzes and your keys on iOS and Android, offline between cases.",
      href: "/#app",
      cta: "About the app",
    },
  ],
} as const satisfies About;
