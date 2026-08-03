import { site } from "@/lib/site";
import { homeRestAccent } from "@/lib/projects";
import AccentSetter from "@/components/AccentSetter";
import Selected from "@/components/Selected";
import FieldNotes from "@/components/FieldNotes";
import Werdegang from "@/components/Werdegang";
import Scope from "@/components/Scope";
import HeroIntro from "@/components/HeroIntro";
import Kontakt from "@/components/Kontakt";
import { L } from "@/components/Lang";

/** Running section count — printed in every rail, so it lives in one place. */
const SECTIONS = "07";

const specs = [
  {
    title: "TOKENS",
    rows: [
      ["GROUND", "#050505"],
      ["INK", "#F2F0EB"],
      ["MUTED", "#8A8781"],
      ["LINE", "INK / 14%"],
      ["FLARE", "#FF4D1C"],
      ["ACCENT", "BORROWED FROM THE WORK"],
    ],
  },
  {
    title: "TYPE",
    rows: [
      ["DISPLAY", "BRICOLAGE GROTESQUE"],
      ["BODY", "INSTRUMENT SANS"],
      ["INSTRUMENT", "SPLINE SANS MONO · UPPERCASE"],
      ["RULE", "METADATA IS ALWAYS MONO"],
    ],
  },
  {
    title: "MOTION",
    rows: [
      ["CLOCK", "DELTA TIME / GSAP"],
      ["EASE", "POWER2 ONLY"],
      ["MICRO", "COLOR + BORDER, NO BOUNCE"],
      ["REDUCED MOTION", "ALWAYS HONORED"],
    ],
  },
];

/**
 * Capabilities read off the shipped work — every tool here is used by at least
 * one deployed case in the archive, so the stack is evidence, not a claim.
 */
const capabilities = [
  { group: "LANGUAGES", items: ["TypeScript", "JavaScript", "HTML", "CSS"] },
  { group: "FRAMEWORKS", items: ["Next.js (App Router)", "React", "Vite", "SSR / SSG"] },
  { group: "GRAPHICS", items: ["Three.js", "WebGPU / TSL", "WebGL", "Canvas 2D", "OGL", "GLSL"] },
  { group: "MOTION", items: ["GSAP", "ScrollTrigger", "Flip", "Lenis"] },
  { group: "CRAFT", items: ["Tailwind v4", "i18n (EN/DE/VI)", "WCAG 2.1 AA", "Responsive", "SEO / JSON-LD"] },
  { group: "TOOLING", items: ["Git", "Vercel", "Figma"] },
];

/** The swatch a token row shows, if any — ACCENT reads the live borrowed color. */
function swatchColor(k: string, v: string): string | null {
  if (k === "ACCENT") return "var(--accent)";
  if (/^#/.test(v)) return v;
  return null;
}

/** Swiss left rail: kicker + a running section number, ruled off from the body. */
function Rail({
  kicker,
  n,
  draw = true,
}: {
  kicker: React.ReactNode;
  n: string;
  /** Whether FX.04 may animate this rule. Off for Contact: it is the last thing
   *  on the page, and a rule that is still drawing itself under someone who has
   *  arrived to write an email is motion asking for attention it has no business
   *  asking for. The rule is simply there. */
  draw?: boolean;
}) {
  return (
    <div data-rail className="relative mb-6 md:col-span-3 md:mb-0 md:pr-6">
      {/* The rail's rule is this element, not a border on the cell.
          It was a border, and FX.04 hid the border while a drawn stand-in took
          over — two mechanisms for one line, which broke twice: the stylesheet
          rule that hid the border lost to Tailwind's own .hidden, and switching
          the effect off wrote a longhand over React's `borderColor: var(--line)`
          shorthand, which destroys it: the CSSOM cannot round-trip a var() in a
          shorthand, so the rules came back as opaque ink instead of a 14 %
          hairline. One element, one rule. With the effect off it simply stands
          there; with it on, GSAP scrubs its scaleY. Nothing to hide, nothing to
          restore. */}
      <span
        aria-hidden="true"
        data-fx-line={draw ? "rail" : undefined}
        className="absolute right-0 top-0 hidden h-full w-px origin-top md:block"
        style={{ background: "var(--line)" }}
      />
      <p className="hud hud-wide text-accent accent-t">{kicker}</p>
      <p className="hud mt-2 text-muted-dim">
        S.{n} / {SECTIONS}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* The page arrives already calibrated. Without this the accent sits at
          its CSS default — ink — and every kicker, marker and hot reading
          renders as near-white on near-black: technically legible, but the
          page loses the one colour it has until something is hovered. */}
      <AccentSetter accent={homeRestAccent} />

      <section className="relative flex min-h-[calc(100svh-7rem)] flex-col justify-end pb-10 pt-10 md:pt-16">
        <Scope />
        {/* Registration annotation — the hero reads as a measured plate: located
            coordinates at the left, the live scope readout at the right. */}
        <p
          data-hero="coord"
          className="hud pointer-events-none absolute left-0 top-2 flex items-center gap-2 text-muted-dim"
        >
          <span aria-hidden="true" className="inline-block h-2 w-2 border-l border-t" style={{ borderColor: "var(--line)" }} />
          52.5200°N · 13.4050°E
        </p>
        <div className="relative">
          <p data-hero="kicker" className="hud hud-wide text-accent accent-t">
            <L en="NULLPUNKT — THE LAB OF " de="NULLPUNKT — DAS LABOR VON " />
            <span className="text-ink">{site.owner.toUpperCase()}</span>
            <L en=" · CREATIVE DEVELOPER — DESIGN + BUILD · BERLIN" de=" · CREATIVE DEVELOPER — DESIGN + BUILD · BERLIN" />
          </p>
          <h1
            data-hero="title"
            className="mt-7 max-w-5xl text-5xl font-medium leading-[0.98] tracking-[-0.02em] md:text-8xl lg:text-9xl"
          >
            <L text={site.tagline} />
          </h1>
          <p data-hero="manifesto" className="mt-6 max-w-xl leading-relaxed text-muted">
            <L text={site.manifesto} />
          </p>

          <p className="hud mt-12 text-muted-dim">FIG.01 — OPERATOR READINGS</p>
          <dl
            className="accent-t m-0 mt-3 grid grid-cols-2 gap-px border-t md:grid-cols-5"
            style={{ borderColor: "var(--line)", background: "var(--line)" }}
            aria-label="Operator readings"
          >
            {site.operator.map((o) => (
              <div
                key={o.k.en}
                data-hero-cell
                className={`bg-bg px-1 pb-1 pt-4 ${o.hot ? "border-t-2 border-accent" : ""}`}
              >
                <dt className="hud text-muted-dim">
                  <L text={o.k} />
                </dt>
                <dd className={`hud m-0 mt-2 ${o.hot ? "text-accent" : "text-ink"}`}>
                  <L text={o.v} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroIntro />
      </section>

      <Selected />

      {/* FIELD NOTES — full-width, kicker on top (the loud, edge-to-edge
          archetype). It follows the shelf directly: the shelf is the four cases
          that earned a write-up, this is the eight that shipped without one, and
          between them they are the whole body of evidence. Splitting them —
          which is what the stack and the CV used to do — meant a reader who came
          to see the work had to scroll past two sections about the person to
          find the rest of it.

          These two are also the page's only consecutive pair of railless
          sections, which is deliberate: the missing rule is what marks them as
          one block. Strict rail/no-rail alternation resumes below. */}
      <section
        id="field-notes"
        aria-label="Uncatalogued experiments"
        className="border-t py-16 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">FIELD NOTES — LIVE, UNCATALOGUED</p>
          <p className="hud accent-t flex items-center gap-2 text-muted-dim">
            <span aria-hidden="true" className="np-pulse inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            S.02 / {SECTIONS} · <L en="LIVE" de="LIVE" />
          </p>
        </div>
        <p className="max-w-xl leading-relaxed text-muted">
          Not everything has earned a write-up yet. These ship as-is — open them, they are the
          argument.
        </p>
        <FieldNotes />
      </section>

      {/* WERDEGANG — the dates a German recruiter looks for first, in the site's
          own language: a measured axis, not a CV table. First section after the
          evidence, and the first railed one, so the page visibly changes subject
          here: everything above is the work, everything below is the person. */}
      <section
        id="werdegang"
        aria-label="Career stations"
        className="border-t py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Rail kicker={<L en="WERDEGANG — THE STATIONS" de="WERDEGANG — DIE STATIONEN" />} n="03" />
        <div className="md:col-span-9">
          <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
            <L
              en="Trained as a designer, then taught to build."
              de="Als Gestalter ausgebildet, dann das Bauen gelernt."
            />
          </h2>
          <div className="mt-10">
            <Werdegang />
          </div>
        </div>
      </section>

      {/* CAPABILITIES — a channel rack, not a ledger. The groups stand as ruled
          vertical columns, so the section reads as a printed spec column and
          borrows no silhouette from the dated axis above or the boxed spec tiles
          in Under the Hood. No rail — the marker row carries the section number
          instead — which keeps it off-beat between two railed neighbours. */}
      <section
        id="capabilities"
        aria-label="Capabilities"
        className="border-t py-16 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">
            <L
              en="CAPABILITIES — MEASURED FROM THE WORK"
              de="FÄHIGKEITEN — AN DER ARBEIT GEMESSEN"
            />
          </p>
          <p className="hud text-muted-dim">
            S.04 / {SECTIONS} · <L en="IN PRODUCTION" de="IN PRODUKTION" />
          </p>
        </div>

        <h2 className="max-w-3xl text-2xl font-medium md:text-4xl">
          <L en="Every tool here ships in a case above." de="Jedes Werkzeug hier läuft in einem Case oben." />
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          <L
            en="No stack I can't point at. Each entry below is in production somewhere in the archive — the work is the reference."
            de="Kein Stack, auf den ich nicht zeigen kann. Jeder Eintrag unten läuft irgendwo im Archiv in Produktion — die Arbeit ist die Referenz."
          />
        </p>

        {/* gap-px over the line colour rules the cells; they keep the page
            ground, so this reads as a ruled table rather than as tiles. Three up
            and two down, not six across: on the narrowed measure six columns
            leave ~130px a group, which breaks entries like "Next.js (App
            Router)" over three lines and turns the rack into confetti. */}
        <div
          className="mt-12 grid grid-cols-2 gap-px md:grid-cols-3"
          style={{
            background: "var(--line)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          {capabilities.map((c) => (
            <div key={c.group} className="bg-bg px-3 pb-5 pt-4 md:px-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="hud accent-t text-accent">{c.group}</span>
              </div>
              <ul className="m-0 mt-4 list-none p-0">
                {c.items.map((it) => (
                  <li
                    key={it}
                    className="border-t py-2.5 text-sm leading-snug text-muted transition-colors duration-200 first:border-t-0 first:pt-0 hover:text-ink motion-reduce:transition-none"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* UNDER THE HOOD — a surface panel ("the machine room"), the only section
          with a fill, so it reads as an inset instrument rack, not another rail.
          It overhangs the measure to --bleed rather than running to the screen
          edge: at 50rem of page a band the full width of the window would be the
          widest thing here by half again, and the narrowing would read as a
          mistake in everything else rather than as the page's own width. */}
      <section
        id="hood"
        className="-mx-[var(--bleed)] border-y px-[var(--bleed)] py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        data-reveal
      >
        <Rail kicker="UNDER THE HOOD" n="05" />
        <div className="md:col-span-9">
          <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
            One operating system, every output.
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            Every experiment above runs on the same written system — tokens, three type roles, one
            accent at a time. This page runs on it too; the spec below is the live one.
          </p>
          <div className="mt-10 grid gap-px md:grid-cols-3" style={{ background: "var(--line)" }}>
            {specs.map((s) => (
              <div key={s.title} className="bg-bg p-6">
                <h3 className="hud hud-wide accent-t mb-5 text-accent">{s.title}</h3>
                <dl className="m-0">
                  {s.rows.map(([k, v]) => {
                    const sw = swatchColor(k, v);
                    return (
                      // flex-wrap, so the pair sets itself. On a wide tile the
                      // label and the value sit on one ruled line, justified
                      // apart; on the narrowed measure a tile is ~150px and a
                      // reading like "SPLINE SANS MONO · UPPERCASE" cannot share
                      // a line with its label at any size worth reading, so the
                      // value drops under it — which is the same stacked dt/dd
                      // the hero's FIG.01 cells already use.
                      <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1.5">
                        <dt className="hud text-muted-dim">{k}</dt>
                        <dd className="hud m-0 flex items-center gap-2 text-right text-muted">
                          {sw && (
                            <span
                              aria-hidden="true"
                              className="accent-t inline-block h-2.5 w-2.5 border"
                              style={{ background: sw, borderColor: "var(--line)" }}
                            />
                          )}
                          {v}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}
          </div>
          <p className="hud mt-6 text-muted-dim">
            SHIP FLOOR — WCAG 2.1 AA · SEMANTIC HTML + JSON-LD · MOBILE-FIRST · REAL TELEMETRY ONLY
          </p>
        </div>
      </section>

      {/* ABOUT and CONTACT used to be one block, which made the page end on a
          crowded plate: prose, address, name note and CV links all fighting the
          form for the same eye. Split, each gets its own air — S.06 is who, S.07
          is how to reach him, and nothing else. */}
      {/* ABOUT — the page's one editorial spread, and the only place the type
          itself does the arguing. Three sizes, three jobs, stacked in that
          order: the claim set large and narrowed on Bricolage's width axis, the
          evidence held at a reading measure, the promise pulled back up in
          accent. Railless, on the beat between Under the Hood and Contact. */}
      <section
        id="about"
        aria-label="About"
        className="border-t py-16 md:py-28"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-12 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">
            <L en="ABOUT — ROLE OR AGENCY WORK" de="ÜBER MICH — STELLE ODER AGENTURARBEIT" />
          </p>
          <p className="hud text-muted-dim">S.06 / {SECTIONS}</p>
        </div>

        {/* The claim. Narrowed (wdth 85) and held at the largest optical size so
            the face tightens as it grows — display type behaving like display
            type, instead of body copy scaled up. */}
        <h2
          className="font-display max-w-[15ch] text-balance text-[clamp(2rem,6.2vw,5rem)] font-medium leading-[0.94] tracking-[-0.035em] text-ink"
          style={{ fontVariationSettings: '"wdth" 85, "opsz" 48' }}
        >
          <L text={site.aboutLead} />
        </h2>

        {/* One column, read top to bottom: evidence, then promise, then the
            documents. The promise used to sit in a second column beside the
            evidence, which asked the reader to hold two threads at once and let
            the eye reach the closing line before the paragraph that earns it.
            Stacked, the order is the argument's own order — and on the narrowed
            measure a 6+5 spread would leave two columns of about 24 characters,
            which is below a readable line anyway. */}
        <div className="mt-14 border-t pt-12" style={{ borderColor: "var(--line)" }}>
          <p className="max-w-[46ch] text-pretty text-lg leading-relaxed text-muted md:text-xl">
            <L text={site.aboutBody} />
          </p>

          <p className="hud mt-14 text-muted-dim">
            <L en="— THE PROMISE" de="— DAS VERSPRECHEN" />
          </p>
          <p
            className="accent-t font-display mt-4 max-w-[24ch] text-2xl font-medium leading-[1.15] tracking-[-0.015em] text-accent md:text-[1.75rem]"
            style={{ fontVariationSettings: '"wdth" 92, "opsz" 32' }}
          >
            <L text={site.aboutClose} />
          </p>
          <ul className="hud mt-10 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
            {site.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.placeholder ? undefined : "_blank"}
                  rel="noopener"
                  className="accent-t inline-flex items-center gap-1.5 border-b border-transparent text-muted no-underline hover:border-accent hover:text-accent"
                  title={l.placeholder ? "Placeholder — add real URL" : undefined}
                >
                  {l.label}
                  <span aria-hidden="true" className="opacity-50">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Antony Vu is the working name; the CV and the certificates carry the
            legal one. Stated once so the two documents read as one person. */}
        <p className="hud mt-14 border-t pt-5 text-muted-dim" style={{ borderColor: "var(--line)" }}>
          <L
            en={`${site.wordmark} IS THE NAME I WORK UNDER — ON PAPER, ${site.legalName.toUpperCase()}`}
            de={`${site.wordmark} IST MEIN ARBEITSNAME — BÜRGERLICH ${site.legalName.toUpperCase()}`}
          />
        </p>
      </section>

      <section
        id="contact"
        aria-label="Contact"
        className="border-t py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Rail kicker={<L en="CONTACT — DIRECT LINE" de="KONTAKT — DIREKTER DRAHT" />} n="07" draw={false} />
        <div className="md:col-span-9">
          {/* The name is the headline; the address sits under it as an
              instrument line. Someone who just wants to write — a recruiter with
              one question, an agency with a brief — never has to open the form
              to find out where to send it. */}
          <h2
            className="accent-t font-display text-[clamp(2.5rem,9vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-accent"
            style={{ fontVariationSettings: '"wdth" 88, "opsz" 48' }}
          >
            {site.owner}
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="accent-t hud mt-5 inline-flex min-h-[44px] items-center border-b border-transparent text-muted no-underline hover:border-accent hover:text-accent"
          >
            {site.email}
          </a>
          <p className="hud mt-1 text-muted-dim">
            <L
              en="REMOTE OR BERLIN · RESPONSE WITHIN 48H · DE / EN / VI"
              de="REMOTE ODER BERLIN · ANTWORT BINNEN 48H · DE / EN / VI"
            />
          </p>
          <div className="mt-14 max-w-3xl border-t pt-10" style={{ borderColor: "var(--line)" }}>
            <Kontakt />
          </div>
        </div>
      </section>
    </>
  );
}
