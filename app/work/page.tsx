import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/projects";
import ProjectIndex from "@/components/ProjectIndex";
import FieldNotes from "@/components/FieldNotes";
import { L } from "@/components/Lang";

export const metadata: Metadata = {
  title: "All projects",
  description:
    "Every project from the Nullpunkt lab — catalogued cases with a write-up, and uncatalogued experiments that ship as-is. All deployed, all live.",
};

/**
 * The destination "View all projects" was always promising. The home page shows
 * the catalogued index and the field notes in two places, several screens
 * apart; here they stand together with one count over them, which is the only
 * view that answers "how much has he actually shipped" in a single glance.
 *
 * Both registers are the existing components — a second visual language for
 * the same rows would make the two pages argue with each other.
 */
export default function WorkIndex() {
  // No tallies here either — the rows below are the count, and printing it
  // would put volume back in front of the thing volume was removed for.
  const readings: { k: React.ReactNode; v: React.ReactNode; hot?: boolean }[] = [
    {
      k: <L en="CATALOGUED" de="KATALOGISIERT" />,
      v: <L en="WITH A WRITE-UP" de="MIT TEXT" />,
    },
    {
      k: <L en="UNCATALOGUED" de="UNKATALOGISIERT" />,
      v: <L en="SHIPPED AS-IS" de="WIE SIE SIND" />,
    },
    {
      k: <L en="STATUS" de="STATUS" />,
      v: <L en="ALL LIVE, NONE ALIKE" de="ALLE LIVE, KEINE GLEICH" />,
      hot: true,
    },
  ];

  return (
    <>
      <section aria-label="All projects" className="pb-6">
        <p className="hud hud-wide text-accent accent-t">
          <L en="ALL PROJECTS — EVERY ONE DEPLOYED" de="ALLE PROJEKTE — ALLE VERÖFFENTLICHT" />
        </p>

        <h1
          className="font-display mt-8 max-w-[14ch] text-balance text-[clamp(2.25rem,6.5vw,5rem)] font-medium leading-[0.94] tracking-[-0.035em] text-ink"
          style={{ fontVariationSettings: '"wdth" 85, "opsz" 48' }}
        >
          <L
            en="Every site its own system, and no two alike."
            de="Jede Seite ein eigenes System, und keine gleicht der anderen."
          />
        </h1>

        <p className="mt-8 max-w-[46ch] text-pretty text-lg leading-relaxed text-muted">
          <L
            en="Nothing here is a mockup or a dead demo. Every entry has a URL, and every URL still answers — the catalogued cases carry a write-up, the field notes ship without one."
            de="Nichts hier ist ein Mockup oder eine tote Demo. Jeder Eintrag hat eine URL, und jede URL antwortet noch — die katalogisierten Cases haben einen Text, die Field Notes gehen ohne."
          />
        </p>

        <dl
          className="accent-t m-0 mt-12 grid grid-cols-1 gap-px border-t sm:grid-cols-3"
          style={{ borderColor: "var(--line)", background: "var(--line)" }}
        >
          {readings.map((r, i) => (
            <div key={i} className={`bg-bg px-1 pb-1 pt-4 ${r.hot ? "border-t-2 border-accent" : ""}`}>
              <dt className="hud text-muted-dim">{r.k}</dt>
              <dd className={`hud m-0 mt-2 ${r.hot ? "text-accent" : "text-ink"}`}>{r.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-label="Catalogued cases"
        className="border-t py-14 md:py-20"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">
            <L en="THE INDEX — THE FULL SET" de="DAS VERZEICHNIS — DER GANZE SATZ" />
          </p>
          <p className="hud text-muted-dim">
            <L en="SORTED BY ENTRY · WITH A WRITE-UP" de="NACH EINTRAG SORTIERT · MIT TEXT" />
          </p>
        </div>
        {/* Explicit: the home page hands this same component its selection, so
            the archive has to say out loud that it is passing everything. */}
        <ProjectIndex items={projects} />
      </section>

      <section
        aria-label="Uncatalogued experiments"
        className="border-t py-14 md:py-20"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">FIELD NOTES — LIVE, UNCATALOGUED</p>
          <p className="hud accent-t flex items-center gap-2 text-muted-dim">
            <span aria-hidden="true" className="np-pulse inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <L en="DEPLOYED" de="VERÖFFENTLICHT" />
          </p>
        </div>
        <p className="max-w-xl leading-relaxed text-muted">
          <L
            en="Not everything has earned a write-up yet. These ship as-is — open them, they are the argument."
            de="Nicht alles hat schon einen Text verdient. Die hier gehen, wie sie sind — öffnen Sie sie, sie sind das Argument."
          />
        </p>
        <FieldNotes />
      </section>

      <section
        className="border-t pt-12"
        style={{ borderColor: "var(--line)" }}
        aria-label="Continue"
        data-reveal
      >
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <Link
            href="/"
            className="accent-t group font-display inline-flex min-h-[44px] items-center gap-3 text-2xl font-medium text-ink no-underline hover:text-accent md:text-3xl"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transition-none"
            >
              ←
            </span>
            <L en="Back to the start" de="Zurück zum Anfang" />
          </Link>
          <Link
            href="/#contact"
            className="accent-t group font-display inline-flex min-h-[44px] items-center gap-3 text-2xl font-medium text-ink no-underline hover:text-accent md:text-3xl"
          >
            <L en="Get in touch" de="Kontakt aufnehmen" />
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              ↗
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
