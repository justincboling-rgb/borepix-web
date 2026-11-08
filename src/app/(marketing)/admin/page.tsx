import type { Metadata } from "next";
import { FounderDashboard } from "@/components/admin/founder-dashboard";

export const metadata: Metadata = {
  title: "Founder Dashboard",
  description: "Borepix founder control center: revenue, keys issued, shelter pledges and affiliate payouts.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main id="main" className="container-x py-16 sm:py-20">
      <p className="eyebrow">Founder control center</p>
      <h1 className="mt-4 text-3xl font-semibold text-fg sm:text-4xl">Borepix admin and affiliate engine</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Revenue, keys, community pledges and partner payouts in one place.
      </p>
      <div className="mt-10">
        <FounderDashboard />
      </div>
    </main>
  );
}
