import type { Metadata } from "next";
import { AuthCard, AuthHeading, AuthSwitch } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Borepix to continue your advanced-modality training: MRI, IR and CT workbooks and self-quizzes.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeading title="Log in" lede="Pick up your workbooks and self-quizzes where you left off." />
      <LoginForm />
      <AuthSwitch href="/signup" label="Sign up instead" />
    </AuthCard>
  );
}
