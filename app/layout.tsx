import type { Metadata } from "next";
import Link from "next/link";
import { Fira_Sans, Fira_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import Chrome from "@/components/Chrome";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";
import { LangProvider } from "@/components/Lang";
import { Walze } from "@/components/Walze";
import { FxProvider } from "@/components/fx/FxProvider";
import AccentScroll from "@/components/fx/AccentScroll";
import DrawLines from "@/components/fx/DrawLines";
import ShelfTransport from "@/components/fx/ShelfTransport";
import AboutDepth from "@/components/fx/AboutDepth";
import { DEFAULT_FX_ATTR } from "@/lib/fx";

/* OFFIZIN's three roles, 13.08.2026 — see SIGNATURE-STYLE.md §2.4. The set was
   registered for this project long before it was applied, and only the bespoke
   element (Der Passer) had ever come from it. This is the type half.
   The polarity half — paper ground, process inks — is NOT applied and is not
   pending either: measured, all twelve borrowed case accents pass 4.5:1 on
   #050505 and none pass on paper, so the ground stays dark until that has an
   answer. OFFEN.md carries the numbers.

   WHICH FACE TAKES WHICH ROLE is the one thing the registry did not say, and
   the answer is not interchangeable: Fira Sans sets the plate, Newsreader is
   what the plate prints, Fira Mono marks the plate. Sans and Mono are one
   family, so an instrument label and the heading above it share a skeleton —
   the label on a machine is drawn by whoever drew the machine. */

const firaSans = Fira_Sans({
  subsets: ["latin"],
  /* Static family, so the weights are enumerated rather than a range — and 400
     and 500 are the only two the site uses (16 font-medium, 3 font-normal, no
     bold anywhere). Adding a weight here is adding a request. */
  weight: ["400", "500"],
  variable: "--font-fira-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  /* opsz is why this face belongs to a print shop rather than to a preference:
     a separate cut per size is what a foundry did with metal, and it is the one
     axis here that is not decoration. Listed explicitly — next/font only ships
     non-wght axes it is told about. */
  axes: ["opsz"],
  variable: "--font-newsreader",
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nullpunkt.vercel.app"),
  title: {
    default: "Antony Vu — Creative Developer, Berlin · Nullpunkt",
    template: "%s — Nullpunkt",
  },
  /* 155 CHARACTERS, AND THE NUMBER IS THE POINT. This ran at 263 until the
     31.08.2026 scan measured it: Google cuts the snippet around 155–160, so the
     last hundred characters were written for nobody. The cut keeps the three
     things a recruiter searches on — the name, the city, and that the same
     person designs and builds — and drops the sentence about agency work, which
     the page's own header already carries in the largest type on the screen.
     og:description and twitter:description below are NOT cut: they feed link
     previews, which have no such limit, and they are the ones that get read
     when the link is pasted into Slack rather than found in a search result. */
  description:
    "Antony Vu, Berlin — a communication designer who designs and builds websites end to end. Nullpunkt is the lab: twelve distinct sites, each its own world.",
  alternates: { canonical: "/" },
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
  address: {
    "@type": "PostalAddress",
    addressLocality: "Berlin",
    addressCountry: "DE",
  },
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
    /* data-fx ships in the HTML rather than being attached after hydration: the
       stylesheet gates layout on it, so an attribute that arrives later means a
       first paint of the wrong layout, and — worse — a measurement taken by an
       effect before the layout it is measuring exists. DEFAULTS, so the server
       and the first client render say the same thing; a stored choice replaces
       it after mount, the same rule Lang follows. */
    <html
      lang="en"
      data-fx={DEFAULT_FX_ATTR}
      className={`${firaSans.variable} ${newsreader.variable} ${firaMono.variable} antialiased`}
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
          <FxProvider>
            <SmoothScroll />
            <Reveal />
            {/* The bench. Each queries the DOM for its own anchor and does
              nothing where that anchor is absent, so a page with no rails pays
              nothing for the rail effect. All four are switchable at runtime. */}
            <AccentScroll />
            <DrawLines />
            <ShelfTransport />
            {/* Mounts before the page's own effects (HeroIntro, Rack) and
              therefore measures a document that does not yet contain their pin
              spacers — About sits below both, so its start would be short by
              their whole runway. It is not corrected here: HeroIntro already
              ends its setup with a queueMicrotask'd ScrollTrigger.refresh() for
              exactly this reason, and that runs after every sibling effect has
              committed. One correction, stated in one place. */}
            <AboutDepth />
            <Chrome />
            <main id="main" className="w-full px-[var(--gutter)] pb-24 pt-28">
              {children}
            </main>
            <footer
              className="w-full border-t px-[var(--gutter)] py-8"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="hud flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-muted">
                <span>
                  {site.lab} — {site.footerNote}
                </span>
                <a
                  href={`mailto:${site.email}`}
                  className="accent-t np-zug inline-flex min-h-[44px] items-center text-muted no-underline hover:text-accent"
                >
                  <Walze en={site.email} de={site.email} />
                </a>
                {/* § 5 DDG: leicht erkennbar und unmittelbar erreichbar — also im
                  Fuß jeder Seite, nicht nur auf der Startseite. */}
                <span className="flex items-center gap-5">
                  <Link
                    href="/impressum"
                    className="accent-t np-zug inline-flex min-h-[44px] items-center text-muted no-underline hover:text-accent"
                  >
                    <Walze en="IMPRESSUM" de="IMPRESSUM" />
                  </Link>
                  <Link
                    href="/datenschutz"
                    className="accent-t np-zug inline-flex min-h-[44px] items-center text-muted no-underline hover:text-accent"
                  >
                    <Walze en="DATENSCHUTZ" de="DATENSCHUTZ" />
                  </Link>
                </span>
                <span>© {site.founded}</span>
              </div>
            </footer>
          </FxProvider>
        </LangProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
