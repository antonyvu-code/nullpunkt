"use client";

import Image from "next/image";
import Link from "next/link";
import {
  frontpageProjects,
  homeRestAccent,
  shelfOrder,
  specimenSlug as SPECIMEN,
} from "@/lib/projects";
import { L } from "@/components/Lang";
import { Walze } from "@/components/Walze";
import EchoProbe from "@/components/EchoProbe";
import Registration from "@/components/Registration";

/**
 * The shelf is the curated cut itself, not a second hand-written list. When
 * `frontpage` flips on a case it appears here; there is no way for a card to
 * show work the curation withheld, because there is only one source.
 *
 * Position comes from `shelfOrder`, which is written out as slugs. The shelf
 * used to inherit the archive's order and then slot the specimen into "the
 * middle" — arithmetic that was right for three cards in one row and wrong the
 * moment the shelf became a two-column grid, where there is no middle: it put
 * the specimen third, i.e. bottom left, and the only saturated element on the
 * page ended up in a corner. Order is a composition decision, so it is now
 * stated rather than computed.
 *
 * Unlisted frontpage cases still hang, at the end — the list can reorder the
 * curation but never withhold from it.
 */
const featured = [
  ...shelfOrder
    .map((slug) => frontpageProjects.find((p) => p.slug === slug))
    .filter((p) => p !== undefined),
  ...frontpageProjects.filter((p) => !shelfOrder.includes(p.slug)),
];

/** Leaving the shelf returns the needle to the page's rest colour, not to zero. */
const homeAccent = homeRestAccent;

function setAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

/** Distance from a point to a rectangle — zero anywhere inside it. */
function abstand(r: DOMRect, x: number, y: number) {
  return Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
}

/**
 * THE NEAREST CARD, NOT THE ONE UNDER THE CURSOR.
 *
 * `gap-3` puts 12px of page ground between two cards, and hover is an
 * all-or-nothing test against a box: cross that strip and the card lets go, the
 * accent snaps back to the page's rest colour and the plate un-develops, for the
 * two frames it takes to reach the next card. Measured at 1280: card 2 ends at
 * 636 and card 3 begins at 648, so the dead strip sits at x = 640 — the exact
 * centre of the window, which on the shelf is where the reader's cursor rests
 * while the carriage runs past it. The one gesture the page is built on was
 * flickering off at the one place it is most watched.
 *
 * Nearest-rect has no dead strip by construction: every point inside the list
 * belongs to exactly one card, because distance is zero inside a card and the
 * 12px band is simply 6px nearer one side than the other. It is also the
 * mechanic the removed measuring head used to draw — "the specimen at the
 * reading position is the one being read" — arriving back without the line.
 *
 * `data-near` rather than `:hover`, so the CSS that already drives the develop
 * pass reads one more selector instead of a second system being invented for it.
 * Four getBoundingClientRect per pointermove: the rects move continuously while
 * the carriage travels, so there is nothing here that could honestly be cached.
 */
function naechste(e: React.MouseEvent<HTMLUListElement>) {
  const karten = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-card]"));
  let beste: HTMLElement | null = null;
  let kleinste = Infinity;
  for (const k of karten) {
    const d = abstand(k.getBoundingClientRect(), e.clientX, e.clientY);
    if (d < kleinste) {
      kleinste = d;
      beste = k;
    }
  }
  if (!beste) return;
  for (const k of karten) if (k !== beste) k.removeAttribute("data-near");
  beste.setAttribute("data-near", "");
  if (beste.dataset.accent) setAccent(beste.dataset.accent);
}

function loslassen(e: React.MouseEvent<HTMLUListElement>) {
  e.currentTarget
    .querySelectorAll<HTMLElement>("[data-near]")
    .forEach((k) => k.removeAttribute("data-near"));
  setAccent(homeAccent);
}

/**
 * SELECTED — three equal specimen cards (start-here for a recruiter). Each is a
 * framed panel: index + flare marker up top, the case plate on a dotted readout
 * field, a two-line caption, and an action at the foot. The centre card's action
 * is the page's one filled button, in the fixed flare orange. Hovering a card
 * still borrows its accent for the rest of the chrome.
 *
 * The data-transport* hooks are inert markup. They cost nothing while FX.03 is
 * off — no wrapper styles, no attributes React has to diff — and are what lets
 * the whole grid-to-carriage switch live in CSS and one GSAP file rather than in
 * a second copy of this component.
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
      {/* The pin window. A plain relative box until FX.03 is on, at which point
          CSS gives it a screen's height and clips it and ShelfTransport pins it.
          Heading and carriage are pinned TOGETHER on purpose: pinning the shelf
          by itself would leave the section's own title scrolling away from the
          work it names, which is the usual tell of a horizontal scroller that
          was bolted on rather than designed. */}
      <Registration />

      {/* THE LEAD-IN — a measured rest before the run, and the only thing in this
          section that exists for the section ABOVE it.
          Measured on the built page: the hero's pin releases at 2448 and this
          section's pin took the wheel again at 2545. Ninety-seven pixels — less
          than one notch of a mouse wheel — between two stretches of 3.4 screens
          each in which the page is held still. The reader was never actually
          released; the two runs read as one long one, and the second had no
          chance to announce itself as a new movement.
          Zero-height markup by default, so it costs a phone and a reduced-motion
          reader nothing. FX.03 gives it its height, because it is that effect's
          lead-in and has no meaning without it — see globals.css. */}
      <span aria-hidden="true" data-transport-lead="" className="block" />

      <div data-transport="" className="relative">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
          {/* A HEADING, not a styled paragraph. This section is the reason a
              recruiter opened the page, and it was the one block with nothing
              in the document outline: measured on the live site, nine headings
              and not one of them belonged to the work. The kicker was already
              doing a heading's job visually, so it becomes the element it was
              behaving as — same classes, same picture, an outline that finally
              names the evidence. */}
          <h2 className="hud hud-wide accent-t flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="inline-block h-2 w-2 bg-flare" />
            <L en="SELECTED — START HERE" de="AUSGEWÄHLT — HIER STARTEN" />
          </h2>
          <p className="hud flex items-center gap-4 text-muted-dim">
            <span>
              S.01 / 07 · <L en="POINT TO PROBE" de="ZUM PRÜFEN ZEIGEN" />
            </span>
            {/* The way out of the run. The pin holds the wheel for as long as
                the stock is wide, and SC1 is explicit that scrolling must not be
                taken away from the reader. An anchor is the cheapest honest
                answer: it lands past the pin, it works with the keyboard because
                it is a link rather than a handler, and it costs nothing when
                nobody uses it. Visible rather than focus-only — a reader who
                wants out of a locked stretch should not have to guess that a way
                out exists.

                Points at Field Notes, not past it. The run is the shelf alone
                now, so the thing on the far side of it is the notes; sending the
                reader to Werdegang would skip the other half of the evidence to
                escape a horizontal scroll. */}
            <a
              href="#field-notes"
              /* np-zug REPLACES the transparent border, it does not join it.
                 Both draw one hairline under this link and two mechanisms for
                 one line is what the Rail note in page.tsx says broke twice —
                 here the border would simply have been standing under a rule
                 that draws itself, permanently, at the same y. */
              className="accent-t np-zug inline-flex min-h-[44px] items-center text-muted-dim no-underline hover:text-accent focus-visible:text-accent"
            >
              <Walze en="SKIP THE RUN ↓" de="LAUF ÜBERSPRINGEN ↓" />
            </a>
          </p>
        </div>

        {/* THE MEASURING HEAD IS GONE, 10.08.2026. It was a full-height accent
            hairline down the centre of the shelf — the fixed lens the carriage
            travelled under, and the visible reason the page borrows a colour
            from whichever card is under it. Removed on Antony's call: on the
            page as it now stands it reads as a stray rule through the middle of
            the section rather than as an instrument.
            WHAT IT COSTS, stated so it is not rediscovered later: the borrow
            still works — AccentScroll writes [data-probed] and owns that
            entirely — but it no longer has a mark explaining WHY the colour
            changes as the cards pass. The mechanism is intact; the annotation
            is not. If the borrow ever starts reading as arbitrary, this is the
            thing that was taken out. */}

        {/* Two-up, not four. The plates are hero screenshots — a whole page in
            one image — and at a quarter of the viewport they shrink to a texture
            nobody can read. Half the width is the smallest size at which the
            specimen still argues anything, which is also the width the carriage
            hands them when FX.03 turns this grid into a track. */}
        <ul
          data-transport-track=""
          className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2"
          onMouseMove={naechste}
          onMouseLeave={loslassen}
        >
          {featured.map((p, i) => {
            const primary = p.slug === SPECIMEN;
            return (
              <li key={p.slug} data-transport-card="" className="m-0">
                <Link
                  href={`/work/${p.slug}`}
                  // The card states its colour in the markup, so the scroll-tuned
                  // borrow (FX.01) reads the same source the hover does instead of
                  // being handed a second, drifting copy of the curation.
                  data-accent={p.accent}
                  onMouseEnter={() => setAccent(p.accent)}
                  onFocus={() => setAccent(p.accent)}
                  // No min-height any more: the plate's own ratio sets the card's
                  // height, and h-full lets the grid level the pair. A forced
                  // height was what left the image cell as arbitrary leftover
                  // space in the first place.
                  // data-card is the anchor for both halves of the gesture: the
                  // registration brackets hang off its corners and the probe's
                  // --scan is declared on it, so acquiring and reading share one
                  // element instead of drifting on two. relative is what the
                  // brackets position against — without it they would find the
                  // section and all four cards would mark the same corners.
                  data-card=""
                  className="accent-t group relative flex h-full flex-col border no-underline"
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
                  <div data-plate="" className="relative aspect-[16/10] w-full overflow-hidden">
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
                        <>
                          {/* The plate as it sits on the shelf: undeveloped. */}
                          <Image
                            src={p.plates[0].src}
                            alt=""
                            width={2400}
                            height={1500}
                            sizes="(min-width: 768px) 50vw, 92vw"
                            className="absolute inset-0 h-full w-full object-cover object-top opacity-70 grayscale"
                          />
                          {/* The same plate in colour, masked by the pass (see
                              [data-plate-develop] in globals.css). Identical
                              src, width and sizes, so this is the same entry in
                              the image cache and costs one request, not two —
                              the second element is DOM, not bandwidth. */}
                          <Image
                            src={p.plates[0].src}
                            alt=""
                            width={2400}
                            height={1500}
                            sizes="(min-width: 768px) 50vw, 92vw"
                            data-plate-develop=""
                            className="absolute inset-0 h-full w-full object-cover object-top"
                          />
                          {/* The pass. Accent, because it belongs to the card
                              being read — the probe is lit by the specimen, not
                              by the instrument. */}
                          <span
                            aria-hidden="true"
                            data-plate-edge=""
                            className="pointer-events-none absolute inset-x-0 z-10 h-px"
                            style={{
                              background: "var(--accent)",
                              boxShadow: "0 0 12px 1px var(--accent)",
                            }}
                          />
                        </>
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
                    {/* h3 under the section's h2: the case titles are what a
                        screen-reader user navigating by heading is looking for,
                        and they were plain paragraphs. Not caught by FX.07,
                        which wipes h2 only — the cards have their own arrival. */}
                    {/* group-data-[near] alongside group-hover, so the title
                        follows the same nearest-card answer the develop pass
                        does. Leaving it on hover alone was the half-applied
                        state: a plate in full colour under a heading that had
                        gone back to ink, for as long as the cursor sat in the
                        gap between two cards. */}
                    <h3 className="font-display mt-2 text-2xl font-medium leading-tight text-ink group-hover:text-accent group-focus-visible:text-accent group-data-[near]:text-accent">
                      {p.title}
                    </h3>
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
                      className="hud accent-t flex items-center justify-center gap-2 border-t py-5 text-ink group-hover:text-accent group-focus-visible:text-accent group-data-[near]:text-accent"
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

                  {/* Registration. Purely the instrument's annotation on the
                      card, so it is hidden from assistive tech: a screen reader
                      being told "four corners" about every specimen would be
                      told nothing. Geometry and both states live in globals.css
                      ([data-reg]); the strike-in is Registration.tsx. */}
                  {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                    <span key={corner} aria-hidden="true" data-reg={corner} />
                  ))}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

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
          className="accent-t np-zug group font-display inline-flex min-h-[44px] items-center gap-3 text-2xl font-medium text-ink no-underline hover:text-accent md:text-3xl"
        >
          {/* The arrow stays OUT of the cylinder. It already has a hover of its
              own one line down — it slides right — and a mark that both turns
              over and travels is two answers to one question. */}
          <Walze en="View all projects" de="Alle Projekte ansehen" />
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
