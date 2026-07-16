import { site } from "@/lib/site";
import { fieldNotes, projects } from "@/lib/projects";
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
        <p className="hud hud-wide mb-6 text-accent accent-t">
          THE INDEX — 01–{String(projects.length).padStart(2, "0")}
        </p>
        <ProjectIndex />
        <p className="hud mt-4 text-muted/70">
          POINT AT A LINE — THE PAGE BORROWS ITS COLOR. EVERY EXPERIMENT IS DEPLOYED — THE LIVE
          LINK SITS AT THE TOP OF EACH CASE.
        </p>
      </section>

      <section id="field-notes" aria-label="Uncatalogued experiments" className="py-16 md:py-24" data-reveal>
        <p className="hud hud-wide mb-6 text-accent accent-t">
          FIELD NOTES — LIVE, UNCATALOGUED
        </p>
        <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
          Thirteen more experiments, deployed and running.
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Not everything has earned a write-up yet. These ship as-is — open them, they are the
          argument.
        </p>
        <ul
          className="mt-10 grid list-none gap-px p-0 md:grid-cols-2 lg:grid-cols-3"
          style={{ background: "var(--line)" }}
        >
          {fieldNotes.map((f) => (
            <li key={f.url} className="m-0 bg-bg p-0">
              <a
                href={f.url}
                target="_blank"
                rel="noopener"
                className="group block h-full p-6 no-underline"
              >
                <span className="hud flex items-baseline justify-between gap-4 text-ink group-hover:text-accent">
                  {f.name}
                  <span aria-hidden="true">↗</span>
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted">{f.note}</span>
              </a>
            </li>
          ))}
        </ul>
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
