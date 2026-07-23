import { site } from "@/lib/site";
import { fieldNotes, projects } from "@/lib/projects";
import ProjectIndex from "@/components/ProjectIndex";
import FieldNotes from "@/components/FieldNotes";
import Scope from "@/components/Scope";
import { L } from "@/components/Lang";

const specs = [
  {
    title: "TOKENS",
    rows: [
      ["GROUND", "#050505"],
      ["INK", "#F2F0EB"],
      ["MUTED", "#8A8781"],
      ["LINE", "INK / 14%"],
      ["ACCENT", "BORROWED FROM THE WORK"],
    ],
  },
  {
    title: "TYPE",
    rows: [
      ["DISPLAY", "BRICOLAGE GROTESQUE"],
      ["BODY", "BRICOLAGE GROTESQUE"],
      ["INSTRUMENT", "SPACE MONO · UPPERCASE"],
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
 * one deployed case in the index, so the stack is evidence, not a claim.
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
function Rail({ kicker, n }: { kicker: React.ReactNode; n: string }) {
  return (
    <div className="mb-6 md:col-span-3 md:mb-0 md:border-r md:pr-6" style={{ borderColor: "var(--line)" }}>
      <p className="hud hud-wide text-accent accent-t">{kicker}</p>
      <p className="hud mt-2 text-muted/50">S.{n} / 05</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-[calc(100svh-7rem)] flex-col justify-end pb-10 pt-10 md:pt-16" data-reveal>
        <Scope />
        <div className="relative">
          <p className="hud hud-wide text-accent accent-t">
            <L en="NULLPUNKT — THE LAB OF " de="NULLPUNKT — DAS LABOR VON " />
            <span className="text-ink">{site.owner.toUpperCase()}</span>
            <L en=" · FRONTEND ENGINEER, BERLIN" de=" · FRONTEND-ENGINEER, BERLIN" />
          </p>
          <h1 className="mt-7 max-w-4xl text-4xl font-medium leading-[1.05] tracking-tight md:text-8xl">
            <L text={site.tagline} />
          </h1>
          <p className="mt-6 max-w-xl leading-relaxed text-muted">
            <L text={site.manifesto} />
          </p>

          <dl
            className="accent-t m-0 mt-12 grid grid-cols-2 gap-px border-t md:grid-cols-5"
            style={{ borderColor: "var(--line)", background: "var(--line)" }}
            aria-label="Operator readings"
          >
            {site.operator.map((o) => (
              <div
                key={o.k.en}
                className={`bg-bg px-1 pb-1 pt-4 ${o.hot ? "border-t-2 border-accent" : ""}`}
              >
                <dt className="hud text-muted/60">
                  <L text={o.k} />
                </dt>
                <dd className={`hud m-0 mt-2 ${o.hot ? "text-accent" : "text-ink"}`}>
                  <L text={o.v} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* THE INDEX — kept full-width; its own columns carry the Swiss structure. */}
      <section id="index" aria-label="Project index" className="py-10" data-reveal>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">
            THE INDEX — 01–{String(projects.length).padStart(2, "0")}
          </p>
          <p className="hud text-muted/50">S.01 / 05 · SORTED BY ENTRY</p>
        </div>
        <ProjectIndex />
        <p className="hud mt-4 text-muted/70">
          POINT AT A LINE — THE PAGE BORROWS ITS COLOR. EVERY EXPERIMENT IS DEPLOYED — THE LIVE
          LINK SITS AT THE TOP OF EACH CASE.
        </p>
      </section>

      <section
        id="capabilities"
        aria-label="Capabilities"
        className="border-t py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Rail
          kicker={<L en="CAPABILITIES — MEASURED FROM THE WORK" de="FÄHIGKEITEN — AN DER ARBEIT GEMESSEN" />}
          n="02"
        />
        <div className="md:col-span-9">
          <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
            <L en="Every tool here ships in a case above." de="Jedes Werkzeug hier läuft in einem Case oben." />
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            <L
              en="No stack I can't point at. Each line below is in production somewhere in the index — the work is the reference."
              de="Kein Stack, auf den ich nicht zeigen kann. Jede Zeile unten läuft irgendwo im Index in Produktion — die Arbeit ist die Referenz."
            />
          </p>
          {/* A hairline ledger — dense and table-like, the opposite rhythm to
              Under the Hood's boxed cards, so the two never read as the same block. */}
          <div className="mt-10 border-t" style={{ borderColor: "var(--line)" }}>
            {capabilities.map((c) => (
              <div
                key={c.group}
                className="grid grid-cols-1 gap-1.5 border-b py-4 md:grid-cols-[11rem_1fr] md:items-baseline md:gap-8 md:py-5"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="hud accent-t text-accent">{c.group}</span>
                <span className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {c.items.map((it) => (
                    <span
                      key={it}
                      className="text-sm text-muted transition-colors duration-200 hover:text-ink motion-reduce:transition-none"
                    >
                      {it}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIELD NOTES — full-width, kicker on top (the loud, edge-to-edge archetype),
          deliberately NOT railed so it breaks the spec sections' silhouette. */}
      <section
        id="field-notes"
        aria-label="Uncatalogued experiments"
        className="border-t py-16 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">FIELD NOTES — LIVE, UNCATALOGUED</p>
          <p className="hud accent-t flex items-center gap-2 text-muted/50">
            <span aria-hidden="true" className="np-pulse inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            S.03 / 05 · {String(fieldNotes.length).padStart(2, "0")} DEPLOYED
          </p>
        </div>
        <p className="max-w-xl leading-relaxed text-muted">
          Not everything has earned a write-up yet. These ship as-is — open them, they are the
          argument.
        </p>
        <FieldNotes />
      </section>

      {/* UNDER THE HOOD — a full-bleed surface panel ("the machine room"), the only
          section with a fill, so it reads as an inset instrument rack, not another rail. */}
      <section
        id="hood"
        className="-mx-[var(--gutter)] border-y px-[var(--gutter)] py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        data-reveal
      >
        <Rail kicker="UNDER THE HOOD" n="04" />
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
                      <div key={k} className="flex items-baseline justify-between gap-4 py-1.5">
                        <dt className="hud text-muted/70">{k}</dt>
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
          <p className="hud mt-6 text-muted/70">
            SHIP FLOOR — WCAG 2.1 AA · SEMANTIC HTML + JSON-LD · MOBILE-FIRST · REAL TELEMETRY ONLY
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="border-t py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Rail
          kicker={<L en="ABOUT & CONTACT — OPEN TO FRONTEND ROLES" de="ÜBER MICH & KONTAKT — OFFEN FÜR FRONTEND-ROLLEN" />}
          n="05"
        />
        <div className="md:col-span-9">
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            <L text={site.about} />
          </p>
          <a
            href={`mailto:${site.email}`}
            className="accent-t inline-block text-3xl font-medium text-accent no-underline hover:text-ink md:text-5xl"
          >
            {site.email}
          </a>
          <p className="hud mt-6 text-muted/70">
            <L
              en="REMOTE OR BERLIN · RESPONSE WITHIN 48H · DE / EN / VI"
              de="REMOTE ODER BERLIN · ANTWORT BINNEN 48H · DE / EN / VI"
            />
          </p>
          <ul className="hud mt-8 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
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
      </section>
    </>
  );
}
