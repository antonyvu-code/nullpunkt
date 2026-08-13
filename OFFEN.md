# OFFEN — 07.08.2026, Punkt 2 nachgetragen 08.08.2026, Punkte 3–5 13.08.2026

What is left, why it is left, and who decides. Every number here was measured on
this machine with puppeteer against a real Edge, not read off a guideline.

The reference points throughout are Trionn and Dragonfly, measured the same way,
same wheel input, same viewport:

| | nullpunkt | Trionn | Dragonfly |
|---|---|---|---|
| Long tasks (60-step scroll) | 4 | 8 | 3 |
| Blocked main thread | 227 ms | 694 ms | 246 ms |
| Frame p99 | 47.2 ms | 83.3 ms | 30.5 ms |
| Frames delivered | 848 | 438 | 602 |
| **CLS** | **1.342** → 0.016 ¹ | 1.016 | **0** |
| will-change | 1 | 1153 | 6 |
| DOM nodes | 527 | 3193 | 3154 |
| Height | 13.4 screens | 28.3 | 15.3 |

Read that table honestly: nullpunkt is quieter than Trionn largely because it is
**six times smaller**, not because it is better built. Dragonfly carries the same
node count as Trionn and still lands CLS 0 — so scale does not force jank, and
nullpunkt's 1.342 is a defect rather than the price of ambition.

¹ CLS is the one figure that has moved since. Section 2 has the fix and the
numbers; the arrow is headless-to-headless, the 1.342 in the row is the original
headed run, and the two are not the same instrument. Every other cell is
untouched.

---

## 1 · The home page shows 6 of 12 projects — decided 13.08.2026

**Antony's call, taken 13.08:** six, ordered
`gutjahr-dachtechnik · rosi-ocean-co · one-bit · calibre · oscillate ·
mono-architekten`. Gutjahr comes back from the archive and Whitepace goes to it;
ROSI and Calibre join. The two leading cases are the two whose interesting part
is a constraint nobody chose — a real company's real site, and a template
runtime that wiped every registered ScrollTrigger on each render pass. The
specimen holds third, which is the middle of the run and the left of the middle
row. The reasoning, including the 30.07. decision this reverses, is written into
`lib/projects.ts` beside each flag rather than here.

Measured after: the pinned run is 3228px instead of 1937 (+67%, as predicted
from the card count), and the document is 15955px instead of 14664 — 1.4 screens
more page. That is the price of the density fix and it was taken knowingly; if
the run starts reading as long, `shelfOrder` is the knob, not the scrub.

The original entry follows, because the argument in it is what the decision was
made against.

### The original entry, 07.08.2026

**Biggest lever on this list, and the only one that is not a bug.**

Measured: 764 words over 13.4 screens is 65 words a screen. Trionn fills 28.3
screens with video; Dragonfly fills 15.3 with dense typography. nullpunkt fills
13.4 with 764 words and four cases, while `/work` holds twelve.

The header says OPEN TO ROLES & AGENCY WORK. Someone arriving from that line is
looking for evidence, and two thirds of the evidence is one click away rather
than in front of them. Enlarging the ABOUT type made the ratio worse, not better
— that was the right call for the claim and the wrong medicine for the density.

**Antony decides.** Which cases come forward, whether the shelf grows or a second
index appears under it, whether any of the eight uncatalogued ones deserve a
write-up. This is editorial work, not engineering.

*Answered above. Still open from this paragraph: whether any of the uncatalogued
Field Notes deserves a write-up.*

**And a correction to this file, 13.08.2026.** Calling this item "open" was
wrong on the day after it was written: `ZIELE.md` §7 closed the same question on
08.08 with "**không đề xuất lại**" — do not propose again. Two files said
opposite things about one decision, nobody reconciled them, and this one is the
file that was read. **When they disagree, ZIELE.md wins**, and the other file
gets corrected the moment the conflict is found. Before proposing anything that
touches the aesthetic, the structure or the scope, read `ZIELE.md` §7 and §9
first.

---

## 2 · CLS — fixed 08.08.2026, and the 07.08 attribution was wrong

**CLS 1.42 → 0.016.** Uncommitted, in `components/fx/ShelfTransport.tsx`.

### What it actually was

The FX.03 pin. `pin: true` on the body scroller defaults to `pinType: "fixed"`,
so at the pin's start ScrollTrigger switches `[data-transport]` from
`position: relative` to `position: fixed`, and back at the end. The layout-shift
observer sees a 1210×900 box — 82 % of the viewport — disappear and reappear
(`previousRect 0,0,0,0` → `1210×900`) and scores both moves.

Measured on the built page, 1440×900, the same 60-step wheel input:

| t | value | what changed |
|---|---|---|
| 5220 ms | 0.583 | `position: relative` → `fixed` (pin engages) |
| 6029 ms | 0.828 | `fixed` → `relative` (pin releases) |

1.4186 of a total 1.4371 — **98.7 %**. Everything else on the page together is
0.018.

### Why 07.08 named the wrong element

`[data-plate-edge]` is **0.0245**, not the cause. A `layout-shift` entry lists
*every* element that moved in that frame as a source, so summing per source
charges one 0.83 shift to the scan line, the progress beam and the transport
window alike — three "dominant" sources for one event. That is also why
disabling the beam moved the number by 0.013 and the conclusion "so the beam is
not it" felt contradictory: the beam was never it either.

**Attribute per ENTRY, with its rects, never per summed source.**

### The fix

`pinType: "transform"` on the shelf's ScrollTrigger. The element stays in flow
in the same pin-spacer and is translated instead of re-positioned; transforms
are excluded from layout shift by definition, so the two entries stop existing
rather than getting smaller.

Verified the pin is unchanged, not just quieter: through the traverse the
window's viewport `y` holds at exactly 0 while `scrollY` runs 1359 → 1696 and
the transform grows to match (361, 381, 415 …); `position` reads `relative` at
every sample and never `fixed`; travel still ends at `-1936`; document height
is 12063 before and after, so both pin-spacers are intact.

### What it costs

The pinned element now carries a transform, which makes it the containing block
for any `position: fixed` descendant — the trap this file's own FX.03 comment
documents, pointed the other way. Checked: nothing inside `[data-transport]` is
fixed; the header and the progress rule are siblings of `#main`. Anything fixed
put inside the shelf later will hang off this element instead of the viewport.

### What is left, and it is small

The remaining 0.016 is `[data-plate-edge]`'s `top` (0.0245 gross) and the
progress beam's `left` in `Chrome.tsx` — both still layout properties driven per
frame / twice a second. Under Google's 0.1 "good" line, so **not done, and not
proposed as urgent**. Antony's call.

### Method note — read before trusting a number in this file

- **Headed Edge cannot be driven on this machine.** A session is always running
  and every headed launch hands off to it and exits 0, `--user-data-dir` or not.
  These runs are **headless** Edge 151. Absolute values are therefore not
  comparable with the headed table at the top of this file; before and after
  were measured identically, and only that comparison is claimed.
- **Frame metrics are unusable headless.** rAF runs unthrottled — the harness
  reported 250–280 fps. Ignore p99, frames delivered and frames-under-30fps from
  any headless run.
- **Long tasks are noise-dominated here.** Across four batches of three runs the
  same build swung between 3 and 23 long tasks and 58–554 ms blocked, in both
  directions. No claim is made that this fix changed them. CLS, by contrast, sat
  at 1.401–1.440 without the fix and 0.0145–0.0188 with it across twelve runs.
- **`next start` survives `pkill` from the Bash tool.** A stale server kept port
  3000 while `.next` was rebuilt underneath it, served a 500 for a chunk that no
  longer existed, and produced a run with no GSAP at all — which reads exactly
  like "the fix killed the effect". Kill by port via `Get-NetTCPConnection` and
  check `--reg` is 1 before believing any before/after.

---

## 3 · Horizontal overflow — the item was wrong, the bug under it was real

**Closed 13.08.2026.** Two source changes, both verified below.

### The page has never scrolled sideways

`html { overflow-x: clip }` has been in `globals.css` since the first commit of
this site (`406feff`), so the sideways scroll this item predicted could not
happen. Measured on the built page: `documentElement.scrollWidth` equals
`clientWidth` at 1440 and at 375, and `window.scrollTo(2000, y)` leaves
`scrollX` at 0.

What the 575 px counted was **element** overflow inside boxes that clip on
purpose: the carriage, whose whole idea is stock running past both edges of its
window, and the capability rack, whose modules wait off the sides before the
scroll carries them in — `Rack.tsx` says so in its own header comment. At 375 px
the page carries exactly one overflowing element: an 8 px decoration 4 px past
the left edge.

So the item as written was not a defect, and the 71 elements were the effect
working. Left standing it would have cost someone a day of clipping things that
are supposed to hang over.

### What was actually broken: the browser scrolling the carriage on its own

Found while checking the above. `overflow: hidden` makes the carriage window a
scroll container that merely hides its bars — the browser stays free to scroll
it, and does, whenever it wants to bring a card into view that the traverse has
carried off the right edge. **Find-in-page is the everyday case:** Ctrl+F for a
word on a specimen that has not arrived yet.

Measured, 1440×900, built page, `scrollIntoView` on each of the four cards —
which is what find-in-page does:

| | `[data-transport].scrollLeft` | content column |
|---|---|---|
| before | 0 → 364 → 1009 → **1655**, permanent | in place |
| `overflow: clip` alone | 0 | **569 px left**, permanent |
| clip + the guard | 0 | in place |

The middle row is why the one-line fix is not the fix: clip stops the READER
scrolling an axis, it does not stop `scrollIntoView`. With the window no longer
a scroll container the browser simply walked further up and scrolled `<html>` —
which carries `overflow-x: clip` itself and still moved 569 px. The whole page
then stands 569 px left of where it belongs, for the rest of the session.

Both changes are therefore needed, and both are in:

- `globals.css`, FX.03 — `overflow: clip` on `[data-transport]`.
- `ShelfTransport.tsx` — a passive `scroll` listener on `document` and on the
  window that puts `documentElement`, `body` and the window's `scrollLeft` back
  to 0. A listener rather than a line in the focusin handler, because the
  browser's scroll-into-view is not ordered against ours.

Verified after, same instrument, `scrolled: []` in both modes:

- **Tab** through all four cards: each lands on screen at x ≈ 400, scroll runs
  3302 → 3947 → 4593 → 5238, nothing anywhere carries a scrollLeft. Unchanged
  from before the fix — the focusin handler was always doing its half correctly.
- **Find-in-page**: nothing moves, nothing is displaced.
- `track.scrollWidth - win.clientWidth` reads 1937 before and after, so the pin
  measures the same run it always did.

**What it costs, stated so it is not rediscovered as a bug:** find-in-page will
no longer travel the carriage to a specimen that is off screen. There is no
event naming the element the browser was reaching for, so the choice was between
a page that stays where it belongs and a run that silently breaks. Text on the
specimens the run has already carried past the head is still found normally.

### Method note, and it cost two wrong readings today

**The in-app browser pane does not composite.** No rAF, no rendering steps, so
scroll events are never dispatched and GSAP's scrub never advances. Anything
frame-dependent measured there is fiction: this session first "measured" the
keyboard traverse landing cards off screen and a scroll listener failing to
fire — both artefacts of a pane that was not rendering, both gone the moment the
same code ran in a headless Chromium that does. Measure timing and anything
scroll-driven in a real browser; use the pane for structure and computed style.

---

## 4 · Attributed, 13.08.2026 — and it is none of the four suspects

**The page is style-bound, not script-bound.** Of 6.17 s of main-thread task
time across a 60-step scroll, 3.11 s is style recalculation and 1.01 s is
scripting. The cause is that **`--accent` and `--deflection` are written to
`:root` on every frame**, and a custom property on the root invalidates style
for everything that could inherit it — which is the document.

Measured with the harness described below, 3 runs a condition, median, built
page, 1440×900, identical 60-step wheel input. `style/frame` is the honest
column: the conditions do not run the same number of frames.

| condition | task | style recalc | frames | style/frame | long tasks |
|---|---|---|---|---|---|
| everything on | 6.17 s | 3.11 s | 861 | **3.61 ms** | 2 |
| no `--accent` write | 5.49 s | 2.58 s | 1016 | 2.53 ms | 0 |
| no `--deflection` write | 5.72 s | 2.78 s | 949 | 2.93 ms | 0 |
| **no root custom-property writes at all** | 3.91 s | 0.44 s | 1234 | **0.36 ms** | 0 |
| Lenis destroyed, native scroll | 3.89 s | 1.93 s | 757 | 2.55 ms | 1 |
| `prefers-reduced-motion` | 0.39 s | 0.20 s | 1461 | 0.14 ms | 0 |

Per-frame writes counted over one run: `--deflection` 978, `--accent` 978,
`--passer` 135, `--schleier` 135. The first two are `AccentScroll.tsx` and run
every frame the page is scrolling.

**Neither one alone is worth removing, and that is the important line.** Drop
`--accent` and the recalc falls 30 %; drop `--deflection` and it falls 19 %; drop
both and it falls **90 %**, because whichever write is left standing invalidates
the same tree by itself. Any fix has to take both off the per-frame path or it
buys almost nothing.

### The four suspects, measured

- **Lenis** costs about a third of total task time (6.17 → 3.89 s) — but not the
  way this file guessed. Its own `raf` is **143 ms of the ticker's 2300 ms**. The
  cost is indirect: smooth scrolling produces a scroll update every frame, and
  every update walks ScrollTrigger and the scrubs behind it. Native scroll is
  cheaper because it asks for less, not because Lenis is slow.
- **The canvases are not the problem.** The hero (`Passer.tsx`) costs 3.7 ms a
  frame while it is on screen — real money — but it ran 163 frames of 861,
  i.e. it stops when it leaves the viewport exactly as SC3 requires. Removing it
  entirely did not move total task time outside noise (5.72 vs 6.17 s). Three's
  animation loop is 100 ms across the whole run.
- **The two scrubbed pins** are inside the ticker's 2300 ms, and the ticker's
  time is dominated by the style invalidation above, not by tween arithmetic.
- **`Chrome.tsx`'s permanent loop** is 42.7 ms total, 0.05 ms a frame — cheap,
  and still an SC3 violation. Worth knowing: its 500 ms-gated body carries the
  single largest one-frame spike of any loop on the page, **18.9 ms**, from the
  one `getComputedStyle` inside the gate.

### Two fixes that were tried and did NOT work

Both measured rather than reasoned about, so nobody spends the day again:

- **Quantising the writes** (`--deflection` rounded to 0.05, `--accent` written
  only on change): 3.61 → 3.31 ms/frame. Deflection genuinely changes by more
  than a step nearly every frame during a scroll, so almost nothing is skipped.
- **Pinning `--line` to a constant** — i.e. removing the one thing that reads
  `--deflection` — 3.61 → 3.24 ms/frame. So it is not the dependency that costs.
  **It is the write itself.** Chrome dirties the inheriting tree when a custom
  property changes on the root, whether or not anything reads it.

### 13.08, later the same day: it is the TRANSITIONS, and writing less does nothing

The section above says any fix has to take both writes off the per-frame path.
That was measured correctly and interpreted too narrowly. Three further runs:

- **Guarding the writes works and buys nothing.** With the guard skipping
  **989 of 996** `--deflection` writes and **973 of 996** `--accent` writes,
  style recalculation moved 3.75 → 3.28 ms/frame. Thirty writes are enough to
  keep the page fully animated, because each change starts a 450ms transition —
  2s on release — on hundreds of elements.
- **Registering the properties changes nothing.** `CSS.registerProperty` for
  `--deflection` (`<number>`, `inherits: false`) and `--accent` (`<color>`):
  3.60 vs 3.75. Option 2 below is answered — it is not the lever.
- **Turning every transition off, with all writes left in place**: 3.75 → 2.15.

So the cost is the running transitions, and the number that matters is how many
elements are in one. Measured by changing `--accent` with transitions off and
diffing every computed colour: of 920 nodes, **62 elements ever change colour**.
The rule `.accent-t *` was putting **360** of them into a colour transition.

**Shipped:** the descendant wildcard is replaced by a named list
(`[data-reg]`, `[data-plate-edge]`, the three Tailwind accent utilities, inline
`var(--accent)`), in the transition rule and in the `[data-accent-release]`
duration rule that shadows it. Verified: all 62 painters still transition, none
snap; elements carrying a live transition fall 614 → 404, colour transitions
378 → 160.

**What it bought, honestly: 2.89 → 2.74 ms/frame, long tasks 2 → 1.** Five per
cent, not the thirty-six an earlier ablation promised — and that ablation was
contaminated: injecting `.accent-t * { transition: none }` also removed the
transform/filter/opacity transitions on 222 descendants, which are hover and
reveal effects and have nothing to do with the accent. **A measurement that
disables a selector disables everything that selector carries.** The corrected
reading is that the per-element cost is small and the expensive thing is having
any transition running at all: 0 transitions is 1.69 ms/frame, 82 is ~1.9, 160
is 2.74, 378 is 2.89.

The change stays regardless of the five per cent, for a reason that is not
performance: `[data-accent-release]` set `transition-duration: 2s` through the
same wildcard, and `transition-property` initialises to `all`. Narrowing the
first rule without the second would have given 278 elements a two-second
transition on every animatable property — including the transforms GSAP writes
per frame.

### What that leaves, and it is Antony's call

The only lever that pays is getting both per-frame writes off `:root`. That is
not a mechanical change: `--deflection` is *the controlling variable* by design
(`globals.css` says so at length), and `--accent` being inherited from the root
is how the borrow reaches the whole page. Options, none taken:

1. Write them on the smallest subtree that consumes them. Cheap for
   `--deflection` if `--line` stops deriving from it — which means the hairlines
   stop breathing with the needle, and that is a look decision, not a perf one.
2. ~~Register both with `@property`.~~ **Measured 13.08: no effect** (3.60 vs
   3.75). Closed.
3. Accept it. **2.74 ms** of style a frame after the transition rule was
   narrowed leaves ~14 ms of a 60 fps budget, and the reduced-motion floor
   proves the page is correct when it matters.
4. **New, and the only remaining lever with real headroom:** shorten the window
   in which anything is transitioning. `--dur-release` is 2s, and the release is
   what keeps 160 elements animating long after the reader has moved on. Halving
   it would roughly halve that window. The asymmetry between taking (450ms) and
   letting go (2s) IS the effect, so this is the same kind of decision as 1 —
   which is why it is stated here rather than taken.

### The harness, and what its numbers are not

`probe.mjs` in this session's scratchpad drives the Chromium that ms-playwright
already installed, over CDP, from plain Node — no puppeteer, no new dependency.
It reports Chrome's own cumulative counters plus the time spent inside every
`requestAnimationFrame` callback, bucketed by the callback's own source, and can
no-op one bucket, one property, or Lenis to ablate it. If it is worth keeping it
belongs in `../messstrecke`, not here.

- **Headless, so rAF is unthrottled** — 861 frames in 6.8 s is not what a real
  browser does. Every absolute figure above is inflated by that. The claims are
  the **ratios between conditions**, all measured on the same instrument.
- Long-task counts are still noise at this sample size (0–2 a run). They are
  reported for continuity with the table at the top of this file and nothing is
  argued from them.
- `--skip=<substring>` matches the minified callback source of **this** build.
  It will need re-reading after any dependency bump.

---

## 5 · Toolchain, small and non-urgent

- **pnpm is pinned, 13.08.2026.** `"packageManager": "pnpm@11.18.0"` in
  `package.json` — the version this machine writes the lockfile with. Vercel was
  building the same lockfile with 10.28 and will now use 11.18 through corepack.
  `pnpm install --frozen-lockfile` and `pnpm build` are both green here; the
  first deploy after this is the one to watch, because it is the first time the
  hosted build runs the new version.
- **Deployment Protection is on for previews.** Preview URLs need a bypass token,
  so they cannot be sent to anyone. Fine while previews are only for us.
- **`next-env.d.ts` flips** between `.next/types` and `.next/dev/types` depending
  on whether `dev` or `build` ran last. Kept out of commits by hand so far.
- **`pnpm dev` can serve stale CSS** — already written up in `CLAUDE.md`. Append
  to `globals.css` and Turbopack may not invalidate it; `rm -rf .next` first,
  before assuming a change is broken.

---

## 6 · messstrecke

`../messstrecke`, private on GitHub, `pnpm dev` on port 5631.

- Nothing stale in the README or the index — checked, both already list all three
  Versuche as built.
- Not deployed anywhere. It is an internal Prüfstand, so that is probably right —
  but it means it cannot be looked at on a phone.
- The per-word reveal in Versuch 01 chapter 06 is the technique ABOUT did **not**
  take, on cost grounds. If a cheap per-word variant is ever wanted, that is
  where the experiment lives.

---

## How we work on this

Agreed 07.08.2026, after the `--deflection` episode — where I picked up a defect
nobody had assigned, fixed it, and tripled the blocked main thread without ever
putting the trade in front of Antony:

1. Unassigned work may be **proposed**, never just done. Ask, and explain it so
   the decision can actually be made.
2. Say what I am about to do **before** doing it, not after.
3. Name what a change could make **worse**, and measure that too. Measuring only
   the intended effect confirms nothing but the intention.
4. Deep technical record goes in the repo. The conversation stays readable.
