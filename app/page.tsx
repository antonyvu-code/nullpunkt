import { site } from "@/lib/site";
import ProjectIndex from "@/components/ProjectIndex";

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

export default function Home() {
  return (
    <>
      <section className="py-14 md:py-24" data-reveal>
        <p className="hud hud-wide text-accent accent-t">NULLPUNKT — INDEX.2026</p>
        <h1 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.08] md:text-6xl">
          {site.tagline}
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">{site.manifesto}</p>
      </section>

      <section id="index" aria-label="Project index" className="py-10" data-reveal>
        <p className="hud hud-wide mb-6 text-accent accent-t">THE INDEX — 01–05</p>
        <ProjectIndex />
        <p className="hud mt-4 text-muted/70">
          POINT AT A LINE — THE PAGE BORROWS ITS COLOR. PLATES CAPTURED FROM THE RUNNING SITES;
          LIVE DEMOS SHIP WITH DEPLOYMENT.
        </p>
      </section>

      <section id="hood" className="py-16 md:py-24" data-reveal>
        <p className="hud hud-wide mb-6 text-accent accent-t">UNDER THE HOOD</p>
        <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
          One operating system, five outputs.
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Every experiment above runs on the same written system — tokens, three type roles, one
          accent at a time. This page runs on it too; the spec below is the live one.
        </p>
        <div className="mt-10 grid gap-px md:grid-cols-3" style={{ background: "var(--line)" }}>
          {specs.map((s) => (
            <div key={s.title} className="bg-bg p-6">
              <h3 className="hud hud-wide mb-5 text-ink">{s.title}</h3>
              <dl className="m-0">
                {s.rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-1.5">
                    <dt className="hud text-muted/70">{k}</dt>
                    <dd className="hud m-0 text-right text-muted">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="hud mt-6 text-muted/70">
          SHIP FLOOR — WCAG 2.1 AA · SEMANTIC HTML + JSON-LD · MOBILE-FIRST · REAL TELEMETRY ONLY
        </p>
      </section>

      <section id="contact" className="py-16 md:py-24" data-reveal>
        <p className="hud hud-wide mb-6 text-accent accent-t">CONTACT — OPEN FOR PROJECTS</p>
        <a
          href={`mailto:${site.email}`}
          className="accent-t inline-block text-2xl font-medium text-ink no-underline hover:text-accent md:text-4xl"
        >
          {site.email}
        </a>
        <p className="hud mt-6 text-muted/70">RESPONSE WITHIN 48H · EN / VI / DE BRIEFS WELCOME</p>
      </section>
    </>
  );
}
