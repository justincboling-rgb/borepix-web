import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";
import { site } from "@/lib/site";

const title = "My Account";
const description =
  "Your Borepix profile, orders, license keys and community pledges. Redeem a test key, copy your keys and open the CE Library.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/account" },
  openGraph: { type: "website", siteName: site.name, title: `${title} | ${site.name}`, description, url: "/account" },
  twitter: { card: "summary", title: `${title} | ${site.name}`, description },
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return (
    <main id="main" className="relative isolate">
      <div aria-hidden className="haze-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] opacity-70" />

      <header className="container-x pt-12 pb-10 sm:pt-16 sm:pb-12">
        <p className="eyebrow">Account</p>
        <h1 className="mt-4 text-4xl font-semibold text-fg sm:text-5xl">My Account</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Your profile, orders, license keys and community pledges in one place.
        </p>
      </header>

      <div className="container-x pb-24 sm:pb-32">
        <AccountView />
      </div>
    </main>
  );
}
