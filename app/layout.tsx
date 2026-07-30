import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
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

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nullpunkt.vercel.app"),
  title: {
    default: "Antony Vu — Creative Developer, Berlin · Nullpunkt",
    template: "%s — Nullpunkt",
  },
  description:
    "Antony Vu is a Berlin-based creative developer — a communication designer who designs and builds websites end to end. Nullpunkt is the lab: many distinct sites, each its own world. Open to a permanent role, remote or Berlin — and to white-label work for agencies.",
  openGraph: {
    title: "Antony Vu — Creative Developer, Berlin · Nullpunkt",
    description:
      "Nullpunkt, the lab of Antony Vu — a creative developer who designs and builds distinct websites end to end. Open to a permanent role, remote or Berlin — and to white-label work for agencies.",
    siteName: "Nullpunkt",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antony Vu — Creative Developer, Berlin · Nullpunkt",
    description:
      "The lab of Antony Vu — a creative developer who designs and builds distinct websites end to end. Open to a permanent role, remote or Berlin — and to white-label work for agencies.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.owner,
  alternateName: site.legalName,
  jobTitle: "Creative Developer",
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
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${splineMono.variable} antialiased`}
    >
      <body className="min-h-screen">
        <a
          href="#main"
          className="hud fixed left-1/2 top-0 z-[60] inline-flex min-h-[44px] -translate-x-1/2 -translate-y-full items-center bg-ink px-4 text-bg no-underline focus:translate-y-0"
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
              <a
                href={`mailto:${site.email}`}
                className="accent-t inline-flex min-h-[44px] items-center text-muted no-underline hover:text-accent"
              >
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
