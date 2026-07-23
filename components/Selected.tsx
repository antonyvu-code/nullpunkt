"use client";

import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/projects";
import { L } from "@/components/Lang";

const featured = projects.filter((p) => p.featured);
const homeAccent = projects[0].accent;

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
        <p className="hud text-muted/50">
          {String(featured.length).padStart(2, "0")} FILES · POINT TO PROBE
        </p>
      </div>

      <ul
        className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3"
        onMouseLeave={() => setAccent(homeAccent)}
      >
        {featured.map((p, i) => {
          const primary = i === 1;
          return (
            <li key={p.slug} className="m-0">
              <Link
                href={`/work/${p.slug}`}
                onMouseEnter={() => setAccent(p.accent)}
                onFocus={() => setAccent(p.accent)}
                className="accent-t group flex h-full min-h-[520px] flex-col border no-underline md:min-h-[70vh]"
                style={{ borderColor: "var(--line)" }}
              >
                {/* Header strip — flare marker + file number. */}
                <div
                  className="relative flex items-center justify-center border-b py-4"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span aria-hidden="true" className="absolute left-3 top-3 h-2 w-2 bg-flare" />
                  <span className="hud text-muted/60">{String(i + 1).padStart(2, "0")}</span>
                </div>

                {/* Specimen — the plate on a dotted readout field. */}
                <div
                  className="flex flex-1 items-center justify-center p-8"
                  style={{
                    backgroundImage: "radial-gradient(var(--line) 1px, transparent 1px)",
                    backgroundSize: "9px 9px",
                  }}
                >
                  {p.plates[0] && (
                    <Image
                      src={p.plates[0].src}
                      alt=""
                      width={2400}
                      height={1500}
                      sizes="(min-width: 768px) 30vw, 90vw"
                      className="h-auto w-full max-w-[80%] opacity-70 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none"
                    />
                  )}
                </div>

                {/* Caption — mono lead over a display title, centred. */}
                <div
                  className="border-t px-6 py-6 text-center"
                  style={{ borderColor: "var(--line)" }}
                >
                  <p className="hud text-muted/60">{p.kind.toUpperCase()}</p>
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
    </section>
  );
}
