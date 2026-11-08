import type { Metadata } from "next";
import { SettingsPanels } from "@/components/app/settings/settings-panels";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="container-x py-8 lg:py-10">
      <div className="max-w-3xl">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl font-semibold text-fg sm:text-4xl">Settings</h1>
        <p className="mt-2 text-muted">Manage your study profile and the progress saved in this browser.</p>
        <SettingsPanels />
      </div>
    </div>
  );
}
