"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { L, LangToggle, useLang } from "@/components/Lang";
import { useFx } from "@/components/fx/FxProvider";
import { Walze } from "@/components/Walze";

/** Lenis owns the scroll position while it is running; telling the window
 *  instead would be overwritten on its next frame. Same note the shelf's
 *  keyboard escape hatch carries — this is that fact stated once for the chrome. */
function fahreZu(ziel: number | HTMLElement) {
  const lenis = (
    window as unknown as { lenis?: { scrollTo: (v: number | HTMLElement, o?: object) => void } }
  ).lenis;
  if (lenis) lenis.scrollTo(ziel, { offset: typeof ziel === "number" ? 0 : -64 });
  else if (typeof ziel === "number") window.scrollTo({ top: ziel, behavior: "smooth" });
  else ziel.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Chrome() {
  const pathname = usePathname();
  const { lang } = useLang();
  const timeRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const scrRef = useRef<HTMLSpanElement>(null);
  const deflRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const dock = useFx("scope-dock");

  /* The index only exists where the sections do. Chrome is in the root layout,
     so on a case study or the Impressum these ids match nothing at all — a bar
     offering to take a reader to S.04 on a page with no S.04 is worse than no
     bar. The wordmark is the way home from there, which is what it is for. */
  const istHome = pathname === "/";
  const [marke, setMarke] = useState(0);
  const [offen, setOffen] = useState(false);
  const markeRef = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const knopfRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const clock = () => {
      if (timeRef.current)
        timeRef.current.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    };
    clock();
    const clockId = setInterval(clock, 1000);

    /* Resolved ONCE, not on every tick. Seven getElementById plus seven rects
       twice a second is affordable; seven lookups twice a second forever is a
       query the DOM has already answered. Nulls are kept in place so the index
       into site.sections stays the index into this array. */
    const marken = istHome
      ? site.sections.map((s) => (s.id ? document.getElementById(s.id) : null))
      : [];

    let frames = 0;
    let last = performance.now();
    let rafId = 0;
    const loop = (now: number) => {
      frames += 1;
      if (now - last >= 500) {
        if (fpsRef.current)
          fpsRef.current.textContent = String(Math.round((frames * 1000) / (now - last))).padStart(2, "0");
        frames = 0;
        last = now;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (scrRef.current)
          scrRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        /* DEFL — the instrument reporting its own reading. Read from the
           variable rather than measured again here: AccentScroll owns that
           measurement, and a second opinion computed a different way is how a
           readout ends up disagreeing with the thing it is reporting on.
           getComputedStyle is only affordable because this whole branch runs
           twice a second, not every frame. */
        if (deflRef.current) {
          const d = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--deflection"),
          );
          deflRef.current.textContent = `${String(Math.round((d || 0) * 100)).padStart(3, "0")}%`;
        }
        // FX.02, second half: the scope's beam, having attenuated out of the
        // hero, rides the progress rule instead. Same phosphor, same accent —
        // the instrument is docked, not gone.
        // Positioned with left, not translateX: a vw offset would count the
        // scrollbar and overshoot the rule's right end by its width.
        if (beamRef.current) beamRef.current.style.left = `${p * 100}%`;

        /* WHICH SECTION IS UNDER THE READING LINE. The last one whose top has
           crossed 35 % of the window — a line above the middle, because a
           section is "the one you are reading" from the moment its head arrives,
           not from the moment it fills the screen. Measured against rects rather
           than offsets on purpose: two pins on this page put sections inside
           pin-spacers, so a laid-out offsetTop and where the section actually is
           are different numbers.
           Rides the existing 500ms gate rather than adding a listener. It is the
           same budget the DEFL readout is already charged to, and a section name
           that changes twice a second is a name that changes as fast as anyone
           can read it. */
        if (istHome) {
          const linie = window.innerHeight * 0.35;
          let idx = 0;
          for (let i = 1; i < marken.length; i += 1) {
            const el = marken[i];
            if (el && el.getBoundingClientRect().top <= linie) idx = i;
          }
          /* Compared against a ref, not against state: this loop is created once
             and would otherwise close over the value `marke` had at mount and
             re-fire setMarke on every tick forever. */
          if (idx !== markeRef.current) {
            markeRef.current = idx;
            setMarke(idx);
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      clearInterval(clockId);
      cancelAnimationFrame(rafId);
    };
  }, [istHome]);

  /* Escape closes and hands focus back to the control that opened it, and a
     click anywhere else closes without stealing anything. Both are the minimum a
     disclosure owes a keyboard reader; neither is worth a library. */
  useEffect(() => {
    if (!offen) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOffen(false);
      knopfRef.current?.focus();
    };
    const aussen = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener("keydown", taste);
    document.addEventListener("pointerdown", aussen);
    return () => {
      document.removeEventListener("keydown", taste);
      document.removeEventListener("pointerdown", aussen);
    };
  }, [offen]);

  /* A reader who has scrolled away from the section the open panel was about is
     reading a stale menu. Closing on the marker moving is cheaper than keeping
     it correct, and it is what a bar that reports a position should do. */
  useEffect(() => setOffen(false), [marke]);

  return (
    <>
      {/* data-chrome is the hook the hero's reveal lifts this bar with — the
          movement itself is one CSS rule in globals.css, switched by a
          data-chrome-off attribute HeroIntro flips. Kept declarative on purpose:
          the header is fixed over the whole site and a component animating its
          own transform from JS would be the second thing writing a transform onto
          it. Inert markup where nothing flips the attribute, which is every page
          but the home page. */}
      <header
        data-chrome
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b px-[var(--gutter)] py-4 backdrop-blur-md"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 72%, transparent)",
        }}
      >
        {/* THE WORDMARK HAD NOTHING TO DO ON THE PAGE IT LINKS TO. It is
            href="/" everywhere, which is right from a case study and dead on the
            home page: Next sees the route it is already on and does nothing at
            all, so the one thing in the chrome that looks clickable answered a
            click with silence — on a page that is now 17 screens long and pins
            the reader twice.
            On "/" it becomes what a wordmark means there: back to the top. Still
            a real <Link>, so middle-click, Cmd-click and the status bar all keep
            working; the handler only takes over the plain left click it would
            otherwise have wasted.
            Lenis owns the scroll position while it is running — telling the
            window instead would be overwritten on its next frame, the same note
            ShelfTransport's keyboard escape hatch carries. Not `immediate`: a
            reader who asks to go back to the zero point should watch the page
            travel there, and the hero's pin is scrubbed, so the whole opening
            runs backwards under them on the way up. */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/"
            onClick={(e) => {
              if (!istHome) return;
              e.preventDefault();
              fahreZu(0);
            }}
            className="hud hud-wide accent-t np-zug pointer-events-auto -my-3 inline-flex min-h-[44px] items-center text-ink no-underline hover:text-accent"
          >
            <Walze en={site.wordmark} de={site.wordmark} />
          </Link>

          {/* ——— THE SCALE, AND THE WAY ALONG IT ————————————————————————————
              The bar already said how far down the reader was (SCR) and how hard
              the instrument was deflected (DEFL) without ever saying what they
              were looking at. This names it, and opening it turns the reading
              into a scale you can move along: seven marks, the current one lit.
              A page seventeen screens long that pins its reader twice had
              exactly one jump on it — "SKIP THE RUN", buried inside Selected —
              and no map at all.
              A BUTTON AND A LIST, not a hover menu: it has to work on a phone,
              where the run is longest and there is no pointer to hover with.
              The number stays at every width and the NAME drops below md — the
              mark is the reading, the word is the label on it, and a bar that
              wraps stops being a bar. */}
          {istHome && (
            <nav ref={navRef} aria-label="Sections" className="pointer-events-auto relative">
              <button
                ref={knopfRef}
                type="button"
                aria-expanded={offen}
                aria-controls="np-index"
                onClick={() => setOffen((o) => !o)}
                className="hud accent-t np-zug -my-3 inline-flex min-h-[44px] items-center gap-2 text-muted hover:text-accent"
              >
                <span className="text-muted-dim">S.{site.sections[marke].n}</span>
                <span className="hidden md:inline">
                  <L text={site.sections[marke].label} />
                </span>
                <span aria-hidden="true" className="opacity-50">
                  {offen ? "▾" : "▸"}
                </span>
              </button>

              {offen && (
                <ul
                  id="np-index"
                  className="hud absolute left-0 top-full m-0 mt-3 w-[15rem] list-none border p-0"
                  style={{ borderColor: "var(--line)", background: "var(--bg)" }}
                >
                  {site.sections.map((s, i) => (
                    <li key={s.n} className="m-0 border-t first:border-t-0" style={{ borderColor: "var(--line)" }}>
                      <a
                        href={s.id ? `#${s.id}` : "#main"}
                        aria-current={i === marke ? "true" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = s.id ? document.getElementById(s.id) : null;
                          fahreZu(el ?? 0);
                          setOffen(false);
                        }}
                        className={`accent-t flex min-h-[44px] items-center gap-3 px-4 no-underline hover:text-accent ${
                          i === marke ? "text-accent" : "text-muted"
                        }`}
                      >
                        {/* The mark on the scale — filled where the needle is
                            standing, hollow everywhere else. Same square this
                            page has used for a marker since the first build. */}
                        <span
                          aria-hidden="true"
                          className="inline-block h-1.5 w-1.5 shrink-0 border"
                          style={{
                            borderColor: "currentColor",
                            background: i === marke ? "currentColor" : "transparent",
                          }}
                        />
                        <span className="text-muted-dim">{s.n}</span>
                        <span>{s.label[lang]}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          )}
        </div>
        <p aria-hidden="true" className="hud accent-t hidden text-muted md:block">
          <span ref={timeRef}>--:--:--</span>
          <span className="mx-2 opacity-50">·</span>
          FPS <span ref={fpsRef}>--</span>
          <span className="mx-2 opacity-50">·</span>
          SCR <span ref={scrRef}>000%</span>
          {/* Held back to lg: at md this row already runs to the status block,
              and a telemetry strip that wraps stops reading as a strip. */}
          <span className="hidden lg:inline">
            <span className="mx-2 opacity-50">·</span>
            DEFL <span ref={deflRef}>000%</span>
          </span>
        </p>
        <div className="flex items-center gap-4">
          {/* Both channels, named. The page is for someone hiring AND for an
              agency looking for a pair of hands — a vaguer "open to work" would
              serve neither. Kept short enough not to wrap next to the toggle. */}
          <p className="hud accent-t hidden text-muted sm:block">
            STATUS —{" "}
            <span className="text-accent">
              <L en="OPEN TO ROLES & AGENCY WORK" de="OFFEN FÜR ROLLEN & AGENTURARBEIT" />
            </span>
          </p>
          <LangToggle />
        </div>
      </header>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-0.5"
        style={{ background: "var(--line)" }}
      >
        <div
          ref={barRef}
          data-progress-rule
          className="accent-t h-full w-full origin-left"
          style={{ background: "var(--accent)", transform: "scaleX(0)" }}
        />
        {dock && (
          <div
            ref={beamRef}
            data-progress-beam
            className="accent-t absolute bottom-[-3px] left-0 ml-[-4px] h-2 w-2 rounded-full"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 14px 3px var(--accent)",
              // Arrives at exactly the rate the hero's plates come apart.
              // Passer publishes --passer: 0 while the three plates are still in
              // register up there, 1 once they have separated and the hero has
              // nothing left to show. The hand-over is the point — one signal
              // leaves the top of the page and the same signal picks itself up
              // on the rule at the foot of it.
              // (Was --scope-att for the oscilloscope hero, then --konvergenz;
              // now the page runs on ONE variable and this reads it directly
              // instead of a second one that only mirrored it.)
              opacity: "var(--passer, 0)",
            }}
          />
        )}
      </div>
    </>
  );
}
