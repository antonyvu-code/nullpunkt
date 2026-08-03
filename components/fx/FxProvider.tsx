"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
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
  // Initialised to DEFAULTS on both server and first client render — the stored
  // choice is read after mount, the same rule Lang follows, so nothing here can
  // produce a hydration mismatch.
  const [state, setState] = useState<Record<FxId, boolean>>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as Partial<Record<FxId, boolean>>) }));
    } catch {
      /* private mode, or a stored value that is no longer JSON — defaults are fine */
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
    document.documentElement.setAttribute("data-fx", fxAttr(state));
  }, [state]);

  const write = useCallback((next: Record<FxId, boolean>) => {
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* nothing to do — the switch still works for this session */
    }
  }, []);

  const set = useCallback(
    (id: FxId, value: boolean) => write({ ...state, [id]: value }),
    [state, write],
  );
  const setAll = useCallback(
    (value: boolean) => write(Object.fromEntries(FX.map((f) => [f.id, value])) as Record<FxId, boolean>),
    [write],
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
    // Sits above Next's own dev badge, which owns the bottom-left corner.
    <div className="hud fixed bottom-16 left-4 z-[70] max-w-[min(23rem,calc(100vw-2rem))]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[36px] items-center gap-2 border px-3 text-ink"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
      >
        <span aria-hidden="true" className="inline-block h-1.5 w-1.5 bg-flare" />
        SCROLL FX {String(count).padStart(2, "0")}/{FX.length} {open ? "▾" : "▸"}
      </button>

      {open && (
        <div
          className="mt-2 border p-3 backdrop-blur-md"
          style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
        >
          <p className="mb-3 leading-relaxed text-muted-dim">
            DEV ONLY — NOT IN THE BUILD. TOGGLE, SCROLL, DECIDE. THE CHOICE IS REMEMBERED.
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
