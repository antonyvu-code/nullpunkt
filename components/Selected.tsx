"use client";

import Image from "next/image";
import Link from "next/link";
import { frontpageProjects, homeRestAccent, specimenSlug as SPECIMEN } from "@/lib/projects";
import { L } from "@/components/Lang";
import EchoProbe from "@/components/EchoProbe";

/**
 * The shelf is the curated cut itself, not a second hand-written list. When
 * `frontpage` flips on a case it appears here; there is no way for a card to
 * show work the curation withheld, because there is only one source.
 *
 * The specimen is lifted to the middle slot so the live probe and the page's
 * one filled button stay centred whatever else is in the cut.
 */
const featured = (() => {
  const spec = frontpageProjects.find((p) => p.slug === SPECIMEN);
  if (!spec) return frontpageProjects;
  const rest = frontpageProjects.filter((p) => p.slug !== SPECIMEN);
  const mid = Math.floor(frontpageProjects.length / 2);
  return [...rest.slice(0, mid), spec, ...rest.slice(mid)];
})();

/** Leaving the shelf returns the needle to the page's rest colour, not to zero. */
const homeAccent = homeRestAccent;

function setAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

/**
 * SELECTED — three equal specimen cards (start-here for a recruiter). Each is a
 * framed panel: index + flare marker up top, the case plate on a dotted readout
 * field, a two-line caption, and an action at the foot. The centre card's action
 * is the page's one filled button, in the fixed flare orange. Hovering a card
 * still borrows its accent for the rest of the chrome.
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
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
        <p className="hud hud-wide accent-t flex items-center gap-2 text-ink">
          <span aria-hidden="true" className="inline-block h-2 w-2 bg-flare" />
          <L en="SELECTED — START HERE" de="AUSGEWÄHLT — HIER STARTEN" />
        </p>
        <p className="hud text-muted-dim">
          S.01 / 07 · <L en="POINT TO PROBE" de="ZUM PRÜFEN ZEIGEN" />
        </p>
      </div>

      {/* Two-up, not four. The plates are hero screenshots — a whole page in
          one image — and at a quarter of the viewport they shrink to a texture
          nobody can read. Half the width is the smallest size at which the
          specimen still argues anything. */}
      <ul
        className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2"
        onMouseLeave={() => setAccent(homeAccent)}
      >
        {featured.map((p, i) => {
          const primary = p.slug === SPECIMEN;
          return (
            <li key={p.slug} className="m-0">
              <Link
                href={`/work/${p.slug}`}
                onMouseEnter={() => setAccent(p.accent)}
                onFocus={() => setAccent(p.accent)}
                // No min-height any more: the plate's own ratio sets the card's
                // height, and h-full lets the grid level the pair. A forced
                // height was what left the image cell as arbitrary leftover
                // space in the first place.
                className="accent-t group flex h-full flex-col border no-underline"
                style={{ borderColor: "var(--line)" }}
              >
                {/* Header strip — flare marker + file number. */}
                <div
                  className="relative flex items-center justify-center border-b py-4"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span aria-hidden="true" className="absolute left-3 top-3 h-2 w-2 bg-flare" />
                  <span className="hud text-muted-dim">{String(i + 1).padStart(2, "0")}</span>
                </div>

                {/* Specimen — the cell carries the PLATE'S OWN RATIO (2400×1500
                    = 16:10) instead of whatever height was left over. That is
                    the whole fix: at a matching ratio object-cover crops
                    nothing, so a hero screenshot arrives whole rather than
                    trimmed down its sides. Change the plate format and this
                    number has to move with it. */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {primary ? (
                    // Absolute, not in flow. EchoProbe is h-full w-full and
                    // sizes its canvas from the parent's measured rect — left
                    // in flow it would feed its own height back into a cell
                    // with no definite height, and the two grow each other
                    // without limit (measured once: 41,110px tall).
                    <div className="absolute inset-0">
                      <EchoProbe />
                    </div>
                  ) : (
                    p.plates[0] && (
                      <Image
                        src={p.plates[0].src}
                        alt=""
                        width={2400}
                        height={1500}
                        sizes="(min-width: 768px) 50vw, 92vw"
                        className="absolute inset-0 h-full w-full object-cover object-top opacity-70 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none"
                      />
                    )
                  )}
                </div>

                {/* Caption — mono lead over a display title, centred. It is
                    the absorber now: the plate's height is fixed by its ratio,
                    so any difference between the two cards in a row has to be
                    taken up here, or the action would float off the bottom. */}
                <div
                  className="flex flex-1 flex-col justify-center border-t px-6 py-6 text-center"
                  style={{ borderColor: "var(--line)" }}
                >
                  <p className="hud text-muted-dim">{p.kind.toUpperCase()}</p>
                  <p className="font-display mt-2 text-2xl font-medium leading-tight text-ink group-hover:text-accent group-focus-visible:text-accent">
                    {p.title}
                  </p>
                </div>

                {/* Action — the centre card carries the one filled button. */}
                {primary ? (
                  <div
                    className="flex items-center justify-center gap-2 py-5 font-medium text-bg"
                    style={{ background: "var(--flare)" }}
                  >
                    <L en="VIEW CASE" de="CASE ANSEHEN" />
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-bg" />
                  </div>
                ) : (
                  <div
                    className="hud accent-t flex items-center justify-center gap-2 border-t py-5 text-ink group-hover:text-accent group-focus-visible:text-accent"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <L en="VIEW CASE" de="CASE ANSEHEN" />
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                      ↗
                    </span>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* The way through to the archive. It used to hang off THE INDEX; with
          the index gone from the home page this is the only door, so it sits
          directly under the shelf rather than several screens away. */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <p className="hud max-w-xl text-muted-dim">
          <L
            en="POINT AT A CARD — THE PAGE BORROWS ITS COLOR. EACH CASE HERE PROVES SOMETHING THE OTHERS DO NOT."
            de="AUF EINE KARTE ZEIGEN — DIE SEITE LEIHT SICH IHRE FARBE. JEDER CASE HIER BELEGT ETWAS, DAS DIE ANDEREN NICHT BELEGEN."
          />
        </p>
        <Link
          href="/work"
          className="accent-t group font-display inline-flex min-h-[44px] items-center gap-3 text-2xl font-medium text-ink no-underline hover:text-accent md:text-3xl"
        >
          <L en="View all projects" de="Alle Projekte ansehen" />
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
          >
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}
