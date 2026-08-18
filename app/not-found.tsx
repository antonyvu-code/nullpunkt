import Link from "next/link";
import { L } from "@/components/Lang";
import { Walze } from "@/components/Walze";

/**
 * 404 — and the reason this file exists at all is a measurement.
 *
 * There was no `not-found.tsx`, so Next served its own built-in one. That
 * component ships inline styles of its own, including `background: #fff` on
 * BODY, while this site's `html` is #050505 and its text is #f2f0eb — so the
 * page rendered the site's ink on Next's white ground. Measured 17.08.2026 in
 * the stage-4 sweep across every route: **16 elements under 4.5:1, the wordmark
 * at 1.14:1**. Effectively an unreadable page, and the only reason nobody had
 * seen it is that every check this project ever ran was run on the home page.
 *
 * It renders inside the root layout like every other route, so the header, the
 * progress rule and the footer are already here; this file only has to be the
 * middle of the page — and to exist, which is the part that fixes the ground.
 *
 * No h1 of its own beyond the one below: a 404 is a page, and a page gets one.
 */
export default function NotFound() {
  return (
    <section
      aria-label="Not found"
      className="flex min-h-[62svh] flex-col items-center justify-center border-t py-20 text-center"
      style={{ borderColor: "var(--line)" }}
    >
      <p className="hud text-muted-dim">ERR 404 · NO SUCH ADDRESS</p>

      <h1
        className="font-display mt-6 max-w-[18ch] text-balance text-[clamp(2rem,7vw,5rem)] font-normal leading-[1.02] tracking-[-0.04em] text-ink"
        style={{ fontVariationSettings: '"wdth" 88, "opsz" 48' }}
      >
        <L en="The needle is off the scale." de="Der Zeiger steht außerhalb der Skala." />
      </h1>

      <p className="mt-6 max-w-[42ch] leading-relaxed text-muted">
        <L
          en="This address does not resolve to anything on this site. Nothing was deleted — it was most likely never here."
          de="Diese Adresse führt auf dieser Seite nirgendwohin. Es wurde nichts gelöscht — vermutlich war hier nie etwas."
        />
      </p>

      {/* Two ways on, and both are places rather than apologies: the top of the
          argument, and the whole archive. A 404 that only offers "go home"
          sends a reader who was looking for one specific case back to the
          beginning of a 17-screen page. */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <Link
          href="/"
          className="accent-t np-zug font-display inline-flex min-h-[44px] items-center gap-3 text-2xl font-medium text-ink no-underline hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          <Walze en="Back to the start" de="Zurück zum Anfang" />
        </Link>
        <Link
          href="/work"
          className="accent-t np-zug hud inline-flex min-h-[44px] items-center gap-2 text-muted no-underline hover:text-accent"
        >
          <Walze en="OR OPEN THE FULL ARCHIVE" de="ODER DAS GANZE ARCHIV ÖFFNEN" />
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
