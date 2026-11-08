import type { Metadata } from "next";
import { ExamRoot } from "@/components/app/exam/exam-app";

export const metadata: Metadata = {
  title: "Mock exam",
  description:
    "Timed, registry-style mock exams for ARRT® Radiography and MRI with a question navigator, flag for review, and a full rationale review of every item.",
};

/** The h1 is rendered by each exam stage (setup, in progress, results) so there is exactly one at a time. */
export default function ExamPage() {
  return (
    <div className="container-x py-8">
      <div className="mx-auto max-w-6xl">
        <ExamRoot />
      </div>
    </div>
  );
}
