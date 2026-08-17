# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Nullpunkt — Antony Vu's portfolio/lab site. Next.js 16 (App Router, every route
statically prerendered), React 19, TypeScript, Tailwind v4, GSAP + ScrollTrigger,
Lenis, Three.js (WebGPU/TSL with WebGL2 fallback). No CMS, no backend, no
analytics — content lives in `lib/`, the contact form just composes a `mailto:`.

**Where things stand, read this before anything else:** `OFFEN.md` **§13** is the
measured baseline, **§14** the tablet quadrant, **§15** the ship checklist (what
is still open before the Bewerbung goes out), **§16** the GPU-less findings. The
process those stages belong to is `../QUY-TRINH.md`; the goals and the working
protocol are `../ZIELE.md` — that file wins any disagreement.

Read `README.md` next — it documents the five places in this codebase where an
actual design decision was made (the accent-borrowing system, the Scope hero,
the live-rendered EchoProbe card, and the sourced-metric convention), plus the
contrast and reveal-animation rules the code is expected to keep following.

**This is not the Next.js you know.** Per `AGENTS.md`, this version has breaking
API/convention changes from training data — check `node_modules/next/dist/docs/`
before writing App Router code that looks unfamiliar or before assuming a
pre-16 API still applies.

## Commands

```bash
pnpm install    # this repo currently runs on pnpm (pnpm-lock.yaml / pnpm-workspace.yaml),
                # though README.md predates the switch and still says npm
pnpm dev        # http://localhost:3000
pnpm build      # production build — every route is prerendered, treat build failures
                # as real regressions, not warnings
pnpm start
```

There is no lint or test script/config in this repo — `pnpm build` (which runs
`next build`, including type checking) is the correctness gate.

**`pnpm dev` can serve stale CSS.** Turbopack in this version does not reliably
invalidate `app/globals.css` when it is appended to rather than edited in place:
new rules are missing from the CSSOM entirely — `getAnimations()` empty, the
selector matching nothing — while `pnpm build` output contains them. Verified
three times against a running dev server before checking the built chunk. If a
CSS change appears to do nothing, `rm -rf .next` and restart dev before assuming
the change is wrong. Do not run `pnpm build` while `pnpm dev` is up; they share
`.next`.

## Architecture

**Content lives in `lib/`, not in components.** `lib/site.ts` holds every piece
of copy (bilingual `{ en, de }` pairs), the CV links, the Werdegang timeline,
and the "operator readings" block. `lib/projects.ts` holds every case study —
one `Project` object per site, shared by both the home page's featured index
and `/work/[slug]`. A `Metric` is always `{ label, value, source? }`; if a
number can't be sourced, leave `source` undefined rather than inventing one —
the UI renders it plainly instead of asserting it's measured.

**Bilingual copy, not routing.** There's no `/en` / `/de` split. `components/Lang.tsx`
provides a client-side `LangProvider` + `useLang()` context and an `<L text={...}/>`
/ `<L en="" de=""/>` component that switches on render. Server render and first
client paint are always EN to avoid hydration mismatches; a saved `de` preference
(`localStorage` key `np-lang`) is applied post-mount. Persistence is written
inside `setLang`, never in an effect, so it can't race the mount-time read.

**The accent color is borrowed, not fixed.** `--accent` (see `app/globals.css`)
defaults to `zeroAccent` (ink) when nothing is selected. `components/AccentSetter.tsx`
sets `--accent` to a project's own color on mount and resets it to `zeroAccent`
on unmount; `ProjectIndex`/`Selected` do the same on hover/focus for the home
page's live index. Elements that should transition with the accent get the
`.accent-t` class; the `[data-accent-release]` attribute (set in `FieldNotes.tsx`)
stretches that transition to 2s for the "letting go" case. **A descendant that
paints the accent itself must be named in the list in `globals.css`** — the rule
used to be `.accent-t *` and is now an explicit `:is(...)`, because the wildcard
put 360 of the page's 920 elements into a colour transition when only 62 ever
change colour. The failure mode of forgetting is quiet: the element snaps rather
than sweeping. Keyboard focus is
expected to trigger the same borrowing behavior as pointer hover — don't wire
one without the other.

**Three.js stays out of the static prerender.** `components/EchoProbe.tsx`
imports `three/webgpu` inside `useEffect`, not at module scope, specifically so
the home page — which is otherwise fully static — doesn't pull WebGPU into the
prerendered bundle. WebGPU falls back to WebGL2 automatically. Follow the same
pattern for any new Three.js component.

**Reveal animations only ever touch opacity.** `components/Reveal.tsx` and the
motion in `Scope.tsx`/`EchoProbe.tsx`/`FieldNotes.tsx` deliberately never use
`visibility`/`autoAlpha`, because that would pull content out of the
accessibility tree for a purely presentational effect. Every animated component
also needs a designed static frame under `prefers-reduced-motion`, not just a
blank box — follow the existing components' pattern rather than adding a bare
opacity:1 fallback.

**And read that media query LIVE, never once at mount.** A reader can flip the
OS setting with the tab open. Reading it once does not merely miss the change —
it leaves the page *half reduced*: on 14.08.2026 `--passer` stayed parked at the
still's 0.18 while `data-about-stack` flipped to "on", four pin-spacers appeared
and the document grew from 11176 to 17282px, because everything on
`gsap.matchMedia()` re-evaluates live and everything on a plain
`matchMedia(...).matches` does not. Neither mode designs for that state, and the
person most likely to reach it is the one changing the setting to see what it
does. Three components had this bug in one day. The pattern is in `Passer.tsx`,
`SmoothScroll.tsx` and `AccentScroll.tsx`: state seeded from a `change` listener,
and that state in the effect's dependency array so the whole context tears down
and rebuilds on a flip. Anything already using `gsap.matchMedia()` is live
already. `EchoProbe`, `Reveal`, `Registration` and `DrawLines` still read once
and are the outstanding cases; `Loader` reads once and legitimately does not care.

**A cap on per-frame work belongs outside any reduced-motion branch.** `lib/motion.ts`
holds `MOTION_FPS`, and `gsap.ticker.fps()` is set in its own effect in
`SmoothScroll` — *before* the reduced-motion check, not after. The ticker is a
global that AccentScroll and every other gsap consumer are added to, so a cap
written below that early return is a cap that never applies in reduced motion,
which is where it was most needed.

**Route layout:**
```
app/
  page.tsx            home — seven sections (S.01…S.07)
  work/page.tsx        full index: catalogued cases + field notes
  work/[slug]/page.tsx  one statically generated case study per project
  impressum/, datenschutz/   German legal pages (§5 DDG / DSGVO — see lib/site.ts anschrift)
  layout.tsx           metadata, JSON-LD, font loading, LangProvider, Loader, Chrome, footer
components/            Scope, EchoProbe, Selected, ProjectIndex, FieldNotes, Werdegang,
                        Kontakt, Chrome, Lang, Reveal, Loader, AccentSetter, SmoothScroll
lib/projects.ts        all case-study content (single source for home + /work)
lib/site.ts             the person, the copy, the career stations (EN/DE)
```

Path alias `@/*` maps to the repo root (see `tsconfig.json`).

## Legal/content sensitivity

`lib/site.ts` documents (in comments) that the Impressum address is deliberately
the operator's private address per §5 DDG, and that the two linked CVs are a
`--public` cut with no address/phone — don't add PII to public-facing copy
without checking those comments first.
