import { statSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/lib/site";
import { homeRestAccent } from "@/lib/projects";
import AccentSetter from "@/components/AccentSetter";
import Selected from "@/components/Selected";
import FieldNotes from "@/components/FieldNotes";
import Werdegang from "@/components/Werdegang";
import Konvergenz from "@/components/Konvergenz";
import Passer from "@/components/Passer";
import HeroIntro from "@/components/HeroIntro";
import Rack from "@/components/Rack";
import Kontakt from "@/components/Kontakt";
import { L, LSatz } from "@/components/Lang";
import { Walze } from "@/components/Walze";

/** Running section count — printed in every rail, so it lives in one place. */
const SECTIONS = "07";

const specs = [
  {
    title: "TOKENS",
    rows: [
      ["GROUND", "#050505"],
      ["INK", "#F2F0EB"],
      ["MUTED", "#8A8781"],
      ["LINE", "INK / 14%"],
      ["FLARE", "#FF4D1C"],
      ["ACCENT", "BORROWED FROM THE WORK"],
    ],
  },
  {
    title: "TYPE",
    rows: [
      ["DISPLAY", "BRICOLAGE GROTESQUE"],
      ["BODY", "INSTRUMENT SANS"],
      ["INSTRUMENT", "SPLINE SANS MONO · UPPERCASE"],
      ["RULE", "METADATA IS ALWAYS MONO"],
    ],
  },
  {
    title: "MOTION",
    rows: [
      ["CLOCK", "DELTA TIME / GSAP"],
      ["EASE", "POWER2 ONLY"],
      ["MICRO", "COLOR + BORDER, NO BOUNCE"],
      ["REDUCED MOTION", "ALWAYS HONORED"],
    ],
  },
];

/**
 * Capabilities read off the shipped work — every tool here is used by at least
 * one deployed case in the archive, so the stack is evidence, not a claim.
 */
const capabilities = [
  { group: "LANGUAGES", items: ["TypeScript", "JavaScript", "HTML", "CSS"] },
  { group: "FRAMEWORKS", items: ["Next.js (App Router)", "React", "Vite", "SSR / SSG"] },
  { group: "GRAPHICS", items: ["Three.js", "WebGPU / TSL", "WebGL", "Canvas 2D", "OGL", "GLSL"] },
  { group: "MOTION", items: ["GSAP", "ScrollTrigger", "Flip", "Lenis"] },
  { group: "CRAFT", items: ["Tailwind v4", "i18n (EN/DE/VI)", "WCAG 2.1 AA", "Responsive", "SEO / JSON-LD"] },
  { group: "TOOLING", items: ["Git", "Vercel", "Figma"] },
];

/** The swatch a token row shows, if any — ACCENT reads the live borrowed color. */
function swatchColor(k: string, v: string): string | null {
  if (k === "ACCENT") return "var(--accent)";
  if (/^#/.test(v)) return v;
  return null;
}

/** Swiss left rail: kicker + a running section number, ruled off from the body. */
/* ——— HOW BIG IS THE DOCUMENT, ACTUALLY ————————————————————————————————
   Read off the file during the build, never typed into lib/site.ts. This page
   is statically prerendered, so the stat runs once at build time and the number
   in the HTML is always the number of the PDF that shipped with it. The
   alternative — a KB figure kept by hand — is a sourced-looking metric that
   goes wrong the first time a CV is replaced, and this project's own convention
   (lib/projects.ts, `Metric.source`) is that an unsourceable number is left out
   rather than asserted. Missing file returns null and the tag simply says PDF. */
function dateigroesse(href: string): string | null {
  try {
    const bytes = statSync(join(process.cwd(), "public", href)).size;
    return `${Math.round(bytes / 1024)} KB`;
  } catch {
    return null;
  }
}

function Rail({
  kicker,
  n,
  draw = true,
}: {
  kicker: React.ReactNode;
  n: string;
  /** Whether FX.04 may animate this rule. Off for Contact: it is the last thing
   *  on the page, and a rule that is still drawing itself under someone who has
   *  arrived to write an email is motion asking for attention it has no business
   *  asking for. The rule is simply there. */
  draw?: boolean;
}) {
  return (
    <div data-rail className="relative mb-6 md:col-span-3 md:mb-0 md:pr-6">
      {/* The rail's rule is this element, not a border on the cell.
          It was a border, and FX.04 hid the border while a drawn stand-in took
          over — two mechanisms for one line, which broke twice: the stylesheet
          rule that hid the border lost to Tailwind's own .hidden, and switching
          the effect off wrote a longhand over React's `borderColor: var(--line)`
          shorthand, which destroys it: the CSSOM cannot round-trip a var() in a
          shorthand, so the rules came back as opaque ink instead of a 14 %
          hairline. One element, one rule. With the effect off it simply stands
          there; with it on, GSAP scrubs its scaleY. Nothing to hide, nothing to
          restore. */}
      <span
        aria-hidden="true"
        data-fx-line={draw ? "rail" : undefined}
        className="absolute right-0 top-0 hidden h-full w-px origin-top md:block"
        style={{ background: "var(--line)" }}
      />
      <p className="hud hud-wide text-accent accent-t">{kicker}</p>
      <p className="hud mt-2 text-muted-dim">
        S.{n} / {SECTIONS}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* The page arrives already calibrated. Without this the accent sits at
          its CSS default — ink — and every kicker, marker and hot reading
          renders as near-white on near-black: technically legible, but the
          page loses the one colour it has until something is hovered. */}
      <AccentSetter accent={homeRestAccent} />

      {/* `isolate`, and not by preference. Passer prints IN FRONT of the copy now
          (z-10) — the title arrives behind the grain and the material clears as
          the sentences land — but under reduced motion it puts itself back at
          -z-10, where there is no scroll to clear it. Without a stacking context
          here that negative index escapes the section and the material paints
          BEHIND the page ground, where --bg's near-black hides it completely. */}
      {/* -mt-28 CANCELS main's pt-28, AND THAT IS WHAT MAKES THE PIN HONEST. The
          hero used to start 7rem down the document, so the first 112px of wheel
          moved the page before the pin could catch it: the material slid up, the
          chrome lifted, and only then did anything hold still — a stutter on the
          one screen that has to be still. Flush with the top of the document,
          "top top" IS scroll position 0 and the hero is held from the first
          pixel. The header floats over the material, which is what a fixed bar
          over a full-bleed hero should do anyway; the section's own pt-28 keeps
          the copy clear of it. min-h-svh, so the pinned box is exactly one
          screen — see HeroIntro.tsx on what happens when it is taller. */}
      {/* justify-CENTER, not justify-end. Measured at 1063×720: the copy is 472px
          tall in a 720px screen, and bottom-anchoring left 208px of air above it
          against 40px below — a 5:1 imbalance that read exactly as what it was,
          a block that had fallen to the foot of the frame. It was the right
          anchor for a hero that scrolled past; it is the wrong one for a hero
          held still on its own screen, and doubly wrong now that every part of
          the copy arrives OUT OF THAT SCREEN'S CENTRE. The point things come from
          and the point they settle around have to be the same point.
          The asymmetric padding that stays (pt-28 against pb-10) is what keeps a
          little more air above than below — optical centre, not geometric.
          min-h, not h: where the copy is taller than the screen the section grows
          and centring cannot push anything off the top. */}
      <section
        data-hero-section
        /* max-md:pt-[calc(100svh+7rem)] — the plate's screen, reserved in the
           layout. Under 768px Passer stops after one screen (its own note has
           the argument) and the copy takes the next one, in ordinary flow,
           already visible. justify-start there because centring a column that
           now begins a screen down would push its foot off the page. The two
           lengths are one decision: this padding and the host's height. */
        className="relative isolate -mt-28 flex min-h-svh flex-col justify-center pb-10 pt-28 max-md:justify-start max-md:pt-[calc(100svh+7rem)]"
      >
        {/* The hero's material — three printing plates made of particles, in
            register at the top of the page and coming apart as it scrolls. See
            components/Passer.tsx for why this is the bespoke element. */}
        <Passer />

        {/* Registration annotation — the hero reads as a measured plate: located
            coordinates at the left, the live convergence readout at the right.
            The readout is an empty element on purpose: Konvergenz finds it and
            writes into it, so the value lives at the top of the HERO, opposite
            the coordinates, instead of inside the title block it is measured
            from. */}
        {/* top-[7.5rem], not top-2: the section starts at the top of the document
            now, so a 2-unit offset would print both annotations underneath the
            fixed header. 7rem of chrome plus the same half-rem of air they had. */}
        <p
          data-hero="coord"
          className="hud pointer-events-none absolute left-0 top-[7.5rem] flex items-center gap-2 text-muted-dim"
        >
          <span aria-hidden="true" className="inline-block h-2 w-2 border-l border-t" style={{ borderColor: "var(--line)" }} />
          52.5200°N · 13.4050°E
        </p>
        <p
          data-hero="readout"
          aria-hidden="true"
          className="hud accent-t pointer-events-none absolute right-0 top-[7.5rem] hidden text-accent md:block"
        />
        <div className="relative">
          <p data-hero="kicker" className="hud hud-wide text-accent accent-t">
            <L en="NULLPUNKT — THE LAB OF " de="NULLPUNKT — DAS LABOR VON " />
            <span className="text-ink">{site.owner.toUpperCase()}</span>
            <L en=" · CREATIVE DEVELOPER — DESIGN + BUILD · BERLIN" de=" · CREATIVE DEVELOPER — DESIGN + BUILD · BERLIN" />
          </p>
          {/* THE TITLE IS SIZED TO THE SCREEN, NOT TO THE WIDTH, and that is what
              the pin costs. It was text-5xl / 8xl / 9xl — a width ladder, which
              is the right instinct for a hero that scrolls and the wrong one for
              a hero that is HELD: at 1280×720 the flat 128px took three lines of
              376px and put the whole section 117px past the window, so the pin
              could not take it and the reveal fell back to the unpinned path on
              an ordinary laptop. min(vw, vh) lets the width decide while there is
              room and the height decide when there is not, so the composition
              fits one screen at every shape instead of only at tall ones. The
              7.5rem cap keeps it off a 1920 display's throat; the 2.75rem floor
              is what a phone reads. */}
          <h1
            data-hero="title"
            className="mt-6 max-w-5xl text-[clamp(2.75rem,min(8.6vw,12.4vh),7.5rem)] font-medium leading-[0.98] tracking-[-0.02em]"
          >
            {/* The title is the instrument now. It arrives with its three colour
                channels apart and scroll brings them together — see
                components/Konvergenz.tsx for why those three colours are the
                only ones that can be used here. */}
            <Konvergenz>
              <L text={site.tagline} />
            </Konvergenz>
          </h1>
          <p data-hero="manifesto" className="mt-6 max-w-xl leading-relaxed text-muted">
            <L text={site.manifesto} />
          </p>

          <p data-hero="fig" className="hud mt-10 text-muted-dim">
            FIG.01 — OPERATOR READINGS
          </p>
          {/* data-hero="grid" — AND THE GRID ITSELF HAS TO BE PARKED, not just
              its cells. This element carries `background: var(--line)` and the
              cells sit on it at gap-px: the hairlines between readings ARE this
              fill showing through the 1px seams. Park only the cells and their
              bg-bg goes transparent while the fill stays — which is a solid
              14 % ink rectangle, full measure, sitting under the word on the
              first screen. It was the grey box in the hero, and it was visible
              from the very first frame of every visit. */}
          <dl
            data-hero="grid"
            className="accent-t m-0 mt-3 grid grid-cols-2 gap-px border-t md:grid-cols-5"
            style={{ borderColor: "var(--line)", background: "var(--line)" }}
            aria-label="Operator readings"
          >
            {site.operator.map((o) => (
              <div
                key={o.k.en}
                data-hero-cell
                className={`bg-bg px-1 pb-1 pt-4 ${o.hot ? "border-t-2 border-accent" : ""}`}
              >
                <dt className="hud text-muted-dim">
                  <L text={o.k} />
                </dt>
                <dd className={`hud m-0 mt-2 ${o.hot ? "text-accent" : "text-ink"}`}>
                  <L text={o.v} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroIntro />
      </section>

      <Selected />

      {/* FIELD NOTES — full-width, kicker on top (the loud, edge-to-edge
          archetype). It follows the shelf directly: the shelf is the four cases
          that earned a write-up, this is the eight that shipped without one, and
          between them they are the whole body of evidence. Splitting them —
          which is what the stack and the CV used to do — meant a reader who came
          to see the work had to scroll past two sections about the person to
          find the rest of it.

          These two are also the page's only consecutive pair of railless
          sections, which is deliberate: the missing rule is what marks them as
          one block. Strict rail/no-rail alternation resumes below. */}
      <section
        id="field-notes"
        aria-label="Uncatalogued experiments"
        className="border-t py-16 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          {/* Heading, for the same reason SELECTED's kicker became one: these
              two sections are the whole body of evidence and neither appeared
              in the document outline. Same classes — the picture does not
              change, the outline does. */}
          <h2 className="hud hud-wide text-accent accent-t">FIELD NOTES — LIVE, UNCATALOGUED</h2>
          <p className="hud accent-t flex items-center gap-2 text-muted-dim">
            <span aria-hidden="true" className="np-pulse inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            S.02 / {SECTIONS} · <L en="LIVE" de="LIVE" />
          </p>
        </div>
        <p className="max-w-xl leading-relaxed text-muted">
          Not everything has earned a write-up yet. These ship as-is — open them, they are the
          argument.
        </p>
        <FieldNotes />
      </section>

      {/* WERDEGANG — the dates a German recruiter looks for first, in the site's
          own language: a measured axis, not a CV table. First section after the
          evidence, and the first railed one, so the page visibly changes subject
          here: everything above is the work, everything below is the person. */}
      <section
        id="werdegang"
        aria-label="Career stations"
        className="border-t py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Rail kicker={<L en="WERDEGANG — THE STATIONS" de="WERDEGANG — DIE STATIONEN" />} n="03" />
        <div className="md:col-span-9">
          <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
            <L
              en="Trained as a designer, then taught to build."
              de="Als Gestalter ausgebildet, dann das Bauen gelernt."
            />
          </h2>
          <div className="mt-10">
            <Werdegang />
          </div>
        </div>
      </section>

      {/* CAPABILITIES — a channel rack, and now literally so: six modules seated
          in it, each with a faceplate carrying its channel number.

          This used to be ruled columns sharing one --line ground at gap-px, and
          the note here used to argue that against "the boxed spec tiles in Under
          the Hood". The columns lost. A shared ground cannot be animated — fade
          a cell and the line colour shows through the hole where it was — so the
          section could only ever arrive as one block, on the one section that is
          a list of separable things. Modules with their own borders can arrive
          one at a time, which is what a rack filling up actually looks like.

          The silhouette still has to stay off Under the Hood's, and it does, on
          a different axis than before: those are a filled surface panel, these
          are open frames on the page ground with a ruled faceplate at the top.
          No rail — the marker row carries the section number instead — which
          keeps it off-beat between two railed neighbours. */}
      {/* data-reveal-pinned, NOT data-reveal: this section's arrival is owned by
          components/Rack.tsx, which pins it and carries the modules in, so a
          second effect fading the whole block from zero underneath that is one
          hand too many. Marked here in the server HTML rather than decided at
          runtime, because the two used to race: Reveal depends on FX.07 and
          re-creates every tween whenever any switch moves, so a Rack that
          retired the reveal once at mount could not catch the one built after
          the next toggle — measured, the section stood at opacity 0 through the
          whole pin with the rack loading invisibly inside it.
          Reveal still wipes this heading with FX.07; see its h2 selector. */}
      <section
        id="capabilities"
        aria-label="Capabilities"
        className="border-t py-16 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal-pinned
      >
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
          <p className="hud hud-wide text-accent accent-t">
            <L
              en="CAPABILITIES — MEASURED FROM THE WORK"
              de="FÄHIGKEITEN — AN DER ARBEIT GEMESSEN"
            />
          </p>
          <p className="hud text-muted-dim">
            S.04 / {SECTIONS} · <L en="IN PRODUCTION" de="IN PRODUKTION" />
          </p>
        </div>

        <h2 className="max-w-3xl text-2xl font-medium md:text-4xl">
          <L en="Every tool here ships in a case above." de="Jedes Werkzeug hier läuft in einem Case oben." />
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          <L
            en="No stack I can't point at. Each entry below is in production somewhere in the archive — the work is the reference."
            de="Kein Stack, auf den ich nicht zeigen kann. Jeder Eintrag unten läuft irgendwo im Archiv in Produktion — die Arbeit ist die Referenz."
          />
        </p>

        <Rack />

        {/* Real gaps over the page ground, not gap-px over a --line fill. The
            hairline between modules is now each module's OWN border, and that is
            the change that makes the rest possible: a shared ground cannot be
            animated, because fading a cell shows the line colour through the
            hole where the cell was. Separate frames can arrive one at a time.
            Three up and two down, not six across: on the narrowed measure six
            columns leave ~130px a group, which breaks entries like "Next.js
            (App Router)" over three lines and turns the rack into confetti.

            auto-rows-fr FROM TWO COLUMNS UP: every row is cut to the tallest
            module in the grid, so all six frames are one size and the rack
            reads as one instrument instead of six cards of six heights. Not on
            the single column, where equal rows would only stretch a three-entry
            module to the height of a six-entry one down the whole phone page —
            side by side that evenness is the point, stacked it is just air. */}
        <div className="mt-12 grid grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            // data-rack-card is the hook components/Rack.tsx seats. Inert markup
            // when the effect is not running, in the same way the transport
            // hooks are — with nothing animating this is simply six bordered
            // modules. The module is what travels; the rows travel with it,
            // which is why they carry no hook of their own.
            <article
              key={c.group}
              data-rack-card=""
              className="accent-t flex flex-col border"
              style={{ borderColor: "var(--line)" }}
            >
              {/* The faceplate. Channel number on the RIGHT, because that is
                  where this page has put running indices since the first build
                  — S.01 / 07 in every section marker, F.01 down the field notes.
                  A rack that numbered its modules on the other side would be
                  reading against its own page. */}
              <header
                className="flex items-baseline justify-between gap-3 border-b px-4 py-3"
                style={{ borderColor: "var(--line)" }}
              >
                <span data-rack-label className="hud accent-t text-accent">
                  {c.group}
                </span>
                <span className="hud text-muted-dim">
                  CH.{String(i + 1).padStart(2, "0")}
                  {/* A measured count, not a decoration: it is the length of the
                      list directly beneath it, so it cannot drift from what it
                      claims. The page's rule is that a number has to be read off
                      something real, and this one is read off the markup. */}
                  <span className="ml-2 opacity-70">
                    ×{String(c.items.length).padStart(2, "0")}
                  </span>
                </span>
              </header>

              <ul className="m-0 flex-1 list-none px-4 py-1">
                {c.items.map((it) => (
                  <li
                    key={it}
                    className="border-t py-2.5 text-sm leading-snug text-muted transition-colors duration-200 first:border-t-0 hover:text-ink motion-reduce:transition-none"
                    style={{ borderColor: "var(--line)" }}
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* UNDER THE HOOD — a surface panel ("the machine room"), the only section
          with a fill, so it reads as an inset instrument rack, not another rail.
          It overhangs the measure to --bleed rather than running to the screen
          edge: at 50rem of page a band the full width of the window would be the
          widest thing here by half again, and the narrowing would read as a
          mistake in everything else rather than as the page's own width. */}
      <section
        id="hood"
        /* FULL BLEED, AND 9.5238% IS DERIVED — DO NOT RETYPE IT AS A GUESS.
           This band used `--bleed` (clamp 1.25rem…4.5rem) and so reached 72px
           from the window at 1440 while every other edge on the page sits at
           115: not aligned, and not full bleed either, which is exactly how it
           read — slightly too wide, for no stated reason. Every other rule here
           is on the instrument's scale (POS 08% / 92%, printed in the hero
           readout); that one was on nothing.

           The obvious fix is the trap `globals.css` warns about: `--gutter` is
           8% OF THE PAGE, but a negative margin on a child of <main> resolves
           against MAIN'S CONTENT BOX, so -8% here is 96.8px, not 115.2, and
           leaves an 18px sliver. Main's content is 84% of the page (100 − 2×8),
           so the same distance expressed against it is 8 / 0.84 = 9.5238%.
           Being a percentage of the same page width, it is exact at every
           window size, not just at 1440. If `--gutter` ever moves off 8%, this
           number has to move with it — it is derived, not chosen.

           vw was the other candidate and is wrong for the reason `globals.css`
           already gives: vw counts the scrollbar, so 100vw would hang the band
           half a scrollbar past the edge on every machine that has one. */
        className="-mx-[9.5238%] border-y px-[9.5238%] py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        data-reveal
      >
        <Rail kicker="UNDER THE HOOD" n="05" />
        <div className="md:col-span-9">
          <h2 className="max-w-2xl text-2xl font-medium md:text-4xl">
            One operating system, every output.
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            Every experiment above runs on the same written system — tokens, three type roles, one
            accent at a time. This page runs on it too; the spec below is the live one.
          </p>
          <div className="mt-10 grid gap-px md:grid-cols-3" style={{ background: "var(--line)" }}>
            {specs.map((s) => (
              <div key={s.title} className="bg-bg p-6">
                <h3 className="hud hud-wide accent-t mb-5 text-accent">{s.title}</h3>
                <dl className="m-0">
                  {s.rows.map(([k, v]) => {
                    const sw = swatchColor(k, v);
                    return (
                      // flex-wrap, so the pair sets itself. On a wide tile the
                      // label and the value sit on one ruled line, justified
                      // apart; on the narrowed measure a tile is ~150px and a
                      // reading like "SPLINE SANS MONO · UPPERCASE" cannot share
                      // a line with its label at any size worth reading, so the
                      // value drops under it — which is the same stacked dt/dd
                      // the hero's FIG.01 cells already use.
                      <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1.5">
                        <dt className="hud text-muted-dim">{k}</dt>
                        <dd className="hud m-0 flex items-center gap-2 text-right text-muted">
                          {sw && (
                            <span
                              aria-hidden="true"
                              className="accent-t inline-block h-2.5 w-2.5 border"
                              style={{ background: sw, borderColor: "var(--line)" }}
                            />
                          )}
                          {v}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}
          </div>
          <p className="hud mt-6 text-muted-dim">
            SHIP FLOOR — WCAG 2.1 AA · SEMANTIC HTML + JSON-LD · MOBILE-FIRST · REAL TELEMETRY ONLY
          </p>
        </div>
      </section>

      {/* ABOUT and CONTACT used to be one block, which made the page end on a
          crowded plate: prose, address, name note and CV links all fighting the
          form for the same eye. Split, each gets its own air — S.06 is who, S.07
          is how to reach him, and nothing else. */}
      {/* ABOUT — the page's one editorial spread, and the only place the type
          itself does the arguing. Three sizes, three jobs, stacked in that
          order: the claim set large and narrowed on Bricolage's width axis, the
          evidence held at a reading measure, the promise pulled back up in
          accent. Railless, on the beat between Under the Hood and Contact. */}
      <section
        id="about"
        aria-label="About"
        className="border-t pt-16 md:pt-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal-pinned
      >
        {/* MOVED INSIDE THE STACK, 17.08.2026. It used to sit here, above the
            frame, which meant it scrolled away the moment the pin engaged: for
            the whole run — the entire argument — S.06 was the one section on
            the page with no name and no number on it. The fixed bar does print
            "S.06 ABOUT" throughout, so nothing was lost that a reader could not
            find; what was lost was the label being where the thing it labels
            is.
            It is not a beat: `AboutDepth` collects `[data-about-beat]` and this
            carries no such attribute, so the depth machinery never sees it. In
            the flat build it is still simply the first block in the section,
            which is exactly what it was. globals.css parks it at the top of the
            frame when the effect is on. */}

        {/* THREE MOVEMENTS, ONE SECTION. The page numbers its sections S.01…S.07
            and calls itself seven sections in CLAUDE.md, so these are not three
            <section>s — they are three screen-held beats inside S.06. Splitting
            the element would have meant renumbering the whole page to gain
            nothing the eye can see.

            Each beat is given ~68svh rather than a full screen. A full screen
            each would add three screens of scroll for the same 764 words, and
            the page's measured problem is already that its length is bought
            with motion rather than content. 68 buys the pause without the debt.

            AND THE THREE ARE ALSO ONE FRAME, under FX.08. The wrapper below is
            what the effect pins: the beats go into a single cell, at three
            different distances from the reader, and the run carries the section
            through them instead of carrying them past the section. The markup
            is the flat page — three blocks, in order, each readable on its own —
            and stays that way with the switch off, with JavaScript off, and
            under reduced motion; components/fx/AboutDepth.tsx writes the layout
            switch itself rather than leaving it to the stylesheet, and its own
            note says why that is the wrong way round everywhere else on this
            page and the right way round here.

            The claim. Narrowed (wdth 85) and held at the largest optical size so
            the face tightens as it grows — display type behaving like display
            type, instead of body copy scaled up. */}
        <div data-about-stack="">
          <div
            data-about-kopf=""
            className="mb-12 flex flex-wrap items-baseline justify-between gap-3"
          >
            <p className="hud hud-wide text-accent accent-t">
              <L en="ABOUT — ROLE OR AGENCY WORK" de="ÜBER MICH — STELLE ODER AGENTURARBEIT" />
            </p>
            <p className="hud text-muted-dim">S.06 / {SECTIONS}</p>
          </div>

          <div data-about-beat="" className="flex min-h-[92svh] flex-col items-center justify-center overflow-x-clip text-center">
            {/* IT CROSSES THE PAGE'S OWN RULES, and that is the one liberty taken
                here. Every other edge on this site aligns to --gutter, which the
                hero's readout names out loud as POS 08% and POS 92% — the margins
                are not a habit, they are printed on the instrument's scale. So the
                single line allowed over them is the claim, and it is over them by
                about five per cent a side: 112% of a column that is itself 84% of
                the page comes to 94% of the viewport, centred. Wide enough to read
                as a refusal, short of the edge so nothing scrolls sideways —
                measured at 0px of horizontal overflow.

                WEIGHT 400 AT 144px, not 500. The safe move at this size is to go
                heavier and the result is a poster; light and tight at display size
                is what reads as confidence rather than volume. wdth 82 narrows the
                face further so three lines still hold together as a block. */}
            <h2
              data-satz
              className="font-display w-[112%] max-w-none text-balance text-[clamp(2.4rem,10vw,9rem)] font-normal leading-[0.88] tracking-[-0.055em] text-ink"
              style={{ fontVariationSettings: '"wdth" 82, "opsz" 96' }}
            >
              {/* LSatz, not L, on all three [data-satz] beats — FX.08 splits
                  this into lines and SplitText rewrites the innerHTML of
                  whatever it is given. The span is the seam that keeps that off
                  React's text node; components/Lang.tsx has the full reason. */}
              <LSatz text={site.aboutLead} />
            </h2>
          </div>

          {/* One column, read top to bottom: evidence, then promise, then the
              documents. The promise used to sit in a second column beside the
              evidence, which asked the reader to hold two threads at once and let
              the eye reach the closing line before the paragraph that earns it.
              Stacked, the order is the argument's own order — and on the narrowed
              measure a 6+5 spread would leave two columns of about 24 characters,
              which is below a readable line anyway. */}
          {/* The evidence. Was reading size in a 46ch column, which made it the one
              paragraph on the page a reader could skim past — the exact opposite of
              what a section whose argument IS the type should do. Now it is set
              large and given its own beat, but on a 30ch measure so it is still a
              paragraph and not a slogan: three or four lines that have to be read,
              rather than one line that can be glanced at. */}
          {/* Centred too, but on a 26ch measure and not a character wider. Centred
              setting costs a reader something real — every line starts at a
              different x, so the eye has to find the beginning again each time —
              and that cost is only payable while the lines are few and near equal.
              text-balance is doing the actual work here; without it this beat is
              the one that would break. */}
          <div
            data-about-beat=""
            className="flex min-h-[80svh] items-center justify-center border-t text-center"
            style={{ borderColor: "var(--line)" }}
          >
            <p
              data-satz
              className="font-display max-w-[26ch] text-balance text-[clamp(1.5rem,5vw,3.6rem)] font-normal leading-[1.14] tracking-[-0.03em] text-ink"
              style={{ fontVariationSettings: '"wdth" 88, "opsz" 40' }}
            >
              <LSatz text={site.aboutBody} />
            </p>
          </div>

          {/* The promise, and the documents that back it. These stay together: the
              claim is only worth as much as the links under it, and separating
              them would leave the strongest line on the page with nothing to
              point at. */}
          <div
            data-about-beat=""
            className="flex min-h-[80svh] flex-col items-center justify-center border-t text-center"
            style={{ borderColor: "var(--line)" }}
          >
            <p className="hud text-muted-dim">
              <L en="— THE PROMISE" de="— DAS VERSPRECHEN" />
            </p>
            <p
              data-satz="promise"
              className="accent-t font-display mt-6 max-w-[20ch] text-balance text-[clamp(1.9rem,6.4vw,4.8rem)] font-normal leading-[1.02] tracking-[-0.04em] text-accent"
              style={{ fontVariationSettings: '"wdth" 88, "opsz" 48' }}
            >
              <LSatz text={site.aboutClose} />
            </p>
            {/* gap-y-6, not gap-y-3, and the reason is the hit area rather than
                the rhythm: .np-tap extends each link 12px above and below its
                20px line box, so at the old 12px row gap two stacked rows would
                have overlapped by 12px and a tap in the seam would have landed
                on whichever came later in the DOM. At 24px they meet exactly and
                never cross. This only shows on a phone — measured 01.09.2026 at
                390px, where 240 + 175 + 175 cannot sit on one line and the row
                wraps; at 1440 the three stay on one row and gap-y is never
                consulted, so the desktop composition is untouched. */}
            <ul className="hud mt-12 flex list-none flex-wrap justify-center gap-x-6 gap-y-6 p-0">
              {/* THESE TWO WERE THE HARDEST THING ON THE PAGE TO RECOGNISE AS
                  CLICKABLE, and Antony said so on 18.08.2026. Three separate
                  reasons, all fixed here rather than one of them:
                  · they were --muted, the dimmest colour on the page, on the
                    one line whose whole job is to be taken up. Now --ink.
                  · the mark beside them was ↗, which means "opens elsewhere".
                    A CV is something you TAKE, so it is ↓ and the link now
                    carries `download` — the glyph and the behaviour agree.
                  · nothing said what the file was. The tag says PDF and the
                    real size, which is the ordinary courtesy of any link that
                    starts a download, and it is NOT aria-hidden: a screen
                    reader is exactly the reader who should be told before
                    the file lands. */}
              {site.links.map((l) => {
                /* An external link takes the other branch of the 18.08 rule: it
                   is not taken, it is gone to. No `download`, a new tab, ↗ — and
                   its tag names the destination instead of a file size, because
                   there is no file and no cost, only a place. */
                const groesse = l.extern ? null : dateigroesse(l.href);
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      download={l.extern || l.placeholder ? undefined : ""}
                      target={l.extern ? "_blank" : undefined}
                      rel={l.extern ? "noopener noreferrer" : "noopener"}
                      className="accent-t np-zug np-tap inline-flex items-center gap-2 text-ink no-underline hover:text-accent"
                      title={l.placeholder ? "Placeholder — add real URL" : undefined}
                    >
                      <Walze en={l.label} de={l.label} />
                      <span
                        className="inline-block border px-1.5 py-0.5 text-[0.5625rem] tracking-[0.14em] opacity-75"
                        style={{ borderColor: "currentColor" }}
                      >
                        {l.extern ? l.tag : `PDF${groesse ? ` · ${groesse}` : ""}`}
                      </span>
                      <span aria-hidden="true" className="opacity-50">{l.extern ? "↗" : "↓"}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Antony Vu is the working name; the CV and the certificates carry
                the legal one. Stated once so the two documents read as one
                person — which is why it belongs HERE, under the two links it
                explains, and not where it was.
                It used to close the section from OUTSIDE the stack: a full-width
                rule and then the only left-aligned line in a section that is
                centred from top to bottom, ~250px below the links, after the pin
                had already released. It read as the page's footer rather than as
                a sentence about the documents directly above it.
                Inside the beat it is inside the pinned volume, so it now travels
                in depth with the promise instead of standing still. That is the
                price and it was taken deliberately: a note nobody connects to
                anything is worse than a note that moves. */}
            <p className="hud mt-10 text-muted-dim">
              <L
                en={`${site.wordmark} IS THE NAME I WORK UNDER — ON PAPER, ${site.legalName.toUpperCase()}`}
                de={`${site.wordmark} IST MEIN ARBEITSNAME — BÜRGERLICH ${site.legalName.toUpperCase()}`}
              />
            </p>
          </div>
        </div>
      </section>

      <section
        id="contact"
        aria-label="Contact"
        className="border-t py-16 md:grid md:grid-cols-12 md:gap-x-6 md:py-24"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Rail kicker={<L en="CONTACT — DIRECT LINE" de="KONTAKT — DIREKTER DRAHT" />} n="07" draw={false} />
        <div className="md:col-span-9">
          {/* The name is the headline; the address sits under it as an
              instrument line. Someone who just wants to write — a recruiter with
              one question, an agency with a brief — never has to open the form
              to find out where to send it. */}
          <h2
            className="accent-t font-display text-[clamp(2.5rem,9vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-accent"
            style={{ fontVariationSettings: '"wdth" 88, "opsz" 48' }}
          >
            {site.owner}
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="accent-t np-zug hud mt-5 inline-flex min-h-[44px] items-center text-muted no-underline hover:text-accent"
          >
            <Walze en={site.email} de={site.email} />
          </a>
          <p className="hud mt-1 text-muted-dim">
            <L
              en="REMOTE OR BERLIN · RESPONSE WITHIN 48H · DE / EN / VI"
              de="REMOTE ODER BERLIN · ANTWORT BINNEN 48H · DE / EN / VI"
            />
          </p>
          <div className="mt-14 max-w-3xl border-t pt-10" style={{ borderColor: "var(--line)" }}>
            <Kontakt />
          </div>
        </div>
      </section>
    </>
  );
}
