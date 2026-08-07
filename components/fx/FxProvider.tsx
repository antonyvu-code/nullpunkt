"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DEFAULTS, FX, FX_STORAGE_KEY as KEY, fxAttr, type FxId } from "@/lib/fx";

/**
 * The scroll-effect bench.
 *
 * Six effects were built to be looked at, not to be kept — the point is to see
 * them on the real page, at real scroll speed, and then throw most of them away.
 * So each one is a switch rather than a commit: nothing is woven into the
 * sections it decorates, every effect reverts cleanly when it is turned off, and
 * deleting a rejected one means deleting its file and its data-attribute.
 *
 * The panel is development-only. The switches themselves are not: the state
 * lives on <html data-fx="..."> so CSS can read it too, and whatever is left
 * standing at the end becomes the default in lib/fx and the harness goes.
 *
 * The catalogue itself lives in lib/fx.ts, which carries no "use client", so the
 * root layout can stamp the default attribute onto <html> during the server
 * render — see the note on the mirror below for why that timing matters.
 */
export { FX };
export type { FxId };

type Ctx = {
  state: Record<FxId, boolean>;
  set: (id: FxId, value: boolean) => void;
  setAll: (value: boolean) => void;
};

const FxCtx = createContext<Ctx>({ state: DEFAULTS, set: () => {}, setAll: () => {} });

export const useFx = (id: FxId) => useContext(FxCtx).state[id];

export function FxProvider({ children }: { children: React.ReactNode }) {
  /* EVERY LOAD STARTS WITH ALL SEVEN ON, and nothing is remembered. The choice
     used to be written to localStorage under `np-fx` and merged back OVER the
     defaults after mount, which made a single click in the panel a permanent
     setting for that browser — and `Ctrl+Shift+R` does not clear localStorage,
     so the usual advice never healed it. It cost two sitzungen: measurement
     runs kept reporting an effect as running (an automated browser starts with
     empty storage and therefore always sees the defaults) while the switch was
     off on the machine actually looking at the page. A bench whose state is
     invisible from one side is worse than a bench with no memory at all.
     The switches still work for the session; a reload is now the reset. */
  const [state, setState] = useState<Record<FxId, boolean>>(DEFAULTS);
  /* The LAST ATTRIBUTE ACTUALLY WRITTEN, not a "have I mounted yet" flag. See
     the refresh note below for why the difference matters. */
  const letzterWert = useRef<string | null>(null);

  useEffect(() => {
    /* Clear what earlier builds left behind, so a browser that already carries
       a stored `all off` is not the one machine where this still misbehaves.
       DEV ONLY: this key was never written anywhere but a dev browser — the
       panel that wrote it is gated below — so on a real visit this was a
       storage write on every page load in service of a bench they cannot see. */
    if (process.env.NODE_ENV !== "development") return;
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* private mode — nothing was ever written either */
    }
  }, []);

  /* Mirrored onto <html> as a space-separated list so stylesheets can gate on
     [data-fx~="rail-draw"]. Effects that are pure CSS need no React at all.

     Written DURING RENDER, and that is not a style choice. Some effects measure
     the layout this attribute produces, and those effects are children of this
     provider: React runs layout effects child-first and every passive effect
     after all of them, so an attribute set from useEffect here always landed one
     beat later than the child that needed it. ShelfTransport measured a shelf
     that was still a grid, read a traverse distance of zero, and returned
     without ever creating its ScrollTrigger — silently, and for good, since
     nothing re-runs a hook whose dependencies did not change. Rendering happens
     parent-first, so doing it here is what makes the stylesheet and the
     measurement agree, on the first paint and on every toggle after it.

     The effect below still runs: render can be discarded under concurrent
     rendering, and this is the write that is guaranteed to reflect what was
     actually committed. Both are idempotent, so the pair costs nothing. */
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-fx", fxAttr(state));
  }

  useEffect(() => {
    const wert = fxAttr(state);
    document.documentElement.setAttribute("data-fx", wert);

    /* AND REFRESH EVERY TRIGGER, because this attribute is a LAYOUT switch and
       nothing else on the page knows it moved.
       Measured at 1904×940: turning the bench off took the document from 10895
       to 8921px and carried the capability grid 1975px UP the page — FX.03
       alone gives the shelf a 100svh traverse. Every ScrollTrigger kept the
       start/end it was born with, so the rack's range was left sitting nearly
       two thousand pixels from the rack. The six modules then never arrived at
       any scroll position at all: parked at opacity 0 with the grid at 80, 68,
       55, 45, 35 and 25 % of the window. A section that reads as simply blank.
       That is what "the effect does not run" looked like from the outside, and
       it was never the effect — it was the switch that changes the page under
       it without saying so.

       SYNCHRONOUS, not deferred to a frame. The only thing a refresh needs is
       the attribute on <html>, and that is the line above; refresh() reads
       offsetTop and friends, which forces the style recalculation itself. The
       first version of this waited on requestAnimationFrame and was quietly
       useless in a tab that is not being composited — measured: the layout
       moved, the callback never ran, the rack still never arrived. Never hang a
       correction on rAF when the thing being corrected is a layout figure.

       ON TOGGLES ONLY, NEVER ON MOUNT. This effect also fires once when the
       provider mounts, which is a refresh nothing asked for: ScrollTrigger
       measures every trigger as it is created, and at mount that has just
       happened. The job here is one thing only — a switch that changed the
       layout AFTER the triggers were built.
       The mount run is skipped because it is a global side effect at the most
       crowded moment of the page's life — the loader's scroll lock is on, the
       fonts may not have settled, and two pins are inserting spacers — and it
       buys nothing. It has NOT been shown to be what blanked the page (the
       obvious suspicion, that a refresh under `body{overflow:hidden}` measures a
       document with no length, was tested and disproved: the pin held either
       way). It is removed from the mount path for the plain reason that an
       unnecessary global re-measurement is not worth defending.

       GUARDED ON THE VALUE, NOT ON A MOUNT FLAG, and the first version of this
       was the flag. A `mounted` ref does not survive contact with React's
       development Strict Mode: the effect is set up, torn down and set up again
       on the SAME instance, so the ref is already true the second time through
       and the refresh fires at mount after all. next.config.ts leaves
       reactStrictMode unset and this version of Next turns it on for the App
       Router, so the guarantee written above held in production and was false in
       the one place the page is actually being looked at — the worst shape a
       bug can take. Comparing the attribute against the last one written asks
       the question this code actually cares about (did the layout switch move?)
       instead of a lifecycle question standing in for it, and it is immune to
       any repeated run, Strict Mode or otherwise. */
    const vorher = letzterWert.current;
    letzterWert.current = wert;
    if (vorher === null || vorher === wert) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
  }, [state]);

  const set = useCallback(
    (id: FxId, value: boolean) => setState((s) => ({ ...s, [id]: value })),
    [],
  );
  const setAll = useCallback(
    (value: boolean) =>
      setState(Object.fromEntries(FX.map((f) => [f.id, value])) as Record<FxId, boolean>),
    [],
  );

  return (
    <FxCtx.Provider value={{ state, set, setAll }}>
      {children}
      {process.env.NODE_ENV === "development" && <FxPanel />}
    </FxCtx.Provider>
  );
}

/** The bench's own console. Deliberately plain — it is scaffolding, and dressing
 *  it up would make it compete with the page it exists to judge. */
function FxPanel() {
  const { state, set, setAll } = useContext(FxCtx);
  const [open, setOpen] = useState(false);
  const count = FX.filter((f) => state[f.id]).length;

  return (
    /* Sits above Next's own dev badge, which owns the bottom-left corner.
       z ABOVE THE LOADER, and that is the fix for "there is no switch". The
       loader is a full-screen z-[100] sheet and this was z-[70], so for the
       first 900ms of every load the one control that turns the effects off was
       painted under the boot animation. Measured: elementFromPoint at the
       button's own centre returned the loader, not the button. 900ms is easy to
       sit through and easy to miss — but the loader only leaves when its
       requestAnimationFrame loop finishes, and rAF does not run in a tab that
       is not being composited, so opening the site in a background tab leaves
       the sheet up, the scroll locked and this button unreachable for as long
       as the tab stays unfocused. Scaffolding has to outrank the thing it is
       there to judge. */
    /* COLUMN-REVERSE, so the list opens UPWARDS and the button does not move.
       This box is anchored by its bottom edge, and the open list is 957px tall
       against 812px of window — so opening it pushed its own toggle to y = −257
       and the first two switches to y = −146. The control you had just clicked,
       and the two effects at the top of the catalogue, were off the top of the
       screen with no way to reach them: on a 812px window this panel could
       never turn FX.01 or FX.05 off at all. Reversed, the button keeps its
       place at the bottom and the list grows into the space above it. */
    <div className="hud fixed bottom-16 left-4 z-[110] flex max-w-[min(23rem,calc(100vw-2rem))] flex-col-reverse gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        /* Opaque and flare-edged, which does not break the "deliberately plain"
           rule below — it serves it. The panel must not compete with the page
           as DESIGN; it must be unmistakably NOT the page. A translucent
           hairline box in the site's own line colour read as a piece of the
           chrome and disappeared into whatever section was behind it. */
        className="inline-flex min-h-[40px] items-center gap-2 self-start border px-3.5 text-ink"
        style={{ borderColor: "var(--flare)", background: "var(--bg)" }}
      >
        <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-flare" />
        SCROLL FX {String(count).padStart(2, "0")}/{FX.length} {open ? "▾" : "▸"}
      </button>

      {open && (
        <div
          /* And bounded, because reversing the direction alone only moves the
             overflow to the other end — seven entries with their notes is taller
             than a laptop window whichever way it grows. 9rem is the button, the
             gap and the box's own offset from the foot of the window. */
          className="max-h-[calc(100svh-9rem)] overflow-y-auto border p-3"
          style={{ borderColor: "var(--flare)", background: "var(--bg)" }}
        >
          <p className="mb-3 leading-relaxed text-muted-dim">
            DEV ONLY — NOT IN THE BUILD. TOGGLE, SCROLL, DECIDE. NOTHING IS REMEMBERED: EVERY
            RELOAD COMES BACK WITH ALL {FX.length} ON.
          </p>
          <ul className="m-0 list-none p-0">
            {FX.map((f) => (
              <li key={f.id} className="border-t py-2.5 first:border-t-0 first:pt-0" style={{ borderColor: "var(--line)" }}>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={state[f.id]}
                    onChange={(e) => set(f.id, e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--flare)]"
                  />
                  <span>
                    <span className={state[f.id] ? "text-ink" : "text-muted-dim"}>
                      {f.nr} · {f.label}
                    </span>
                    <span className="mt-1 block text-[0.68rem] leading-snug text-muted-dim">{f.note}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-4 border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <button type="button" onClick={() => setAll(true)} className="text-muted hover:text-ink">
              ALL ON
            </button>
            <button type="button" onClick={() => setAll(false)} className="text-muted hover:text-ink">
              ALL OFF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
