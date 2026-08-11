"use client";

import { useLang, type Copy } from "@/components/Lang";

/**
 * DIE WALZE — a label set on a cylinder, turned by the pointer.
 *
 * Each character sits in its own window with two copies of itself on a roller:
 * the one being read, and the one waiting under it. Pointing at the link turns
 * every roller, one after the next along the word, and the copy that was
 * waiting comes up into the window while the one that was read leaves through
 * the top, smearing as it goes.
 *
 * BORROWED FROM TRIONN, AND ADAPTED RATHER THAN COPIED. Their `.nav-link` is
 * the reference: an `.original` layer and an absolutely positioned `.clone` at
 * opacity 0, per-character, driven from JavaScript. What makes it belong on
 * this page is that this page is a PRESS. A press has a Walze — the cylinder
 * the sheet is carried on — so a label that turns over is not a web mannerism
 * borrowed for its own sake, it is the same machine the hero is already built
 * out of, running at the scale of a word. The hero misregisters; the links
 * turn. One shop.
 *
 * IN REACT, NOT IN THE DOM, and this is the whole reason the effect is
 * affordable here. Trionn's clone is real duplicated markup — their nav link's
 * textContent reads "WorkWork" — and the equivalent on this page would be a
 * SplitText-style rewrite of an element React owns, which is exactly the trap
 * components/Lang.tsx documents at length after FX.08 walked into it: React
 * keeps a fiber pointing at the text node it wrote, and an effect that rebuilds
 * that node breaks the EN/DE switch silently. Rendering both copies from the
 * same source string means React owns every character, the language switch is
 * an ordinary re-render, and nothing has to be reverted before it. Konvergenz
 * takes the same route for the same reason — it prints three colour channels of
 * the title as three React children rather than cloning the h1.
 *
 * THE ACCESSIBLE NAME IS NOT SPLIT. Forty spans of one letter each is forty
 * things for a screen reader to say. The word is therefore present ONCE, whole,
 * in an .sr-only span — still in the accessibility tree, still found by
 * find-in-page — and the rollers are decoration and marked as such. Same
 * division Konvergenz makes between its real text and its channels.
 *
 * NO MEASUREMENT, NO JAVASCRIPT AT RUNTIME. The stagger is a transition-delay
 * computed from the character's own index (see globals.css), so the whole
 * effect is one CSS state change on hover. The bench's effects earn their JS by
 * being scroll-driven; a hover does not, and this page already has a measured
 * main-thread problem it should not be adding hover handlers to.
 */
export function Walze({
  text,
  en,
  de,
  className = "",
}: {
  text?: Copy;
  en?: string;
  de?: string;
  className?: string;
}) {
  const { lang } = useLang();
  const pair = text ?? { en: en ?? "", de: de ?? "" };
  const wort = lang === "de" ? pair.de : pair.en;
  /* Spread, not split(""): a surrogate pair is two code units and one letter,
     and splitting between them prints two replacement characters. The copy here
     is Latin today and the arrows in these labels (↗, ↓) already sit outside
     the BMP's easy half. */
  const zeichen = [...wort];

  /* ——— THE SPREAD IS FIXED, THE STEP IS NOT ——————————————————————————————
     A flat delay per character was the obvious way to write this and it makes
     the effect a function of how long the word is. Measured: 14ms a character
     put the wordmark's last letter at 112ms and LEBENSLAUF (DE, PDF)'s twentieth
     at 266ms — plus the 260ms travel, that label was still turning half a second
     after it was pointed at, on a page that already lags the wheel by 0.6s. The
     email is longer again.
     Dividing a fixed spread by the character count instead makes every label
     take the same time to turn over: nine letters step coarsely, twenty step
     finely, both are finished at 140 + 260ms. Computed here rather than in
     calc(), because dividing by a var() is not something CSS can be relied on
     to do — and this runs once per render, not once per frame. */
  const SPUR = 140;
  const schritt = SPUR / Math.max(zeichen.length - 1, 1);

  return (
    <span className={`np-walze ${className}`}>
      <span className="sr-only">{wort}</span>
      <span aria-hidden="true" className="np-walze-satz">
        {zeichen.map((z, i) => (
          /* A space has no glyph to roll and collapses to nothing inside an
             inline-block, which would close the word up the moment it turned.
             The roller is kept and filled with a non-breaking space, so the
             gap turns with everything else and the measure never changes. */
          <span
            key={`${z}-${i}`}
            className="np-walze-fach"
            style={{ ["--d" as string]: `${(i * schritt).toFixed(1)}ms` }}
          >
            <span className="np-walze-a">{z === " " ? " " : z}</span>
            <span className="np-walze-b">{z === " " ? " " : z}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

export default Walze;
