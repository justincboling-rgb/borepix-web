import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Borepix | Advanced Modality Training for Rad Techs: MRI, IR & CT",
    template: "%s | Borepix",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Radiologic Technologist CE",
    "MRI cross-sectional anatomy",
    "interventional radiology vascular access",
    "advanced CT protocols",
    "CE test keys",
    "rad tech continuing education",
    "National Radiologic Technology Week",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Borepix | Advanced Modality Training for Rad Techs: MRI, IR & CT",
    description: site.description,
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Borepix: an MRI scanner lit in neon pink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Borepix | Advanced Modality Training for Rad Techs: MRI, IR & CT",
    description: site.description,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-ink font-sans text-fg antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
