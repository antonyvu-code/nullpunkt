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
happen. Measured on the built page: the page **cannot be scrolled sideways** —
`window.scrollTo(2000, y)` leaves `scrollX` at 0 — at 1440 and at 375.

*Corrected 14.08.2026.* This paragraph used to add "`documentElement.scrollWidth`
equals `clientWidth`", and that is not what holds. With six cases it reads 575px
wider than `clientWidth` at 1440 with motion on, and exactly equal with
reduced motion — i.e. the difference is the carriage traverse, which is the
overflowing-on-purpose content this section is about. `overflow-x: clip` stops
the axis from being scrolled; it does not shrink the reported content width.
The claim that was verified is the one now written above.

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
4. ~~**New, and the only remaining lever with real headroom:** shorten the window
   in which anything is transitioning. `--dur-release` is 2s, and the release is
   what keeps 160 elements animating long after the reader has moved on. Halving
   it would roughly halve that window. The asymmetry between taking (450ms) and
   letting go (2s) IS the effect, so this is the same kind of decision as 1 —
   which is why it is stated here rather than taken.~~
   **CLOSED 14.08.2026 — it is not a lever, because the release never runs.**
   See §7 below. Halving `--dur-release` buys exactly zero, and there is nothing
   here for Antony to weigh: the trade this option describes does not exist.

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

## 7 · The 2s release never runs — measured 14.08.2026

**`--dur-release: 2s` is dead at runtime on the page as it ships.** Not rare, not
hard to reach: unreachable.

`FieldNotes.tsx` opens `release()` with

```ts
const gemessen = useFx("accent-scroll") || useFx("notes-sweep");
…
if (gemessen) return;   // before data-accent-release is ever set
```

and every FX ships **on** — `lib/fx.ts` is `Object.fromEntries(FX.map(f => [f.id, true]))`.
The switches that could turn those two off live in a panel gated to
`NODE_ENV === "development"`, and the `np-fx` storage key was deliberately
neutered (see the comment above `useState(DEFAULTS)`), so in production nothing
can flip them. `gemessen` is therefore a constant `true`, and the guard returns
every time.

Measured on the built page, 1440×900, headless Chromium, pointer driven onto a
real field-note row and then off the list:

| | |
|---|---|
| hover landed | yes — `data-zeiger` up, `--accent` `#ceb830` → `#F0A72E`, the row's own stop |
| `data-accent-release` raised | **0×** |
| total time the attribute was up | **0 ms** |
| elements that *would* carry ≥1.5s if it were raised | 122 |

On letting go, `--accent` went to `#c8ba33` — the scroll sweep's own reading,
handed straight back at the normal 450ms. Which is exactly what the comment
inside `release()` says should happen while something is measuring, and it is
right to: a 2s transition on `--accent` while the sweep writes every frame makes
the whole sweep crawl. **The guard is correct. The problem is what it leaves.**

### What that costs, and it is not performance

The perf angle closes itself (§4 option 4 above). What is left is a documentation
defect in the one file a recruiter might read:

- `README.md` — "letting go returns it — slowly, through a `[data-accent-release]`
  attribute that stretches the transition to 2s". Describes behaviour the live
  site does not have. This is inside the accent-borrowing system, one of the four
  decisions the README exists to state.
- `globals.css` line ~106 — "letting go is slower than taking. That asymmetry IS
  the effect".
- `CLAUDE.md` — "the `[data-accent-release]` attribute (set in `FieldNotes.tsx`)
  stretches that transition to 2s".
- `FieldNotes.tsx` line ~137 says "the 1.2s release rule" — a fourth number, and
  the wrong one either way.

**Antony's call, and it is a design question, not a cleanup:**

1. **Let the asymmetry go.** Delete `--dur-release`, the two rules in
   `globals.css`, the `release()` branch and `RELEASE_MS`; correct README and
   CLAUDE.md. Honest, smaller, and the site loses a stated decision.
2. **Make it run.** The release only makes sense when nothing else owns the dial,
   so this means deciding the sweep does *not* own the dial after a deliberate
   hover — e.g. hold the borrowed colour for a beat before handing back. That is
   new behaviour, not a fix, and it has to be looked at before it is believed.
3. **Keep the code, correct the prose.** Say plainly that the slow release is the
   behaviour with FX.01/FX.05 off, and that the shipping default hands the dial
   straight back. Cheapest, and leaves a documented effect nobody can see.

Nothing has been changed. Option 3 is the smallest, option 1 is the most honest,
option 2 is the only one that gets the effect onto the live page.

---

## 8 · reduced-motion and the phone, looked at — 14.08.2026

First time either was seen rather than reasoned about. Built page, headless
Chromium, nine frames down the page per condition; contact sheet and every frame
in this session's scratchpad (`shots/index.html`).

| condition | doc height | overflow-x | content present but unpainted | headings |
|---|---|---|---|---|
| 1440 · motion | 15931 | 575 ¹ | 13 (below the fold, reveals not yet fired) | 17 |
| 1440 · reduced-motion | 10677 | 0 | **0** | 17 |
| 390×844 · motion | 15339 | 0 | 13 | 17 |
| 390×844 · reduced-motion | 13035 | **0** | **0** | 17 |

**The reduced-motion build is structurally sound.** No blank boxes, no reveal
stuck at `opacity: 0`, the full document outline intact, nothing overflowing.
The page shortens because both pins stop reserving their spacers, which is the
designed behaviour and not a loss of content.

¹ `documentElement.scrollWidth - clientWidth` reads 575, not the 0 recorded in
§3. §3's claim that the page never scrolls sideways still holds — `overflow-x:
clip` means the axis cannot be scrolled — but the *reported* content width does
exceed the viewport, and it does so only with motion on, i.e. it is the carriage
traverse. §3 measured four cases; there are six now. The wording there ("equals
clientWidth") should say "cannot be scrolled", which is what was actually
verified.

### Two things to look at, both Antony's

**a · The reduced-motion hero is the OFF-REGISTER frame.** `Passer.tsx` sets
`--passer` to `0.38` under reduced motion — deliberate, and the comment says why
("a composed still: plates apart, swarm already settled"; the host also drops to
`z-index: -10` so grain does not sit on the manifesto). Measured: `--passer 0.38`,
`--schleier 0.9543`, HUD reads **`REGISTER ▸ 2.3 px · OFF REGISTER`**. With motion
on at the top of the page it reads `0.0 px · IN REGISTER`.

So the reader who has reduced motion switched on sees exactly one frame of this
hero for the whole visit, and it is the frame where the three plates do *not*
line up — on a site named for the moment they do. The still is also markedly more
saturated: at 0.38 the dot field is magenta/yellow/cyan rather than the near-mono
field of the registered frame.

**Resolved the same day — 0.38 → 0.18, Antony's call after looking at three
rendered stills.** Rendering `--passer 0` is what settled it, and it showed
something no comment in the file had recorded: at 0 the plates converge and the
wordmark becomes *legible*, whereupon it sits behind the h1 and the two lines of
type compete. That collision — not the loss of the material — is the real reason
the still had never been at 0. 0.18 dissolves the wordmark enough to stop the
competition while keeping the field close to mono.

| still | HUD | field |
|---|---|---|
| `--passer 0` | 0.0 px · **IN REGISTER** | near-mono — but the wordmark fights the h1 |
| **`--passer 0.18`** ← shipped | 0.5 px · OFF REGISTER | close to mono, wordmark dissolved |
| `--passer 0.38` (was) | 2.3 px · OFF REGISTER | saturated magenta/yellow/cyan |

Verified on the built page, three consecutive runs: `--passer 0.18`,
`--schleier 1.0000`, `document.fonts.status` loaded, HUD `REGISTER ▸ 0.5 px`.

**The name is still not illustrated in this frame, and that is knowingly bought,
not overlooked** — only 0 reads IN REGISTER and 0 costs the headline. If the
collision is ever solved another way (the material sitting further back in the
still), 0 becomes available again and 0.18 should be revisited rather than
defended. The reasoning is written into `Passer.tsx` beside the number.

**b · The wordmark breaks up at 390px.** The halftone cell does not scale with
the viewport, so NULLPUNKT is rendered by too few dots per letter and reads as
`NJLLPJ.\KT`. It is the first thing on the page and it is the site's own name.
Measured only as an emulated 390×844 viewport; on a real phone the DPR is 3, so
this may look better there — **that is the reason to test on real hardware and
not a reason to change the cell size yet.**

Everything below the hero holds up on the phone: Werdegang, the specimen stack
and the plates are all legible and well spaced, and the sections that pin on
desktop correctly have no driver under 768px.

### Still not done

**No real device, and no machine without a GPU.** These are emulated viewports in
headless Chromium on a machine that has a GPU. The 60 FPS warning in `ZIELE.md`
§10d-bis stands untouched, and so does the wordmark question above.

---

## 9 · The page could end up half reduced — fixed 14.08.2026

Found because Antony turned the Windows setting off with the tab already open,
reported the page as janky, and sent screenshots that did not add up: the hero
showed the reduced-motion still while ABOUT ran its full depth effect and clipped
749px of heading off both edges.

**Components disagreed about WHEN they read the setting.** Everything on
`gsap.matchMedia()` — Rack, ShelfTransport, AboutDepth — re-evaluates whenever
the query changes and enables or reverts its context on the spot. `Passer.tsx`
read `matchMedia(...).matches` once inside its mount effect and never again.

Measured on the built page, flipping the media feature at runtime:

| | `matchMedia` | `--passer` | `data-about-stack` | pin-spacers | docHeight |
|---|---|---|---|---|---|
| loaded reduced | true | 0.18 | `""` | 0 | 11176 |
| **flipped to motion, before** | false | **0.18** ← stuck | `"on"` | 4 | 17282 |
| **flipped to motion, after** | false | **0** → 1.0 on scroll | `"on"` | 4 | 17282 |

The hero froze in a still frame belonging to a mode the rest of the page had
left. Neither mode designs for that, and the person most likely to reach it is
the one changing the setting to see what it does.

**Fix:** `Passer.tsx` holds the answer in state, seeded from a `change` listener
on the media query, and its build effect depends on it — so a flip tears the
canvas down through the cleanup that already existed and rebuilds on the other
side. `null` until the first client effect, because there is no `window` during
the prerender and building twice would rasterise the mask twice.

Verified both directions. Motion → reduced mid-page: `--passer` 1.0000 → 0.18,
`data-about-stack` cleared, pin-spacers 4 → 0, docHeight back to 11176, HUD back
to the still. Reduced → motion: `--passer` 0.18 → 0, and 1.0000 once scrolled.

**What this corrects in §8 above:** the ABOUT heading overflowing its viewport is
**not** a reduced-motion defect. Measured at 1920 by wheeling through the whole
section: reduced motion overflows by **0px**, motion on overflows by **749px**
with `data-about-stack="on"` and a `matrix3d`. That is the depth effect at full
scale and it is what Antony was looking at. Whether 749px of a sentence running
off both edges is the intended reading of that effect is a separate question and
has not been asked.

**And a method note that cost three runs.** `scrollIntoView()` does not drive
ScrollTrigger — the first attempts to reproduce this measured `data-about-stack`
as `""` in *both* modes and concluded the state was unreachable. It was simply
never entered. Scroll with real wheel events (`Input.dispatchMouseEvent`,
`type: "mouseWheel"`) for anything scroll-driven. Measuring an element box rather
than a text line box was the other wrong turn here: overflowing text still
reports its box as fitting, so `getBoundingClientRect()` said "fits" while the
glyphs were off screen. Use a `Range`'s client rects.

---

## 10 · Open: the page is janky on a high-refresh display

Antony reported real stutter. **Measured** from a 613MB DevTools trace he
recorded scrolling the built page on his own machine — 36.4s, home page, the
first frame-timing data this project has from real hardware.

### The display is 360Hz, and the compositor is not the problem

| stream | rate | median gap | p95 | p99 | worst |
|---|---|---|---|---|---|
| `BeginFrame` (Compositor) | **360/s** | 2.78 ms | 2.81 | 2.89 | 3.9 ms |
| `DrawFrame` (Compositor) | 249/s | 2.83 ms | 11.00 | 21.10 | 413 ms |
| `Commit` (renderer main) | 205/s | 3.33 ms | 17.94 | 32.06 | 59.3 ms |

`BeginFrame` never misses once: **0 of 13,094** gaps exceed 4.17ms. The display
asks for a frame every 2.78ms and the ask arrives on time, every time. The
renderer answers 205–249 times a second. **32.2% of renderer commits overrun a
whole frame, 12.8% overrun two, 5.1% overrun six.** That gap is the stutter.

### Where the 36.4 seconds went, on the renderer main thread

| | total | count | mean | max |
|---|---|---|---|---|
| `RunTask` (all main-thread work) | **29.6 s** | 45,207 | 0.66 ms | 57.1 ms |
| `PageAnimator::serviceScriptedAnimations` | 17.4 s | 7,445 | 2.34 ms | 47.3 ms |
| `FireAnimationFrame` | 13.0 s | **30,611** | 0.42 ms | 42.0 ms |
| `UpdateLayoutTree` (style recalc) | 8.4 s | 16,998 | 0.49 ms | 33.0 ms |

**The main thread is busy 81% of the wall clock.** rAF servicing alone averages
**2.34ms against a 2.78ms frame** — the frame is over before style recalc starts.
918 tasks run 8ms or longer; the worst is 57ms, which at 360Hz is 20 frames.

### Four rAF loops, every frame

30,611 `FireAnimationFrame` over 7,445 serviced frames — **4.1 callbacks per
frame**. Named from the chunks:

| callback | chunk | what it is |
|---|---|---|
| `t` ×1750 | `2mn-…` 115KB, `gsap`/`ScrollTrigger` | the GSAP ticker |
| `l` ×875 | `0z8npx…` 41KB, `lenis`/`passer`/`deflection`/`accent` | Lenis |
| `e` ×874 | `3y99w0…` **913KB**, `THREE`/`WebGPU`/`TSL` ×58 | **EchoProbe's Three.js render loop** |
| `L` ×486 | a chunk since rebuilt away | — |

EchoProbe is one decorative card and it is re-rendering a WebGPU scene at
display rate on a 360Hz monitor.

### The expensive recalcs are whole-document recalcs

The 40 worst style recalcs cost **716ms between them and touch 1,191 elements
each** — essentially the entire document, repeatedly. 1,191 is the signature of a
custom property written on `:root`, which is exactly the lever §4 named and left
open: `--accent` and `--deflection` (and `--passer`/`--schleier`) are written
there every frame, so every write invalidates everything that inherits them.

**Read the "what ran immediately before" attribution with care.** Style recalc
runs once per frame after all rAF callbacks, so whichever callback happened to be
last gets blamed — Three.js taking 21 of 40 says it usually runs last, not that
it dirties the tree. What dirties 1,191 elements is the `:root` write.

### What this changes

**At 60Hz none of this would show.** Mean renderer commit is 3.33ms against a
16.7ms budget. The site is comfortable on the hardware every number in this file
was taken against, and comes apart at 360Hz. That is the finding: not a
regression, a hidden assumption.

### It only stutters with reduced motion ON — which inverts the diagnosis

Antony's next report: the page is smooth with animations on and janky with them
off. That is the mode where nearly everything is supposed to stand down, so it
had to be measured rather than reasoned about. Instrumented by patching `rAF`
*before* any app script, so loops that capture the global at module init are
caught too:

| with reduced motion ON | before | after |
|---|---|---|
| rAF callbacks still running | 281/s across four loops | 286/s |
| time inside the GSAP ticker | 277 ms / 5.8 s | **119 ms** |
| all rAF callback time | 5.8% of wall | **2.9%** |
| `--accent` / `--deflection` written to `:root` | 29/s | **19/s** |

**Two things were wrong.** The `gsap.ticker.fps()` cap had been written *below*
`SmoothScroll`'s reduced-motion bail-out, so it never applied in the one mode it
was needed — the ticker is a global that AccentScroll and everything else gsap
drives are added to, whether or not Lenis exists. And `SmoothScroll` still had
the one-time `matchMedia` read that §9 fixed in `Passer`, so a page loaded under
reduced motion never started Lenis even after the setting was turned off, leaving
`gsap.matchMedia` scrubs running against raw native scroll. Both fixed.

**Why OFF feels worse than ON despite doing less work.** With Lenis the scroll is
interpolated, so a late frame is absorbed into the smoothing and the reader does
not see it. Without Lenis the scroll is native and direct: the compositor could
have handled it alone, but `--accent` and `--deflection` are still being written
to `:root` on every tick, and each of those invalidates the whole document. Every
main-thread hitch lands straight in the scroll. **Less work, more visible.**

**Two loops were measured and deliberately left alone.** `Chrome.tsx`'s costs
0.004ms per call, and it is the thing counting frames for the HUD's own FPS
readout — capping it would make that readout lie about exactly what is being
measured. Three's internal `Animation` keeps requesting frames after
`setAnimationLoop(null)` and costs 0.006ms per call; stopping it means reaching
into a private field. Neither is worth it at those numbers.

**Still unproven:** whether any of this is *felt* at 360Hz. Headless tops out
around 174–286fps and cannot report frame pacing (§2). The proof is a second
trace from Antony's machine — compare renderer `Commit` (was 205/s, 32.2% over
budget), mean `serviceScriptedAnimations` (was 2.34ms) and tasks ≥8ms (was 918).

### Second trace, and the sweep stood down

Antony recorded a second trace after the cap: *"less janky than before, but
still janky."* The numbers moved a long way and then stopped short.

| | trace 1 (11:33) | trace 2 (12:44) |
|---|---|---|
| main thread busy | 81.5% of wall | **22.8%** |
| `serviceScriptedAnimations` mean | 2.343 ms | **0.280 ms** |
| style recalcs | 16,998 | **1,923** |
| tasks ≥ 8ms | 918 | **57** |
| renderer `Commit` over 4.17ms | 32.2% | **3.2%** |
| renderer `Commit` rate | 205/s | **339/s** at a 2.77ms median |

**Read those as direction, not as a controlled comparison** — trace 1 was
recorded with motion running and trace 2 with reduced motion, so they are not
the same page. A clean pair would be two traces in one mode.

What was left: 57 tasks of 8ms or more with a **39ms** worst case — 14 dropped
frames at 360Hz, which is visible — and the 40 costliest recalcs still touching
**1,173 elements each**. That is the whole document, and it is the price of a
`:root` custom property: 1,173 elements inherit `--accent`, so every write
re-checks all of them. Under reduced motion it was still being written 19 times
a second.

**Antony's call: the accent sweep stands down under `prefers-reduced-motion`.**
The reasoning is worth keeping, because the sweep is not an obvious member of
that family — nothing about it moves. A colour changing continuously as the
reader scrolls is still something changing without them asking each time, which
is what the setting is for.

| with reduced motion ON | original | after the cap | **after standing down** |
|---|---|---|---|
| `--accent` / `--deflection` writes | 29/s | 19/s | **0/s** |
| all rAF callback time | 5.8% of wall | 2.9% | **0.9%** |

Motion mode measured unchanged: pins 4, `--passer` 1.0000, 65 writes/s, 22.8%.
**The pointer still works in both modes** — verified with reduced motion on:
accent at rest `#FF4A1C`, hovering a field note borrows `#F0A72E`, exactly the
row's own stop, and it returns to rest afterwards. Only the *scroll-driven*
borrow stops; a reader who points at something still gets an answer.

### A harness trap worth more than the fix

Every "motion on" run was silently measuring a reduced-motion page, because
Antony had left Windows' animation effects switched off and headless Chromium
inherits the host setting — the launch flag only ever adds `reduce`, never its
opposite. It showed up as `pins 0` and `--passer` parked at the still in a run
that had asked for full motion, which reads exactly like the change having
broken the site. `scripts/cdp.mjs` now states the preference in both directions
with `Emulation.setEmulatedMedia`. **Never infer a media state from the absence
of a flag.**

---

## 11 · The remaining jank is a hovering pointer, not the page — 14.08.2026

Antony, after the sweep stood down: *"still worst at FIELD NOTES; the other
sections maybe slightly and I can't tell for sure."* A third trace, recorded in
reduced motion, said the main thread was no longer the problem at all:

| trace 3 (19:06), 24.7s | |
|---|---|
| main thread busy | **6.1%** of wall |
| `serviceScriptedAnimations` mean | **0.093 ms** |
| style recalcs | **36**, 72 elements, **4 ms total** |
| tasks ≥ 8ms | **1**, and it is `CpuProfiler::StartProfiling` — the recorder |
| renderer `Commit` over 4.17ms | **1.9%** |

There are only 395 input events in those 24.7s, so most of the recording is
idle and the aggregate `DrawFrame` rate (7/s) means nothing. The page is doing
almost nothing, and it still stutters. So the cost is not JavaScript.

### It is the pointer sitting in the list while the rows scroll past it

Chrome's own tracing, run over one section at a time, 2.8s of wheel scrolling
each, reduced motion:

| section | pointer parked in the corner | pointer inside the section |
|---|---|---|
| | paint / recalc | paint / recalc |
| selected | 5.0 / 0.8 ms | **290.4 / 232.2 ms** |
| **field-notes** | 5.0 / 0.6 ms | **188.6 / 141.6 ms** |
| werdegang | 5.6 / 0.7 ms | 6.2 / 0.9 ms |
| capabilities | 5.0 / 0.7 ms | 6.0 / 0.9 ms |
| hood | 3.9 / 0.6 ms | 3.8 / 0.6 ms |
| about | 3.1 / 0.5 ms | 3.3 / 0.5 ms |

**Only the two sections with hover effects on large elements move, and they move
by 30–60×.** The other four do not notice the pointer at all — which is exactly
the shape of Antony's report. The mechanism: the cursor is still, the rows
travel under it, and each row entering and leaving `:hover` costs a style
invalidation and a repaint of a very large box.

This is not a reduced-motion problem. `motion-reduce:transition-none` stops the
transition; the state change still repaints. With motion on it is worse, because
then the transitions actually run.

**Why nothing found it earlier:** it is not main-thread JavaScript, and it only
appears when the pointer is inside the scrolling area. Every automated run in
this file had the pointer parked in a corner.

### Making hover cheaper does not work — measured, four conditions

| condition | paint | recalc | layerize |
|---|---|---|---|
| as shipped | 229.1 | 215.9 | 34.2 |
| accent colour change neutralised | 210.5 | 187.9 | 32.3 |
| translate neutralised | 223.7 | 208.0 | 33.4 |
| **both neutralised** | **206.8** | **178.9** | **31.2** |

Killing the colour change buys ~13% of the recalc, the translate ~4%, both
together ~17% — and **90% of the cost survives**. Every ablation was asserted
while hovering before its number was believed: the neutralised colour reads
`rgb(138, 135, 129)`, the neutralised transform reads `none`.

So the expense is not what hover *does*, it is that `:hover` *changes*. Tailwind
compiles `group-hover:` to `.group:hover .child`, so every toggle invalidates the
subtree to be re-matched whether or not any computed value ends up different. An
`!important` override changes the value, not the need to go and look.

**Which leaves one lever: stop `:hover` from resolving while the wheel is
moving** — `pointer-events: none` during scroll, restored shortly after it
stops. The cost is that scrolling past a case no longer borrows its colour; with
motion on the sweep already does that job, and under reduced motion Antony has
just decided the accent should not follow the scroll at all. Not implemented.

### Three harness faults found while measuring this, all now fixed

Each one produced a run that read as "the site is broken":

1. **The launcher attached to `chrome://new-tab-page/`.** `Target.getTargets`
   returns it as a page target, so taking the first one got the new tab about
   one run in three: `docHeight` 900, no sections, every reading empty. Now the
   filter prefers a non-`chrome://` target. Passing `about:blank` as a launch
   argument to guarantee one was tried and **hung**; the fallback is to take
   whatever page exists.
2. **The motion preference was only ever stated in one direction.** The launch
   flag adds `reduce` and nothing removes it, so with the flag absent headless
   inherits the host — and Antony had left Windows' animation effects off. Every
   "motion on" run was silently measuring a reduced-motion page. Now set
   explicitly both ways via `Emulation.setEmulatedMedia`.
3. **The page sometimes does not render for ~15s after load.** Cause not found.
   Runs now retry rather than reporting a zero, because a failed lookup and a
   real zero are indistinguishable in a results table — the first pass of the
   ablation above lost its baseline row this way and the surviving numbers would
   have been read as a result.

---

## 12 · It was never hover. It is one write of `--accent` on `:root`

§11 concluded that a pointer sitting in the list while rows scroll under it was
the cost, and that hover could only be made cheaper by ~17%. **That conclusion
was drawn from CSS-only ablations, and it was wrong about the mechanism.**
Every one of those ablations overrode what hover *painted* and left the
JavaScript untouched — and the JavaScript is the whole story.

`FieldNotes.tsx` calls `hold()` from `onMouseEnter`, and `hold()` does
`root.style.setProperty("--accent", hex)`. Each row crossing the stationary
pointer writes a custom property **on `<html>`**, and every element that
inherits it is invalidated. Blocking that one write at runtime, changing
nothing else:

| condition | paint | recalc | layerize |
|---|---|---|---|
| as shipped | 218.0 | 222.6 | 33.2 |
| **`--accent` write blocked** | **9.0** | **9.6** | **5.5** |
| `--accent` + `--deflection` blocked | 9.4 | 9.7 | 5.5 |
| every `:root` custom property blocked | 9.1 | 10.0 | 5.3 |

**Ten writes cost 96% of the frame budget in that section** — about 22ms each.
Blocking anything beyond `--accent` buys nothing, so it is that property alone.
`CLAUDE.md` already records that only ~62 elements ever change colour; 1,173
inherit the property. The invalidation is roughly nineteen times larger than the
effect it serves.

This is the same hot spot §4 named as "the remaining lever" and left open, now
measured exactly — and it is not confined to FIELD NOTES or to hover. SELECTED
writes it on card hover, which is why SELECTED measured worst of all. With motion
on, the scroll sweep writes it **60 times a second**.

### Five ways to make the write cheaper, all measured, four of them useless

| attempt | paint | recalc | verdict |
|---|---|---|---|
| baseline | 218.7 | 226.1 | — |
| `@property` registration (`syntax: "<color>"`) | 229.7 | 235.1 | no help, marginally worse |
| write on `<body>` instead of `<html>` | 233.6 | 229.7 | no help — body has nearly every element under it |
| write to the ~123 consuming elements instead | 231.2 | 235.9 | no help — the property still inherits, so each write invalidates that element's subtree, and now there are 123 of them |
| `contain: layout paint` / `will-change` / `translateZ` on the rows | 205–226 | 220–224 | ~10% at best; containment does not contain style invalidation, because Blink dropped `contain: style` |
| **write on `#field-notes` only** | **102.5** | **28.7** | recalc −87% — **but the rest of the page then stops borrowing the colour**, which is the site's one original idea |

The pattern is consistent: **cost tracks the number of elements that INHERIT the
property, and nothing else.** There is no cheap way to change a page-wide
inherited custom property. Scoping works and scoping is exactly what the design
forbids.

### What is left, and it is no longer an engineering question

- **Fewer writes.** Rejected: Antony does not want hover suppressed while
  scrolling, and the crossings are only ~3.5/s anyway, so throttling below that
  would visibly lag the borrow.
- **Fewer inheritors.** Measured impossible without giving up the page-wide
  borrow.
- **A smaller borrow.** If the accent reached the chrome and the section but not
  the whole document, the write could be scoped. That is a change to what the
  effect *is*, not to how it is built.
- **Accept it.** It costs ~22ms per hover crossing, which is invisible at 60Hz
  and visible at 240Hz+ with the pointer inside SELECTED or FIELD NOTES.

Nothing has been changed. Measured 14.08.2026, over the estimate given and
stopped there rather than continuing to spend.

Agreed 07.08.2026, after the `--deflection` episode — where I picked up a defect
nobody had assigned, fixed it, and tripled the blocked main thread without ever
putting the trade in front of Antony:

1. Unassigned work may be **proposed**, never just done. Ask, and explain it so
   the decision can actually be made.
2. Say what I am about to do **before** doing it, not after.
3. Name what a change could make **worse**, and measure that too. Measuring only
   the intended effect confirms nothing but the intention.
4. Deep technical record goes in the repo. The conversation stays readable.

---

## 13 · Baseline — measured 15.08.2026

The first baseline this project has had in one place. Built page, `next start` on
localhost, 1440×900, cold cache, counting stopped at `load`, `transferSize` read
from **inside the page** via Resource Timing. Five runs, **four valid**.

| | median | spread |
|---|---|---|
| transferSize at `load` | **483.7 KB** | 0 |
| requests at `load` | **22** | 0 |
| LCP | **1464 ms** | 1152 … 1544 |
| CLS | **0** | 0 … 0 |
| TTFB | 987 ms | 700 … 1036 |
| `load` | 1165 ms | 894 … 1213 |

Every run asserted itself before its numbers were believed: `location.href`,
`docHeight` **15931**, **4** pin-spacers, **17** headings, exactly one `h1`. One
run in five attached to the wrong target and was discarded — the trap
`scripts/README.md` documents, hit in both versions of the instrument.

**The first instrument was thrown away rather than quoted.** It counted bytes
from CDP `Network` events, which arrive from every target in the browser, and
produced a ±47% spread with one request count coming out **negative**. It also
reported LCP as `null` (`getEntriesByType` returns nothing for LCP — it needs a
`PerformanceObserver` with `buffered: true`) and CLS as `0` because the variable
was initialised and never observed. None of that failed loudly.

**Bytes are deterministic here, timings are not.** KB spread 0 against an LCP
spread of 392 ms. A byte figure can be quoted from one run; a timing figure
cannot. Caveat in the other direction: `overflowX` measured 0 in one probe run at
1440 and 575 in two `shots.mjs` runs at the same width — a page with animation
state needs several runs even for a "static" number.

**CLS 0 confirms `pinType: "transform"`** independently of the comment in
`fx/ShelfTransport.tsx` that records the 0.583 + 0.836 it replaced.

**P3 headroom is 16.3 KB.** One more webfont breaks the budget.

**The timings are an upper bound, not field data.** A fresh Chrome profile per
run plus a local server put ~987 ms into TTFB alone; production measured 69 ms on
08.08. With no analytics there is no CrUX and nothing to validate against — which
is why testing on a real phone, a real tablet and a GPU-less machine is not a
nicety, it is the only substitute available.

**Measuring script:** it lives in the session scratchpad, not in `scripts/`.
Whether measurement scripts move into the repo as regression tests is still
Antony's open decision (ZIELE §10d-bis), and two Playwright scripts have already
been lost that way.

---

## 14 · The third quadrant — tablet, first measured 15.08.2026

The site gates **motion on width** (`min-width: 768px` in `Rack`,
`ShelfTransport`, `AccentScroll`) and its **accent probe on hover**
(`@media (hover: none)` in `globals.css`). Those are two different axes, and a
tablet is where they disagree: wide enough for both pins, with no hover to drive
the index.

**Resizing a window does not make a touch device.** Measured against
`about:blank`:

| | hover | pointer |
|---|---|---|
| 1440 | hover | fine |
| 820, width changed only | hover | fine |
| 820 + `mobile: true` | hover | fine |
| 820 + touch emulation | **none** | **coarse** |

So every "responsive check" done by resizing — including this repo's own phone
conditions in `shots.mjs` — had been testing a **narrow desktop**. The
`[data-probed]` path, the entire substitute for hover on touch, had never once
run. That includes the reduced-motion review of 14.08.

`scripts/cdp.mjs` now takes `touch: true`, and every launch asserts its own
quadrant before returning. `shots.mjs` runs six conditions:

| condition | hover | ptr | docHeight | overflowX | headings |
|---|---|---|---|---|---|
| Desktop 1440 · motion | hover | fine | 15931 | 575 | 17 |
| Desktop 1440 · reduced | hover | fine | 10677 | 0 | 17 |
| Tablet 820×1180 portrait | none | coarse | 18954 | 468 | 17 |
| Tablet 1366×1024 landscape | none | coarse | 17730 | 548 | 17 |
| Phone 390×844 · motion | none | coarse | 15339 | 0 | 17 |
| Phone 390×844 · reduced | none | coarse | 13035 | 0 | 17 |

**17 headings in all six** — the structure holds in every quadrant, which was
never demonstrable before.

**`overflowX` is a motion artefact, not a tablet bug.** 468–575px wherever the
drivers run, 0 on the phone (below 768, no driver) and under reduced motion. The
elements crossing the right edge are `[data-transport-track]` and its contents,
+1798px, each clipped by its own container; `html { overflow-x: clip }` holds and
the reachable `scrollX` is **0** at every width. Nothing scrolls sideways.

**The gate itself — decided 15.08.2026: leave it, wait for a real device.** An
iPad with no keyboard currently gets the **full pin machinery**, because it is
≥768 wide. The comment in `Rack.tsx` states the intent as *"reduced motion and
the phone get no driver"*, but `min-width: 768px` means *"not the phone"* — so
the tablet is included by default rather than by decision, and a tablet is also
the device most likely to thermally throttle under a 4545-particle hero running
continuously.

Antony chose not to change it until a real tablet has been looked at. That is the
hard law applied to itself: **no fix before a measurement**, and everything known
about this cell so far comes from emulation, which has already been shown to lie
in both directions at 390. The candidate change, if the device says so, is one
media-query condition — gate on `pointer: fine` instead of, or as well as, width.

---

## 15 · Ship checklist — moved here 15.08.2026

This list lived in `ZIELE.md` §10c-bis until today. It is project work, not a
personal goal, and ZIELE is neither: it holds the career target and the protocol
Antony and I work by. Moving it keeps that file to what only the two of us need.
ZIELE now carries a one-line pointer to here.

### State as measured 13.08.2026

- `https://nullpunkt.vercel.app` returns **404** — not blocked behind a login,
  **no alias points at that address at all**. This matches the 08.08 decision to
  go dark, but it is a different mechanism than "still running behind auth".
- The newest **Production** deployment was four days old (`jc8jgsuo9`). Five
  commits from 13.08 — the carriage, six cases, the transition, the OFFIZIN
  typefaces — exist **only as protected previews**.
- pnpm pinning passed its first test: Vercel read `packageManager` and built with
  **v11.18.0**, 35s, green. But the log states the lockfile was produced by
  **pnpm@10.x** — 11.18 reads it without rewriting it. The real test is the first
  `pnpm install` that rewrites the lockfile in 11.x format.
  **Wrong, and disproved 17.08.2026 — there is no 11.x format.** See §17.

### Before the Bewerbung goes out (~08.09.2026)

- [ ] **Bring `nullpunkt.vercel.app` back up (alias).** This is the address that
      goes in the email.
      **Decided 15.08.2026 — stay dark until close to the send date.** Two things
      settled today and not to be re-asked: the 404 is **not** Deployment
      Protection, it is a missing alias; and on **Hobby, Vercel Authentication
      does not protect production** (previews and deployment URLs only), so
      "locking the main page" was never an option that existed.
- [ ] **Return the GitHub repo to public.** `antonyvu-code/nullpunkt` was set to
      **PRIVATE** on 15.08.2026: keeping the site dark while the source stayed
      public only covered half, and the hidden half is the half that makes the
      impression — the first 50ms, the hero, the scroll. Reverse with
      `gh repo edit antonyvu-code/nullpunkt --visibility public
      --accept-visibility-change-consequences`. **Existing forks were detached and
      do not reattach.** The other 27 repos are unchanged.
      *This must go back to public before sending: a private repo is not evidence
      an agency can read, and `OFFEN.md` — a logbook that records the faults of
      its own instruments — is the rarest thing in this portfolio.*
- [ ] `vercel deploy --prod`, or better `vercel promote <preview-url>`: promoting
      re-points the alias **without rebuilding**, so what ships is the artifact
      that was verified rather than a fresh build of the same source.
- [ ] **A real phone.** ~10 minutes, the device is already here, **not deferred**.
      It is the most likely device a recruiter opens the link on; DPR 3 settles
      the one open question — the NULLPUNKT lettering breaking into visible grain
      at an emulated 390×844 (§8b) may resolve itself, so **do not fix the
      halftone before looking**; and it is the worst thermal case. Scroll the
      whole page, wait a few minutes, scroll again: throttling only appears after
      ~15 minutes of continuous use, and the hero is 4545 particles running the
      whole time.
- [ ] **A machine without hardware acceleration.** One command:
      `chrome --disable-gpu` on this machine. Not identical to a weak machine, but
      far closer than headless SwiftShader, which produced **10/4 FPS** where
      Chrome with a GPU gives 60.
- [ ] **A real tablet — deferred on condition, 15.08.2026.** The only item that
      needs hardware that may not be here. Condition: *when a device is available,
      or **an explicit, written acceptance of the risk before sending***. What is
      being accepted: the tablet cell (≥768px **and** `hover: none`) currently
      takes the full pin machinery **by default rather than by decision** — §14.
- [x] ~~**Run `pnpm install` once** so the lockfile moves to 11.x format, then
      rebuild. Do not let that first run land on the day of sending;
      `ERR_PNPM_OUTDATED_LOCKFILE` is a common build failure and it would fire at
      the most expensive possible moment.~~ **Done 17.08.2026, and the item was
      built on a false premise — §17.** Ran, nothing to migrate, the risk it was
      guarding against does not exist. Four items in the last week, not five.
- [x] ~~Look at the `prefers-reduced-motion` build **by eye**.~~ **Done
      14.08.2026.** Structure sound: 0 elements carrying content that paints
      nothing, 17 headings, no horizontal overflow, at both 1440 and 390. Static
      hero settled at **`--passer 0.38 → 0.18`** — see §8a.

### ⚠ The timing risk, larger than any single item above

The final week before ~08.09 has accumulated **four things that have never once
run**: bringing the alias back · returning the repo to public · `pnpm install` on
the 11.x lockfile · and the device tests. That is exactly the risk `ZIELE.md` §9
names — **piling N never-run tasks into the last week** — and the list grew by one
on 15.08 purely as a consequence of a decision to hide.

**Antony decided 15.08.2026 not to fix a date**, keeping "close to the send date".
The cost, stated and accepted: nothing schedules these, so the default is that
they all land in the same week, and the first failure of any of them has no buffer
behind it. The cheap two — the phone and `--disable-gpu` — are not blocked by any
of this and should simply be done in the next session.

**17.08.2026 — down to two, and one of them was never a task.** `--disable-gpu`
ran on 15.08 (§16) and `pnpm install` ran today (§17), where it turned out there
was nothing to migrate. What is left that has never run: **the alias**, **the
repo going public**, and **the phone** — and the phone is ten minutes with a
device that is already in the room. Two of the four were retired by doing them
early, which is the whole argument for doing the cheap ones out of order.

---

## 16 · No hardware acceleration — measured 15.08.2026, and it found a real defect

`chrome --disable-gpu` against the built page. **The flag was proved, not
assumed:** the unmasked WebGL renderer goes from
`ANGLE (NVIDIA, NVIDIA GeForce RTX 5070 Ti, D3D11)` to **no WebGL context at
all**. That is harsher than a weak GPU — it is no GPU stack whatsoever.

### Frame times through the hero

One instrument, one session, 45 wheel steps from the top. Headless rAF is
unthrottled (`scripts/README.md` trap 4), so these are **ratios, not fps a
reader would see**.

| | GPU | `--disable-gpu` | |
|---|---|---|---|
| median frame | **2.8 ms** | **16.7 ms** | 6.0× |
| p95 frame | 25 ms | 50 ms | 2.0× |
| worst frame | 191.6 ms | 83.4 ms | *better* |
| frames > 33 ms | 10 / 603 (1.7%) | **78 / 249 (31%)** | 18× the rate |
| frames > 100 ms | 1 | 0 | |

**The page does not break.** Same `docHeight` 15931, scroll works, `--passer`
still reaches 1.0000, 17 headings. It is *slower*, not *wrong*: a median frame
costs 16.7ms, which is the entire 60Hz budget with nothing left over, and roughly
a third of frames miss it.

**The worst frame is better without the GPU**, which is the opposite of the
expected result and worth keeping: the GPU path has one 191ms stall — a single
upload or first paint — while the software path is uniformly slower with no
catastrophic hitch. Smoothness and peak latency are not the same axis.

### The defect: EchoProbe throws and leaves an empty box

Scrolling the whole page — which the frame-time run never did, it only reached
7193 of 15931px — wakes `EchoProbe`. With no GPU:

```
[warning] THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.
[throw]   TypeError: Cannot read properties of null (reading 'getSupportedExtensions')
```

Three.js falls back from WebGPU to WebGL2 exactly as designed, then dereferences
a **null** context, because WebGL2 is not there either. The canvas stays at its
default **300×150 intrinsic** (never initialised; 631×394 on the GPU run) and
paints nothing. On the GPU run: **0** console errors.

So a reader without hardware acceleration gets a **632×395 empty rectangle**
where README promises *"One card renders live instead of from a screenshot"* —
one of the five decisions the project is presented on.

**The craft floor has no rule for this.** M4 requires a composed still frame for
`prefers-reduced-motion`; nothing covers *the GPU is absent*. Those are different
conditions and only one of them is currently designed for.

### Fixed the same day — crash only, appearance still open

Antony's call: stop the crash, leave what the card *shows* for later. Two guards
in `EchoProbe.tsx`, and **the first one had to be written twice**:

1. **A backend check before the dynamic import**, so a machine that cannot use
   the card does not download 252KB to find out. The first version gated on
   `"gpu" in navigator` — which looks right and is worthless: under
   `--disable-gpu` the property is still there (the interface exists, the adapter
   does not), so the gate passed, the chunk came down, and the renderer warned
   and threw anyway. Measured after that attempt: **the throw was gone, the
   download was not**, and the comment claiming otherwise was wrong. The gate is
   now a real context on a throwaway canvas — `webgl2 || webgl`. Both backends
   come off the same GPU stack, so no WebGL means no adapter either.
2. **`try/catch` around `new WebGPURenderer` and `init()`**, because a present
   adapter interface still does not promise a working one, and the WebGL2
   fallback throws rather than returning.

**Verified, `pnpm build` green:**

| | GPU | `--disable-gpu` |
|---|---|---|
| console errors/warnings/throws | 0 | **0** (was 2, then 1) |
| hero canvas | 1440×900, painted | 1440×900, painted |
| ECHO-1 canvas | 631×394 | 300×150, empty |
| headings | 17 | 17 |

The card is still an empty 632×395 box without a GPU — silent now, but empty.
**What it should show instead is open** and is Antony's decision: a static plate
of a rendered frame, a composed still drawn in Canvas 2D in the same language as
M4, or no card at all. Note that hiding it collides with the spirit of M2
(a degraded mode must not lose content).

### Closed 17.08.2026 — it falls back to PLATE A

Not a fourth option, the cheapest of the three: the cell hands itself to the
case's **own PLATE A**, so the specimen degrades into exactly what the other
four cards on the shelf already are. No new visual language, no drawing to
maintain, and M2 is satisfied because the content is not lost — the reader gets
the same thing the case page would give them.

It reads as a decision rather than as a patch for one reason: `one-bit-a.jpg` is
captioned *TWO COLOURS AND ONE BIT PER PIXEL*. The dither the probe computes in
real time arrives as a photograph of the dither it was computing. A machine that
cannot run the press gets the plate.

- `lib/gpu.ts` now holds the one probe, because two places need the same answer
  and must not disagree: EchoProbe, which enforces the 252KB refusal, and
  Selected, which decides what the cell shows.
- **Live first, then fall back.** The prerender and the first client paint are
  the canvas for everybody; an effect steps down to the plate. Seeding it the
  other way would cost every reader with a GPU an image request for a plate they
  never see, and the prerendered HTML has to be one HTML.
- Nothing moves in the swap — `[data-plate]` fixes the cell at 16:10 and both
  branches fill it absolutely, so §13's CLS 0 is not spent here.

**Verified, `pnpm build` green, both conditions in one session at 1440×900:**

| | GPU | `--disable-gpu` |
|---|---|---|
| unmasked renderer | RTX 5070 Ti / D3D11 | **no WebGL context** |
| specimen cell | canvas 631×394, tumbling | **PLATE A, painted** (`w=750`) |
| console errors/warnings/throws | 0 | 0 |
| chunk requests | 19 | **16** |
| docHeight · headings | 15931 · 17 | 15931 · 17 |

### The instrument said "in view" while the card was 255px off the right edge

Worth more than the fix, and the same family as trap 5. The first three runs
reported the plate as **loaded into the DOM and never painted** — `currentSrc`
empty, `naturalWidth` 0 — which reads exactly like a broken image, and the
cropped screenshot backed it up by coming out black.

Both readings were the instrument. The arrival test checked `top` and `bottom`
only; at the scroll position it settled on, the specimen sat at **x 1695…2326**
in a 1440 viewport, because FX.03 turns that shelf into a carriage and the card
was still out on the track. `IntersectionObserver` said `isIntersecting: false`,
so Chrome was *correctly* refusing to load a lazy image that was off screen. A
hand-written `fetch` of the same URL returned **200 in 65ms** — which is what
proved the server, the file and the path were all fine and the test was not.

The black crop was a second, independent fault: CDP `Page.captureScreenshot`
takes its `clip` in **document** coordinates, and it was being handed
viewport-relative ones from a page scrolled to 4400px, so it photographed a
patch of the hero.

**On a page with a horizontal carriage, an in-view test that checks one axis is
not an in-view test.** Now in `scripts/README.md` as trap 7.

### ⚠ Check the plan before clicking

The team name `atv1989info-4591's projects` is auto-generated and is most likely
**Hobby**. Documentation confirms Hobby protects previews and deployment URLs
only; production domain protection needs **Pro or Enterprise**. Verify the plan
before changing anything — a wrong move on Vercel is hard to take back.

---

## 17 · The lockfile migration — ran 17.08.2026, and there was nothing to migrate

The checklist carried this as one of the four never-run items, with a named
failure it was there to prevent: `ERR_PNPM_OUTDATED_LOCKFILE` firing on the day
the Bewerbung goes out. It rested on a line in the Vercel build log saying the
lockfile was produced by **pnpm@10.x**, read as "this file is in an old format
and the next install will rewrite it".

**There is no 11.x lockfile format.** `pnpm install` reported *Already up to
date* in 381ms and changed **nothing** — `git status` clean, the header still
`lockfileVersion: '9.0'`.

That could have been pnpm declining to touch a file it considered good enough,
so it was tested rather than assumed: a **throwaway directory with nothing but
this `package.json`**, resolved from scratch with `pnpm install --lockfile-only`.
pnpm 11.18.0 writes **`lockfileVersion: '9.0'`** when it has no lockfile to be
polite about. 9.0 *is* the current format; pnpm@10 and pnpm@11 both write it.
The build log was naming which pnpm last touched the file, not which format the
file is in.

**And the risk itself does not exist here.** The exact command a Vercel build
runs — `pnpm install --frozen-lockfile` — was run against this repo: **exit 0**,
*Already up to date*. That is the failure mode the item was guarding against,
executed on purpose, passing. `pnpm build` after it: green, 32 routes.

**One thing worth keeping, and it is the opposite of a worry.** The fresh
resolution in the throwaway directory is **not** the same tree as the one in the
lockfile: `@tailwindcss/*` 4.3.2, `@types/react`, `@types/react-dom`,
`@types/three` and `@emnapi/runtime` all resolve to newer patches today, because
`package.json` carries `^` ranges on them. The lockfile is what stops that drift
from reaching a build. So the danger was never a stale lockfile — it is
**deleting** the lockfile, or running `pnpm update`, in the last week. Neither is
on any list, and neither should go on one before the send.

*Noted, not acted on:* pnpm offers 11.18.0 → 11.22.0. `packageManager` pins
11.18.0 and Vercel reads that pin, so the local and remote builds currently agree
about the version. Upgrading three weeks before sending would trade a working
agreement for a newer number.

---

## 18 · The shelf card now says what it is — and one window height pays for it

Written 17.08.2026. `lib/projects.ts` has carried `label`, `year`, `role` and
`oneLiner` on every case since the start; the shelf printed the `kind` and
nothing else. Six cards answered *what is this* with a category and left *whose
idea was it*, *when*, and *what did he do* to a click.

The sharper half: **all six front-page cases are `LAB`** — self-initiated,
nobody commissioned them. Gutjahr, which `ZIELE.md` §7 calls "a real company's
real site", is in the data an *unsolicited redesign study*: the company is real,
the brief was not. The page was not saying so. On a site whose logbook records
the faults of its own instruments, the front page was the one surface still
quiet about the inconvenient fact.

The card now reads `LAB · 2026 · CONCEPT & BUILD`, the title, and the case's own
one-liner — which was already written honestly ("not a client brief", "concept
brand", "a fictional Berlin architecture studio") and was only ever visible one
click in.

### What it cost, measured, and what is still open

The pin anchors the card **84–155px from the top of the window**, so card height
is a hard budget, not a preference. First version gave `role` a line of its own:
**751px**, and VIEW CASE fell off the bottom of every window under ~850.

| window height | card 612 (before) | card 751 (first try) | card 675 (shipped) |
|---|---|---|---|
| 900 | fits | +33 spare | **+72 spare** |
| 820 | fits | **cut 14** | **+31 spare** |
| 768 | fits | **cut 66** | **+6 spare** |
| 720 | +24 spare | **cut 114** | **cut 38** |

Fixed by folding `role` into the meta line in place of `kind` — the one-liner
restates the kind anyway ("WebGL proof" against "a personal technical
experiment") and never states the role — and by setting the one-liner at 0.82rem
on a 52ch measure. 44ch is the better measure on paper and cost a fourth line on
four of the six cards; the pin has no fourth line to give.

### The one-liners were cut, and 720 was accepted — both 17.08.2026

All six were over two lines, not three of them: 181, 160, 152, 140, 115, 105
characters. They are 98–108 now and **all six measure exactly two lines at
52ch**, checked on the built page rather than counted by hand. The words kept
are the honest ones — *not a client brief*, *invented*, *a fictional Berlin
architecture studio*, *on spec* — since those are why the line is on the front
page at all. Calibre and One Bit carry German copy and were cut with them, or
the DE card would run three lines where the EN card runs two.

Card 675 → **662px**: clears 900 (+78), 820 (+38), 768 (+12).

**720 still cuts 25px, and Antony accepted it.** What is left is not in the text
— it is the card's own padding, and buying it back means tightening the caption,
the header strip and the filled button on all six cards at once. Two things made
the trade easy: the whole card is a `<Link>`, so a clipped VIEW CASE strip costs
an affordance and not the destination; and a real 1366×768 laptop leaves roughly
650px of viewport, which **the original 612px card never served either**. This
is a pre-existing edge made 50px worse, not a new class of failure.

---

## 19 · UNDER THE HOOD was neither aligned nor full bleed — fixed 17.08.2026

Antony's eye, then the measurement. S.05 was the one section whose width read
wrong, and it was not the text: measured at 1440, **every** section's content
starts at 115 including this one. What was wide is the `--surface` band, which
ran **72 → 1368** — 43px past the text on each side and still 72px short of the
window.

`--bleed` is `clamp(1.25rem, 3vw, 4.5rem)` = 43px at 1440, while the page margin
`--gutter` is 8% = 115px. So the band bled to a value smaller than the margin it
was bleeding out of: not on the page's grid, not on the window's edge, on
nothing. Every other rule here is on a stated scale — the hero readout prints
POS 08% / 92% out loud — which is why 43px of overhang read as *slightly too
wide* rather than as a decision.

**Full bleed, and the number is derived.** The obvious fix is the trap
`globals.css` already documents: `--gutter` is 8% *of the page*, but a negative
margin on a child of `<main>` resolves against **main's content box**, so `-8%`
gives 96.8px and leaves an 18px sliver. Main's content is 84% of the page, so
the same distance against it is **8 / 0.84 = 9.5238%** — a percentage of the
same page width, therefore exact at every window size. `vw` was rejected for the
reason `globals.css` gives: it counts the scrollbar.

Verified at five widths, band vs window and hood's text vs a normal section:

| width | band | hood text | other section | overflowX |
|---|---|---|---|---|
| 1440 | 0 → 1440 | 115 | 115 | 0 |
| 1280 | 0 → 1280 | 102 | 102 | 0 |
| 1024 | 0 → 1024 | 82 | 82 | 0 |
| 820 | 0 → 820 | 66 | 66 | 0 |
| 390 | 0 → 390 | 31 | 31 | 0 |

If `--gutter` ever moves off 8%, 9.5238% has to move with it. It is derived, not
chosen, and the comment in `app/page.tsx` carries the derivation.

---

## 20 · The shelf was inert on the machine it was designed for — 17.08.2026

Antony, scrolling with the pointer parked outside the section: the six cards do
not change and no plate develops. Two separate faults under one symptom, both
found by measurement, both older than today.

### One: the develop pass was gated to touch devices

```css
@media (hover: none) { [data-probed] { --scan: 1; } }
```

The stated reason was that where a pointer exists hover already answers this,
and developing on scroll as well would put *"four passes on screen for a gesture
the reader did not aim"*. **The premise was false.** `AccentScroll.probe()`
removes `data-probed` from the previous element before setting the next, so it
has always been on exactly ONE element at a time. There were never four passes.

What the gate actually bought: a shelf that sat completely inert on a desktop
unless the pointer happened to be inside it. The page borrowed the colour, the
chrome changed — and the six cards it was borrowing *from* showed nothing. FX.03
exists to argue that the wheel drives the probe and the pointer is not the only
way in; the stylesheet was denying it on every device that has a wheel.

Measured after, pointer at the window's corner, scrolling the pinned run:

| scroll | accent | cards lit | which |
|---|---|---|---|
| 3800 | #F5901E | 1 | ROSI Ocean Co. |
| 4400 | #4CE04C | 1 | One Bit From Home |
| 5000 | #C8A24B | 1 | Calibre |
| 5600 | #FF4A1C | 1 | OSCILLATE |

### Two: the shelf's hover-borrow never actually held

Pointing at a card that is *not* the one being measured exposed it: the hovered
card lit up **wearing the measured card's colour**. `AccentScroll` re-applies on
every scroll update and, while the carriage is on screen, **on every tick**, so a
colour written by `Selected`'s hover was overwritten within a frame.

The mechanism to prevent exactly this already existed and the shelf was not
using it: `FieldNotes` raises `data-zeiger` on `<html>` and `AccentScroll`
refuses to write while it is up — *a reader who is pointing has said what they
want read, and no measurement gets to argue*. `Selected` now raises and lowers
the same flag, in the same order (flag first, then the colour). One mechanism,
not two.

This was never visible before because the plate did not develop on desktop, and
because probe and pointer usually agree about which card is in the middle.

### Verified, full cycle, and the stuck-flag case FieldNotes hit first

| step | data-zeiger | accent | lit |
|---|---|---|---|
| before hover | false | #C8A24B | Calibre |
| hovering another card | **true** | **#4CE04C** | One Bit From Home |
| pointer leaves the list | false | #C8A24B | Calibre |
| scrolling on | false | #FF4A1C | OSCILLATE |

Never more than one card lit in any state. An unmount cleanup lowers the flag as
well, because a reader who clicks a card with the cursor still inside it would
otherwise hand `/work` a document with `data-zeiger` up and no shelf left to
lower it — every scroll-driven borrow on that page would stand down for good.

Phone (390, touch): unchanged, all six develop in turn, never more than one.
Desktop reduced-motion: **0 cards ever develop** — the same as before this
change, since the gate never let desktop through at all. Whether a reduced-motion
reader should get the pass at all is a separate question and is not answered
here.

---

## 21 · The pinned block was always one header too tall — fixed 17.08.2026

Antony, from a 1904-wide window: during the run in SELECTED the section's name
and number are not there. Screenshot showed them half-eaten by the fixed bar.

**Two causes, and the second only shows on wide monitors.**

1. `ShelfTransport` pinned with `start: "top top"` and the window is
   `min-height: 100svh`, so the pinned block's top edge went to the viewport's
   top edge — behind a header that is `fixed` over it. The block was therefore
   **always exactly one header taller than its room**, at every width. At 1440
   there was enough slack in the block for that to go unnoticed.
2. `--carriage-card: 44vw` is a ratio with no ceiling, and the plate is locked
   to 16:10, so the card's **height** grew with the monitor: 634×662 at 1440,
   838×790 at 1904, and it would have been 1126 wide at 2560. At 1904 the card
   alone nearly filled the window and the heading was what got pushed out.

Measured before: heading at top 46 against a header bottom of 57 — eaten by
11px, with `S.01 / 07` eaten by 23.

**And today's own work made it worse.** Putting the one-liner and the meta line
on the card (§18) added ~50px of card height, which is ~50px the heading no
longer had. The defect predates it; the visibility does not.

### The header now publishes its own height

`--kopf`, written by `Chrome.tsx` from a `ResizeObserver`. It cannot be a
constant: the bar is **86px at 768**, **68 at 1024** and **57 from 1440** up,
because the readout wraps. Anything filling "the rest of the screen" has to
subtract a number that changes with width.

The pin window is `calc(100svh - var(--kopf, 0px))`, both of the shelf's
triggers start at `top top+=kopf()` (the parallax one too, or the plates would
drift before the run began), and the card is `min(44vw, 640px)`.

### Verified, pointer parked outside the section, sampled through the pinned run

| window | header | heading clear of bar | VIEW CASE clear | card | cards probed |
|---|---|---|---|---|---|
| 2560×1000 | 57 | **+125** | +69 | 640×666 | 6 |
| 1904×942 | 57 | **+96** | +40 | 640×666 | 6 |
| 1680×942 | 57 | +96 | +40 | 640×666 | 6 |
| 1440×900 | 57 | +77 | +21 | 634×662 | 6 |
| 1280×800 | 57 | +49 | **−7** | 563×618 | 6 |
| 1024×768 | 68 | +62 | **−5** | 451×560 | 5 |

Horizontal overflow is unchanged in kind — `overflow-x: clip` holds and
`scrollX` stays **0** at 1440, 1904 and 2560 even when scripted to 9999px. The
reported `overflowX` number grows with the cap (the track's lead-in is
`(100% − card)/2`, so a smaller card means a wider lead-in), which is the motion
artefact `scripts/README.md` trap 6 already describes, not a page that scrolls.

**What got slightly worse, stated:** at 1280×800 and 1024×768 the VIEW CASE
strip is now clipped by 5–7px, where before the heading was clipped instead.
That is a trade of 7px of button for 11–23px of section label, taken knowingly.

### ABOUT was left alone, on purpose

S.06's kicker sits **outside** `[data-about-stack]`, so it is outside what
`AboutDepth` pins and it is gone for the whole run — structural, not overflow.
Antony's call was to leave it: the fixed bar already prints `S.06 ABOUT` the
entire time, so the identity is not lost, and the three beats are composed to
hold the frame alone. Putting a label back in would give the passing line
something to collide with.

---

## 22 · The About claim was being cut by its own frame — fixed 17.08.2026

Antony, from the running build: the claim reads *"m a communication designe"* —
the first and last glyphs gone, at a 1904-wide window. Looked at three times
before it was understood, and the first two readings were wrong.

**Wrong reading 1: "it is the pass, by design."** The beats travel in z and a
departing one is meant to pass the reader, so a clipped line at the moment of
passing would be the effect working. Measured: the cut ran for **~300px of
scroll at opacity 1**, which is not a pass, it is a static defect.

**Wrong reading 2: "the beat is scaled 1.53× and overflows the window."** The
matrix said `scale: 1` at every sample, which is true and useless — the beats
are translated in **z** under a `perspective`, so the element grows without any
scale in its own transform. The rect is the only honest measurement here.

**What it actually is: two deliberate decisions cancelling each other.**

| | width at 1904 |
|---|---|
| `section#about`, `[data-about-stack]` | 1599 (the column) |
| `h2[data-satz]`, at `w-[112%]` | **1791** |
| difference | **192** |

`page.tsx` sets the claim at `w-[112%]` on purpose and calls it *"the one liberty
taken here"* — a line allowed over the page's own POS 08% / 92% rules so it
reads as a refusal. `[data-about-stack]` carries `overflow: clip` so a beat at
the near end cannot paint over the sections above and below. The clip was taken
at the **column** edge, so it removed exactly the overhang the h2 exists to
make: 1791 − 1599 = **192px**, 96 from each end of the sentence — the number
that was measured disappearing, to the pixel.

It only shows where the balanced line actually fills the measure. **1440 never
showed it; 1904 always did.** And with FX.08 off the same h2 overhangs
correctly, so the flat page was right and the effect was wrong.

**The fix is the frame, not the type.** `overflow: clip` clips at the *padding*
box, so the stack now takes the page margin back as padding and pulls its box
out by the same amount — layout box unchanged (still the column), clipping
region now the whole window. A beat at z = +380 is still caught, which is the
job the clip was added for. The number is `9.5238%` = 8 / 0.84, derived the same
way and for the same reason as the UNDER THE HOOD band in §19.

**Verified, worst clip measured while the beat is still legible (opacity ≥ 0.5):**

| window | before | after |
|---|---|---|
| 1904×942 | 192px, at opacity **1**, for ~300px of scroll | **0** |
| 1440×900 | 0 (line never filled the measure) | **0** |
| 1280×800 | — | 47px |
| 2560×1000 | — | 188px |

At the reading position at 1904 the sentence now measures 1450px inside a 1904
window with both ends clear, and reads whole.

### What is left, and it is a conflict of ideas rather than a bug

The residue at 1280 and 2560 is the departure itself. `AboutDepth` runs z and
opacity on **one linear ramp of the same duration**, so at opacity 0.5 the beat
is already at z ≈ 190 — 1.21× — and at 2560 that is wider than the window before
the fade has got anywhere. Closing it completely means fading over roughly the
first quarter of the departure, which turns "passes the reader" into "blinks
out"; the alternative is a shorter `NAH`, which flattens the volume the section
is built on. A sentence set at 112% of an 84% column cannot also travel toward
the reader inside a window-sized frame at every width. **Antony's call, not
urgent:** the state Antony photographed — legible and cut — no longer exists at
1440 or 1904.

---

## 23 · Stage 4, first pass — every route, and it found two real defects

17.08.2026. `QUY-TRINH.md` §4's overriding rule is *run on every route*, and its
own indictment was that every check this project had ever run was run on the
home page — 3% of the site. This is the first sweep that was not.

**What "32 routes" actually is:** 17 HTML pages (home, `/work`, two legal pages,
the 404, and 12 case studies) plus 13 `opengraph-image` endpoints. The image
routes cannot carry an accessibility defect but they can 404 or serve the wrong
type — checked separately, **13/13 return 200 with an image content-type**.

The sweep checks five of the six WebAIM Million categories mechanically
(contrast, missing alt, missing form labels, empty links, empty buttons) plus
heading structure, landmarks, title, and horizontal overflow. The sixth,
document language, was verified separately: `Lang.tsx` writes
`documentElement.lang` on switch. Per Deque this catches ~57% of what is there;
it is a sieve for where to spend a screen reader, not a certificate.

### Defect 1 — the 404 page was white-on-white

There was **no `app/not-found.tsx`**, so Next served its own built-in one, and
that component ships inline styles including `background: #fff` on BODY. The
site's `html` is `#050505` and its ink is `#f2f0eb`, so the page rendered the
site's own text on Next's white ground: **16 elements under 4.5:1, the wordmark
at 1.14:1**. An unreadable page, live, for as long as the project has existed —
and invisible because nobody had ever asked a route that does not exist.

Fixed by writing the page that should have been there: same layout, same voice,
an h1, and two ways on rather than one, because a 404 that only offers "go home"
sends a reader who wanted one case back to the top of a 17-screen page.
**Contrast failures 16 → 0.**

### Defect 2 — `/work` had one heading on the whole page

`Selected.tsx` already carries the note for this: *"the case titles are what a
screen-reader user navigating by heading is looking for, and they were plain
paragraphs."* That was fixed on the home shelf and left standing on the page
that is **nothing but case titles** — twelve of them, in 24px `<span>`s, under a
single h1. A reader navigating by heading was handed an index with no index in
it. `ProjectIndex` now emits `h2`. **Headings 1 → 13.**

### The sweep after both fixes

| route | h1 | headings | alt | empty link | empty btn | unlabelled field | contrast | scrollX |
|---|---|---|---|---|---|---|---|---|
| `/` | 1* | 17* | 0 | 0 | 0 | 0 | 0* | 0* |
| `/work` | 1 | **13** | 0 | 0 | 0 | 0 | 0 | 0 |
| `/impressum` | 1 | 7 | 0 | 0 | 0 | 0 | 0 | 0 |
| `/datenschutz` | 1 | 8 | 0 | 0 | 0 | 0 | 0 | 0 |
| 404 | 1 | 1 | 0 | 0 | 0 | 0 | **0** | 0 |
| 12 × `/work/[slug]` | 1 each | 4–5 | 0 | 0 | 0 | 0 | 0 | 0 |

### Three readings marked * were the instrument, not the page

Worth more than the table, and the same discipline §16 and trap 7 already record.

1. **`h1: 0` on the home page.** The sweep filters to visible elements, and the
   hero's h1 is at `opacity: 0` until its reveal runs. It is in the DOM, it is
   `--ink`, and it reaches opacity 1 on scroll; the page has **17** headings and
   exactly one h1, as it always did.
2. **`scrollX: 575` on the home page.** The check read `scrollX` in the same
   tick as the `scrollTo` that provokes it. Waiting 400ms returns **0**, and
   `overflow-x: clip` holds — the same motion artefact trap 6 describes, since
   `/` is the only route with parked carriage cards past the right edge.
3. **One contrast failure at 2.13:1 on the home page**, named as the hero's h1.
   **Not reproducible:** two later runs measured that element at **17.9:1** with
   colour `#f2f0eb` against `#050505`. Recorded as unreproduced rather than as
   clean.

**And a real limit of this instrument, stated so no one quotes it too far:** the
contrast check resolves a background by walking up for the nearest opaque CSS
colour. It therefore knows nothing about text over the hero's **canvas** or over
a **plate image**. Those two cases are exactly where an automated pass is
weakest and where the NVDA read has to look.

### What stage 4 still owes

- **NVDA + Chrome**, in the order QUY-TRINH sets: landmarks → headings → Tab
  from top to bottom → the project's own S3, hover and focus giving the same
  result. Now aimed: `/`, one case page, and `/work`.
- **Field notes names are `<span>`s at 4xl–7xl**, on both `/` and `/work` — the
  same defect class as Defect 2, in the largest type on those pages. Not fixed
  here because it changes the home page's heading count away from the **17** the
  bench asserts, which is Antony's call on the page's outline.
- Contrast in the **borrowed-accent** state across all 12 case colours: already
  measured in `ZIELE.md` §9-neu — 12/12 over 4.5:1 on the dark ground.

---

## 24 · Where the next session starts — written 17.08.2026, end of the morning

Stage 4 was **paused deliberately, not abandoned**, one pass in. Antony's reason:
he wants small changes to the frame and the motion first, and those are §1/§3
work — going back into stage 4 before they land would mean sweeping a page that
is about to move.

**Read in this order:** `../ZIELE.md` §7 and §9 · this file §18–§23 · then the
open items below. Everything argued today is in §18–§23, including the three
readings that turned out to be the instrument rather than the page.

### Open and waiting on Antony

- **Small changes to the frame and the motion.** ~~Named but not yet specified~~
  — **the MOTION half was specified and done on 18.08.2026, see §25.** The FRAME
  half is still unnamed; ask before proposing anything. Stage 4 stays paused
  until it lands.
- **Field note names are `<span>`s at 4xl–7xl on `/` and `/work`.** The same
  defect class as §23's Defect 2, in the largest type on both pages. Making them
  headings takes the home page from **17 to about 25**, and 17 is the number the
  bench asserts to prove a run attached to the right page — so the assertion in
  `scripts/` moves with it. Antony's call on the outline.
- **720px-tall windows** still lose 25px of the shelf card (§18). Accepted; the
  way to close it is copy, not CSS.
- **Beat 1 of About** still clips 178–331px while it departs (§22). A conflict
  between a full-width plate and a window-sized frame, not a bug.
- **Reduced-motion desktop gets no develop pass at all** (§20). Never did; not a
  regression; nobody has decided whether it should.

### Open and needing no decision, only doing

- **NVDA + Chrome**, in QUY-TRINH §4's order: landmarks → headings → Tab top to
  bottom → the project's S3, hover and focus giving the same answer. Aimed at
  `/`, one case page, and `/work`.
- **Contrast over the canvas and over the plate images** — the one thing §23's
  sweep provably cannot see.

### Before the Bewerbung, and none of these has ever run

The alias · the repo going public · **a real phone**. The phone is ten minutes
with a device already in the room and is the cheapest of everything on this
page.

### State of the tree

16 commits today, all on `main`, **not pushed**. Working tree clean, `pnpm build`
green, and every number quoted above was measured on the built page rather than
in dev.

---

## 25 · The cylinder turned sideways, and it now runs on 25 labels — 18.08.2026

Antony, unprompted and in two sentences: apply the hover to **all typography a
reader can hover**, and the current one is *"hơi nhanh và hơi chéo góc"* — a bit
fast, and a bit diagonal. This is the motion half of §24's first open item.

### The diagonal was never in the code, it was between two axes

`Walze` gives every character its own window with two copies on a roller, and
the delay has always been dealt out **left to right** along the word. The
rollers, however, turned **vertically** — the read copy left through the top,
the waiting one came up from below. Neither half is wrong on its own; put
together, a vertical travel handed out horizontally is a **diagonal wipe**, and
that is exactly what Antony read off the screen. Nothing was broken. The two
directions were simply pointing at different things.

Turning the rollers ninety degrees — read copy leaves **right**, waiting copy
arrives **from the left** — puts travel and order on the same heading. It also
puts the roller on the same heading as the rule drawn under the same link, which
has arrived left-to-right since it was built. One pen, one pass, one gesture;
before, the pen went one way and the letters another.

### The speed was chosen by looking, not by asking — ZIELE §6.2

Three variants on the same four labels (`hud`, a 1.5rem link, the e-mail, and
one at 4.5rem), all horizontal, differing only in time:

| | spread | travel | total |
|---|---|---|---|
| as shipped | 140ms | 260ms | 400ms |
| **B — chosen** | **200ms** | **380ms** | **580ms** |
| C | 280ms | 500ms | 780ms |

Antony took **B**. C read as lag on a nav a pointer crosses quickly; A, the
existing speed, still read as a flick once the travel had turned horizontal.
The comparison is kept at `../portfolio-concepts/walze-horizontal-vergleich.html`
and is standalone — it needs no build and no server.

**The travel moved out of `--dur-ui` into its own `--dur-walze`, and the drawn
rule moved with it.** They are two halves of one hover; a rule that finishes
while the letters are still turning is two effects. The old note in `globals.css`
arguing 260ms *against Trionn's 500ms* still holds and is now written against
380, which is still under half a second on a page that already trails the wheel.

### Where it runs now — 25 labels, one tier

Antony's call was **every single-line link and button**, and explicitly *not* the
large display type:

`Chrome` section list (7) + the S.0x button · footer e-mail, Impressum,
Datenschutz · 404 (2) · `/work` fore-and-aft nav (2) · case page: VIEW LIVE,
back, next · Impressum and Datenschutz: e-mail and back link (4) · Kontakt: two
switch tabs and the submit button.

Two deliberate exclusions, both stated where they live:

- **The EN / DE toggle keeps plain text.** `Walze.tsx` imports `useLang` from
  `Lang.tsx`, so a roller there closes an import cycle Lang → Walze → Lang. Two
  characters are also the one length where the effect has nothing to say: the
  spread divides by character count, and a spread over one step is a fade.
- **`np-zug` was paired onto the links but NOT onto the boxed or tabbed
  buttons** — VIEW LIVE has a border and the Kontakt switch has a 2px underline
  that *is* its state. A drawn rule under either says a second thing about the
  same control.

### What it costs, measured, and the first instrument was thrown away

The page's known hot spot (§12) is one write of `--accent` on `:root`, whose cost
"tracks the number of elements that INHERIT the property, and nothing else". This
change adds **275 elements to the home page** (971 → 1246), all of them
inheritors. That is the thing that could get worse, so it was measured.

**The first instrument failed its own check** and its number is not recorded
here: writing an unused custom property as a control cost 10.9ms against
`--accent`'s 14.9ms, i.e. the rig was reading *any* `:root` custom-property write
rather than the inherited one. It could not separate the variable.

The ablation that replaced it holds the write identical and moves **only the
element count**, by flattening rollers back to plain text in the live page:

| condition | elements | forced recalc, median of 50 |
|---|---|---|
| as shipped today | 1246 | 14.5ms |
| today's new rollers flattened (yesterday's shape) | 971 | 13.8ms |
| every roller flattened | 624 | 12.8ms |

**+275 elements bought +0.7ms per accent write, about 5%.** And the ablation says
something §12 did not: halving the document (1246 → 624) moves the write by only
12%, so most of that cost is a floor rather than a per-element price. The
instrument does respond to element count — monotonically, in the right direction
— which is what makes the 0.7ms admissible; the absolute numbers are **not**
comparable to §12's, which came off a different rig measuring a scroll section.

Measured in the in-app browser pane, which trap 2 in `scripts/README.md` calls
fiction for anything frame-dependent. A forced synchronous recalc is not
frame-dependent, which is why it was measured there and the *look* of the effect
was not.

### Still open on this (§25)

- **Nobody has seen it move on a compositing browser yet** — the pane does not
  composite, and the comparison file is a mock of the effect rather than the page
  itself. `pnpm start` and a real pointer is the check, and it is a minute.
- The large display type — `ProjectIndex` h2, the case card h3, the field note
  names at 4xl–7xl — was **excluded by Antony**, not overlooked. Reopening it
  means answering the field notes' own `group-hover:translate-x-5`, which would
  then be a second horizontal motion on the same gesture.
- **Reduced motion is unchanged and still correct**: the window opens, the
  waiting copy is `display:none`, and the read copy does not move. Verified in
  the built CSS after the axis change, not assumed.

---

## 26 · Four things Antony pointed at, and one of them was not there — 18.08.2026

Same afternoon as §25, and the four came in one message with four screenshots.

### The orange box was a text selection

Antony read the four section kickers as inconsistent: FIELD NOTES sat in a solid
orange block, the other three did not. **It is `::selection`** — `globals.css`
paints a selection with `--accent` on `--bg`, and the screenshot had the words
dragged over. All four kickers carry the identical
`hud hud-wide text-accent accent-t`. Nothing to fix, and worth keeping in this
file because the same screenshot will be taken again.

**One difference between those sections IS real and is deliberate:** a *railed*
section (CONTACT) stacks kicker and number inside the left rail column; a
*railless* one (FIELD NOTES, CAPABILITIES, ABOUT) puts kicker left and number
right on one row. The page alternates railed and railless on purpose — the note
at `app/page.tsx:255` argues the one consecutive railless pair. ABOUT looked
empty in the screenshot for a third reason again: its three beats start
transparent and are scrubbed, so a still frame of it is a still frame of nothing.

### VIEW CASE had no hover at all on the one card that mattered

The five outlined cards took the accent in their text. The sixth — One Bit From
Home, the `primary`, filled in `--flare` — **had no hover rule whatsoever**: not
a colour, not the 4px arrow nudge the others get. A filled button reads as
already-lit, which is how it stayed inert without anyone noticing. That is what
"hover không rõ" was pointing at, and it was accurate.

Now `.np-streifen` in `globals.css`: a block of colour arriving **from the left**
on `--dur-walze`, the same pen as the rule under a link and the rollers in a
label. Chosen by Antony off `../portfolio-concepts/hover-vergleich-2.html`
against an always-filled strip that inverts on hover.

- **Fill is `--accent`, text goes to `--bg`.** Measured against all eleven
  project accents before shipping, not after: worst case **5.49:1** (Gutjahr's
  brick), best 11.72:1. AA holds on every card with no per-card exception.
- **The filled card fills with `--ink` instead** — sweeping the accent over
  `--flare` is one signal colour crossing the other, and `--flare` is the one
  colour on this page that never changes hands.
- **It answers `[data-near]` and `[data-probed]`, not `:hover` alone.** The
  develop pass already does; a strip on `:hover` only would drop out in the 12px
  dead strip between two cards while the plate stayed developed — two answers to
  one question, which is the bug that rule exists to prevent.
- The three `group-hover:`/`group-focus-visible:`/`group-data-[near]:` colour
  utilities came **off** the outlined strip. One mechanism per property.

**The orange stays.** Antony's call, and the argument for it is that `--flare` is
not One Bit's colour — it is the page's fixed signal for "this is the primary
action", and the home page has exactly one place to spend it.

### The CV links were the hardest thing on the page to recognise

Three separate faults, all of them fixed rather than one:

| was | is | why |
|---|---|---|
| `--muted`, the dimmest colour on the page | `--ink` | it is the line whose whole job is to be taken up |
| `↗` at 50% | `↓`, and the link now carries `download` | ↗ means "opens elsewhere"; a CV is something you take, and now the glyph and the behaviour agree |
| nothing said what the file was | a tag reading `PDF · 133 KB` | ordinary courtesy for a link that starts a download |

**The size is read off the file at build time** (`dateigroesse()` in
`app/page.tsx`), never typed into `lib/site.ts`. Every route here is
prerendered, so the number in the HTML is the number of the PDF that shipped
with it. A hand-kept KB figure is a sourced-*looking* metric that goes wrong the
first time a CV is replaced, and this project's own convention is to leave an
unsourceable number out rather than assert it. Missing file → the tag says `PDF`
and nothing more. `(PDF)` came out of both labels in `lib/site.ts`.

The tag is **not** `aria-hidden`. A screen reader is precisely the reader who
should be told the type and weight before the file lands.

### The rollers went into FIELD NOTES with the indent left running

Antony's question was what it would cost; he then chose it **with** the row's
existing indent rather than instead of it, after looking at both.

So that row now carries two horizontal motions on one gesture: the box travels
20/36px (200ms in, 700ms out) while the letters turn across 200ms of spread and
380ms of travel. They point the same way, which is why it reads as one thing
accelerating. **If it ever reads as busy, the indent is the half to drop** — the
roller is the whole page's hover language, the indent is only this section's.
That is written in `FieldNotes.tsx` as well, where the decision would be made.

### What it all costs, and the number moved

| condition | elements | forced `--accent` recalc, median of 50 |
|---|---|---|
| after this afternoon | 1632 | 21.2ms |
| this afternoon's rollers flattened | 1232 | 19.3ms |

**+400 elements bought +1.9ms, about 10%** — VIEW CASE ×6 and eight field-note
names. Across the whole day the home page went **971 → 1632 elements, +68%**.

**The absolute number is not comparable to §25's** — 1232 elements measured
19.3ms here against 14.5ms at 1246 this morning, on the same rig and the same
page. Something other than element count moved between the two runs, so only the
**within-run delta** is a result. Both deltas agree on the shape: element count
is real but shallow, ~5ms per thousand elements, against a floor that dominates.

**Worth Antony's attention rather than mine:** §12 measured the accent write at
~22ms and closed it as "invisible at 60Hz, visible at 240Hz+ with the pointer
inside SELECTED or FIELD NOTES". The home page now measures 21.2ms — the same
neighbourhood, on a **360Hz** display (§10). Nothing here is a regression against
a threshold anyone set; it is the same accepted cost, slightly larger, in a
section that now has more to invalidate.

### An instrument fault, the second in one day

Setting `[data-near]` and reading the pseudo-element's `transform` back reported
`scaleX(0)` — the fill looked dead. It was not: a 380ms transition had just
started, and `getComputedStyle` at t≈0 returns the *start* value, in a browser
pane that does not composite and so never advances it. Verified by injecting
`transition: none` first, after which rest reads `scaleX(0)` and `[data-near]`
reads `scaleX(1)`, text `#050505`, fill `--ink` on the filled card. **Reading a
transitioned property immediately after the state change measures nothing.**

### Open

- ~~**ABOUT's three beats.**~~ **Asked rather than assumed, and Antony chose the
  second reading — one journey, different hand-offs. Done, see §27.**
- Everything in §25's "still open" list stands, including that **nobody has seen
  any of today's hovers move on a compositing browser**.

---

## 27 · About hands the frame over twice, and not the same way — 18.08.2026

Antony asked for the three beats to be "phong phú" — richer — and then chose
between the two readings of his own sentence himself: **not three different
gestures, one journey with different hand-offs.** That is the smaller ask and
the better one. The volume, the score and the reason FX.08 exists are untouched;
every beat still comes up out of the far end, stands at the plane, and passes.
What is no longer identical is the moment one sentence gives the frame to the
next, of which a three-beat score has exactly two.

**Nothing in the score moved.** Same `AN`, `HALT`, `AB`, same `TAKT`. That was
the design constraint, not an accident: `mitte()` translates a beat's place in
the score into a scroll position for the keyboard focus map, so a hand-off that
changed the clock would need a second copy of the timing to keep in step — the
exact failure the note above `TAKT` already names. The difference is carried in
**how far** a beat goes and **in what order its lines follow**, never in when.

| hand-off | the plate | its lines |
|---|---|---|
| 1 · claim → evidence | to `NAH` (+380), as before | retreat to −260, **last line first** |
| 2 · evidence → promise | to `NAH_WEIT` (**+620**) | do not move at all |

One reads as the claim being **pulled back into the depth**, unwriting itself in
the reverse of the order it wrote itself out in, while the evidence writes itself
out underneath — two writings crossing, running opposite ways. Two reads as the
evidence being **lifted off whole**: one rigid plate, further and therefore
cleaner, so the promise — the only beat that never departs — arrives into a frame
nothing is still leaving.

Both stay inside `AB`, so neither outgoing sentence is legible any longer than it
was. That was the thing to protect: the score is arranged the way it is precisely
to keep two pieces of running text from ever being readable at once.

### Measured, because a scrubbed effect cannot be read in the app's browser

`scripts/README` trap 2 — the pane does not composite, so the scrub never
advances and every sample would be the parked state. Driven instead on real
Chromium through `scripts/cdp.mjs`, walking the 1665px pin in 21 steps and
reading each beat's `matrix3d` m43 plus beat 0's line elements:

| f | beat 0 | beat 1 | beat 2 | beat 0's line z |
|---|---|---|---|---|
| 0.05 | −130 | −1150 | −1150 | [−4, −27, −89, −206] ← arriving, first line first |
| 0.35 | 259 | −561 | −1150 | **[−34, −82, −130, −177]** ← leaving, last line deepest |
| 0.40 | 380 | −222 | −1150 | [−137, −184, −232, −260] |
| 0.65 | 380 | 443 | −534 | held |
| 0.70 | 380 | **620** | −191 | held |
| 1.00 | 380 | 620 | **0** | held |

Beat 0 tops out at exactly `NAH`, beat 1 at exactly `NAH_WEIT`, beat 2 never
leaves the plane, and beat 1's lines read `0` through its whole departure — the
rigid plate. The reversal is visible in the numbers rather than inferred: on the
way in the FIRST line is deepest, on the way out the LAST one is.

Sampled once, 21 points, one viewport (1440×900). **Not** yet looked at by a
human on a compositing browser, which is still the open item §25 left.

### Reduced motion cost nothing here, and that is worth knowing

The whole block is inside `mm.add("(prefers-reduced-motion: no-preference)")`,
so a reader who asks for less motion never had beats travelling and does not now
either — they get the flat stacked-off layout. No second still frame had to be
designed for either hand-off, which is the one place today's work was cheaper
than ZIELE §6.7 usually makes it.

---

## 28 · The loader mark is 220px, and it is one number now — 18.08.2026

Antony asked for it bigger. It was 132px, and everything the registration mark
is made of was an absolute pixel figure alongside it: lattice pitch 5.5, ring 26,
arms 40, dot radius 1.6, misregistration 18. Five numbers that all mean "at this
size" and none of which said so.

`KANTE` is now the size and `K = KANTE / 132` scales all five. **Bigger, not
denser** — that distinction is the whole of the change: the ring walks at
`PITCH / R` and the arms at `ARM / PITCH`, both ratios of scaled numbers, so the
dot COUNT is identical and the drawing is the same drawing enlarged. Growing
only the ring and the arms would have kept the 5.5 pitch and handed back a finer,
more crowded mark — a different mark at a larger size. A registration mark
enlarged on a press is the same mark.

Because the count is unchanged, so is the cost: about a hundred circles a frame,
exactly as before, for the same 900ms.

Set to **220** (1.67×). Four sizes are side by side in
`../portfolio-concepts/loader-groesse.html` running the real draw loop — 132,
176, 220, 264 — and the number is a one-line change if Antony wants another.

**264 is the ceiling, and a phone sets it.** The loader is a column — mark,
wordmark, counter — and at 390×844 a 264 mark leaves that column about 380px in
an 844px window, still reading as centred rather than as filling the screen. Past
that it starts behaving like a splash screen, which is the one thing an
instrument booting must not look like.

Geometry checked rather than assumed: at 220 the furthest ink from centre is
`ARM + aus + dot` = 66.7 + 30 + 2.7 = 99.4px against a 110px half-box. The same
proportional margin the 132 version had, because everything scaled together.

The canvas box moved from a Tailwind `h-[132px] w-[132px]` to an inline style —
a utility class cannot read `KANTE`, and two numbers kept in step by hand is the
thing this change exists to remove. Verified in the prerendered HTML:
`<canvas style="width:220px;height:220px">`.

Still skipped entirely under reduced motion, as before.
