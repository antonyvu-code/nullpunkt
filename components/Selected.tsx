"use client";

import Link from "next/link";
import { projects } from "@/lib/projects";
import { L } from "@/components/Lang";

const featured = projects.filter((p) => p.featured);
const homeAccent = projects[0].accent;

/** Column placements that deliberately break the left rail into a staircase —
 *  the one composed asymmetry on the page. Middle item hangs to the right. */
const PLACE = [
  "md:col-start-1 md:col-span-7",
  "md:col-start-6 md:col-span-7 md:items-end md:text-right",
  "md:col-start-3 md:col-span-8",
];

function setAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

/**
 * SELECTED — the page's one broken-grid moment. Three featured cases set as
 * large display type on a staggered 12-column grid, so a recruiter lands on the
 * strongest work first. Hovering borrows the case's accent, same as the index.
 */
export default function Selected() {
  return (
    <section
      id="selected"
      aria-label="Selected work"
      className="border-t py-16 md:py-24"
      style={{ borderColor: "var(--line)" }}
      data-reveal
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="hud hud-wide text-accent accent-t">
          <L en="SELECTED — START HERE" de="AUSGEWÄHLT — HIER STARTEN" />
        </p>
        <p className="hud text-muted/50">
          {String(featured.length).padStart(2, "0")} FILES · POINT TO PROBE
        </p>
      </div>

      <ol
        className="m-0 mt-12 grid list-none grid-cols-1 gap-y-14 p-0 md:mt-16 md:grid-cols-12 md:gap-y-24"
        onMouseLeave={() => setAccent(homeAccent)}
      >
        {featured.map((p, i) => (
          <li key={p.slug} className={`m-0 ${PLACE[i] ?? "md:col-span-8"}`}>
            <Link
              href={`/work/${p.slug}`}
              onMouseEnter={() => setAccent(p.accent)}
              onFocus={() => setAccent(p.accent)}
              className={`accent-t group flex flex-col no-underline ${
                i === 1 ? "md:items-end md:text-right" : ""
              }`}
            >
              <span className="hud text-muted/60 group-hover:text-accent group-focus-visible:text-accent">
                {p.index} · {p.kind.toUpperCase()}
              </span>
              <span className="font-display mt-3 text-5xl font-medium leading-[0.94] tracking-tight text-ink transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent motion-reduce:transition-none md:text-7xl">
                {p.title}
              </span>
              <span className="mt-4 max-w-md leading-relaxed text-muted">{p.oneLiner}</span>
              <span className="hud mt-5 inline-flex items-center gap-2 text-muted group-hover:text-accent group-focus-visible:text-accent">
                <L en="VIEW CASE" de="CASE ANSEHEN" />
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  ↗
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
