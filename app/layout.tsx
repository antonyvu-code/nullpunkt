import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import Chrome from "@/components/Chrome";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Nullpunkt — interface studio",
    template: "%s — Nullpunkt",
  },
  description:
    "Nullpunkt is a one-person interface studio. Five experiments, real readings, one borrowed accent at a time.",
  openGraph: {
    title: "Nullpunkt — interface studio",
    description:
      "A one-person interface studio. Five experiments, real readings, one borrowed accent at a time.",
    siteName: "Nullpunkt",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  description: "One-person interface design and engineering studio.",
  email: site.email,
  foundingDate: site.founded,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${spaceMono.variable} antialiased`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="hud fixed left-1/2 top-0 z-[60] -translate-x-1/2 -translate-y-full bg-ink px-4 py-2 text-bg no-underline focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Reveal />
        <Chrome />
        <main id="main" className="mx-auto w-full max-w-5xl px-6 pb-24 pt-28 md:px-10">
          {children}
        </main>
        <footer
          className="mx-auto w-full max-w-5xl border-t px-6 py-8 md:px-10"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="hud flex flex-wrap items-center justify-between gap-4 text-muted">
            <span>
              {site.wordmark} — {site.footerNote}
            </span>
            <a href={`mailto:${site.email}`} className="accent-t text-muted no-underline hover:text-accent">
              {site.email}
            </a>
            <span>© {site.founded}</span>
          </div>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
