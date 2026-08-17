# scripts — the measuring bench

Plain Node over CDP against the Chromium `ms-playwright` already installed. **No
dependency is added to this repo**, and nothing here runs as part of a build.

Everything writes PNGs and JSON into `scripts/shots/`, which is gitignored.

```bash
pnpm build && pnpm start      # these measure the BUILT page, never `pnpm dev`
node scripts/shots.mjs
```

| file | what it answers |
|---|---|
| `cdp.mjs` | the client the others use — launch, navigate, evaluate, screenshot, wheel |
| `shots.mjs` | what does the page look like in each of the six conditions below, plus an audit for content that is present but paints nothing |

## The six conditions, and why the tablet row exists

The site branches **motion on width** (`min-width: 768px` in `Rack`,
`ShelfTransport`, `AccentScroll`) and its **accent probe on hover**
(`@media (hover: none)` in `globals.css`). A tablet is the cell where those two
disagree: wide enough for both pins, with no hover to drive the index. Until
15.08.2026 nothing had ever run there — and the phone conditions had been
running as a *narrow desktop*, because resizing a window does not remove hover.

| condition | hover | pointer | docHeight |
|---|---|---|---|
| Desktop 1440 · motion | hover | fine | 15931 |
| Desktop 1440 · reduced | hover | fine | 10677 |
| Tablet 820×1180 portrait · motion | none | coarse | 18954 |
| Tablet 1366×1024 landscape · motion | none | coarse | 17730 |
| Phone 390×844 · motion | none | coarse | 15339 |
| Phone 390×844 · reduced | none | coarse | 13035 |

`launch({ touch: true })` is what makes a touch device; `mobile: true` alone
does not (see trap 5). Every launch now asserts its own quadrant before
returning, so a run cannot report numbers from a cell it is not in.
| `release-verify.mjs` | does the field-note trace still play its full length, still get cut by a scroll, and still hand the dial back without leaking an attribute |
| `rack-strip.mjs` | the rack pin sampled at the same nine points for several scrub/stagger settings — **needs two temporary lines in `Rack.tsx`, see its header** |

## Four traps, all of which have cost a session

1. **`next start` survives `pkill` from a shell.** A stale server keeps port 3000
   while `.next` is rebuilt underneath it and then serves chunks that no longer
   exist — the page loads, GSAP never runs, and it reads exactly like "the change
   killed the effect". Kill by port:
   `Get-NetTCPConnection -LocalPort 3000 -State Listen | %{ Stop-Process -Id $_.OwningProcess -Force }`.
   `docHeight` is the cheap tell: with both pins alive the home page is ~15.9k,
   without them ~9.8k.
2. **The in-app browser pane does not composite.** No rAF, no scroll events, so
   GSAP's scrub never advances. Fine for structure and computed style, fiction for
   anything frame-dependent. That is why these scripts exist at all.
3. **The page target can be absent from `Target.getTargets` right after launch.**
   `cdp.mjs` polls for it. Without that poll a run attaches to nothing, the page
   still loads, and every measurement comes back empty — which reads like a broken
   component. It was three wasted runs on 14.08.2026.
   **Polling and picking by URL narrowed this and did not close it:** on
   15.08.2026 two runs in six still landed on `chrome://new-tab-page/` and
   reported `docHeight 900`, 0 headings, no canvas. `goto` now reads
   `location.href` back and re-navigates up to four times, because the failure
   is a race — the target is still becoming the new tab page when the navigate
   is issued, and it wins. Attempt two lands. **A run that cannot say where it
   is has nothing to report.**
4. **Headless rAF is unthrottled.** Frame counts and FPS from any run here are
   meaningless in absolute terms. Only compare conditions measured on the same
   instrument in the same session.
5. **`Emulation.setEmulatedMedia` accepts `hover` and `pointer` and ignores
   them.** No error, no warning, no effect — measured 15.08.2026. A script using
   it runs clean, prints a full report, and measures the wrong quadrant.
   `Emulation.setTouchEmulationEnabled` + `setEmitTouchEventsForMouse` are what
   actually move those two features. Neither `mobile: true` nor a narrow width
   moves them at all: at 820px with `mobile: true` the page still reports
   `hover: hover` / `pointer: fine`.
6. **`overflowX` is a motion artefact, not a layout bug — but only measure it in
   one run and it will lie.** With the drivers alive the parked, off-screen
   modules and the shelf track put 468–575px of ink past the right edge at every
   width ≥768; under reduced motion, and on the phone where no driver runs, it is
   0. In all cases `html { overflow-x: clip }` holds and the reachable
   `scrollX` is **0**, so nothing scrolls sideways. A single probe run reported
   0 at 1440 and two `shots.mjs` runs reported 575 at the same width: a stateful
   animated page needs the same run-count discipline as any other measurement.
