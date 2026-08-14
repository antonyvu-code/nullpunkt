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
| `shots.mjs` | what does the page look like at 1440 and at 390, with and without `prefers-reduced-motion` — plus an audit for content that is present but paints nothing |
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
4. **Headless rAF is unthrottled.** Frame counts and FPS from any run here are
   meaningless in absolute terms. Only compare conditions measured on the same
   instrument in the same session.
