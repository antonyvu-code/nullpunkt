import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import Chrome from "@/components/Chrome";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";
import { LangProvider } from "@/components/Lang";

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
    default: "Antony Vu — Frontend Engineer, Berlin · Nullpunkt",
    template: "%s — Nullpunkt",
  },
  description:
    "Antony Vu is a frontend engineer in Berlin. Nullpunkt is his lab: twelve case studies, real readings, one borrowed accent at a time. Open to remote frontend roles.",
  openGraph: {
    title: "Antony Vu — Frontend Engineer, Berlin · Nullpunkt",
    description:
      "Nullpunkt, the lab of Antony Vu. Twelve case studies, real readings, one borrowed accent at a time. Open to remote frontend roles.",
    siteName: "Nullpunkt",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.owner,
  jobTitle: "Frontend Engineer",
  address: { "@type": "PostalAddress", addressLocality: "Berlin", addressCountry: "DE" },
  email: site.email,
  knowsLanguage: ["de", "en", "vi"],
  url: "https://nullpunkt.vercel.app",
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
        <Loader />
        <LangProvider>
          <SmoothScroll />
          <Reveal />
          <Chrome />
          <main id="main" className="w-full px-[var(--gutter)] pb-24 pt-28">
            {children}
          </main>
          <footer
            className="w-full border-t px-[var(--gutter)] py-8"
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
        </LangProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
