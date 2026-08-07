/**
 * The bench's catalogue, kept out of FxProvider so the SERVER can read it.
 *
 * The switches themselves are client state, but the attribute they produce has
 * to exist in the first HTML the browser parses: the stylesheet gates layout on
 * [data-fx~="…"], and an effect that measures that layout runs before any effect
 * that could have set the attribute. Anything a server component needs — the
 * default attribute value — therefore cannot live in a "use client" module,
 * where every export reaches the server as a client reference rather than as a
 * value.
 */
export type FxId =
  | "accent-scroll"
  | "notes-sweep"
  | "scope-dock"
  | "shelf-transport"
  | "rail-draw"
  | "werdegang-axis"
  | "type-wipe";

export const FX: { id: FxId; nr: string; label: string; note: string }[] = [
  {
    id: "accent-scroll",
    nr: "01",
    label: "SCROLL TUNES THE ACCENT",
    note: "The page borrows from whatever crosses the measuring line. Also the only way a phone ever sees accent inheritance — there is no hover there.",
  },
  {
    id: "notes-sweep",
    nr: "05",
    label: "FIELD NOTES SWEEP",
    note: "Inside the notes the borrow goes continuous: the hue turns with scroll position instead of snapping row to row.",
  },
  {
    id: "scope-dock",
    nr: "02",
    label: "SCOPE ATTENUATES AND DOCKS",
    note: "Leaving the hero drops the signal's amplitude to nothing; the beam reappears as a phosphor dot riding the progress rule at the foot of the page.",
  },
  {
    id: "shelf-transport",
    nr: "03",
    label: "SHELF RUNS AS A CARRIAGE",
    note: "The shelf stops being a grid: the section holds still while the four cases travel left under a fixed measuring head. The wheel drives the traverse, and whatever is under the head is what the page borrows from — the pointer is no longer the only way to probe.",
  },
  {
    id: "rail-draw",
    nr: "04",
    label: "RAILS DRAW",
    note: "Section rules draw top to bottom like a plotter pen rather than being present from the start.",
  },
  {
    id: "werdegang-axis",
    nr: "06",
    label: "WERDEGANG AXIS FILLS",
    note: "The time axis draws itself station by station as each date passes.",
  },
  {
    id: "type-wipe",
    nr: "07",
    label: "SECTION HEADINGS WIPE",
    note: "The hero title already arrives from behind a mask while every other heading slides up on opacity — two ways of entering on one page. This gives the section headings the hero's way, so display type arrives one way throughout. Compare it against the plain fade before keeping it: the block it sits in is fading at the same time, and two things happening to one line can read as fussy rather than as one hand.",
  },
];

/* FX.08 (`capability-deck`) was built, measured and CULLED on 06.08.2026 — the
   six capability modules dealt through one slot held at the middle of the
   window, five parked at a time, 3833px of runway for a section a grid gives at
   a glance. It worked; it was the wrong instrument. A rack is read across, so
   the modules are laid out across and the scroll carries them in instead of
   swapping them. It is gone rather than switched off: this bench exists to
   throw effects away, and an effect nobody chose is not a switch, it is a
   maintenance cost. */

/** All on, so the first look is the full menu. Turn them off to compare. */
export const DEFAULTS = Object.fromEntries(FX.map((f) => [f.id, true])) as Record<FxId, boolean>;

/** The space-separated list the stylesheet matches with [data-fx~="…"]. */
export const fxAttr = (state: Record<FxId, boolean>) =>
  FX.filter((f) => state[f.id])
    .map((f) => f.id)
    .join(" ");

/** What <html> ships with. The stored choice is applied after mount, so this is
 *  also the value the server and the first client render must agree on. */
export const DEFAULT_FX_ATTR = fxAttr(DEFAULTS);

export const FX_STORAGE_KEY = "np-fx";
