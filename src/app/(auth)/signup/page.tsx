import type { Metadata } from "next";
import { AuthCard, AuthHeading, AuthSwitch } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create your free Borepix account: MRI, IR and CT workbooks and self-quizzes now, official CE test keys and the CE Library at launch.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <AuthCard>
      <AuthHeading title="Sign up" lede="Free workbooks and self-quizzes for MRI, IR and CT, open from day one." />
      <SignupForm />
      <AuthSwitch href="/login" label="Log in instead" />
    </AuthCard>
  );
}
