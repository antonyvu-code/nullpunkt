"use client";

import { useFx } from "@/components/fx/FxProvider";

/**
 * THE TITLE'S FRINGE — the hero's detail, no longer the hero's instrument.
 *
 * WHAT CHANGED, 09.08.2026, AND WHY. This used to be the hero: the title arrived
 * misconverged and scroll pulled it together. Der Passer (components/Passer.tsx)
 * is the hero now, and running both meant two colour-separation ideas saying the
 * same thing in two different colour languages on one screen. Worse, they ran
 * OUT OF PHASE: at the top of the page this was at its loudest — three channels
 * flung apart — at exactly the moment the material behind it was in perfect
 * register, which is the calm frame the whole site is named after. The most
 * important picture on the page was being shouted over by its own decoration.
 *
 * So it is reversed. The title now starts in register, as clean ink, and comes
 * apart as the plates behind it come apart. One gesture, and the top of the page
 * is quiet.
 *
 * WHY THE COLOURS ARE THESE THREE. They are not "red, green, blue" — they are
 * --ink taken apart. #f2f0eb is (242,240,235); screen-compositing #F20000,
 * #00F000 and #0000EB returns exactly that, because screen(a,b) = 1-(1-a)(1-b)
 * and each channel is carried by exactly one layer. The hero borrows no new
 * colour at all: it separates the colour the page already writes in. A
 * hand-picked red/green/blue would have been decoration; this is the palette
 * proving something about itself.
 *
 * THE REAL TEXT NO LONGER FADES, AND THAT IS THE POINT OF THE REWRITE. The old
 * version crossfaded: the three coloured copies were the visible title while the
 * real one sat at opacity 0, and the real one faded in as they landed. Reversing
 * that naively would have run the crossfade backwards and left the h1 at
 * opacity 0 at the bottom of the hero — an invisible heading, on a page that
 * prints WCAG 2.1 AA in its own capability list, and the exact failure
 * HeroIntro.tsx documents at length. Instead the real text is simply always
 * present and the CHANNELS fade in as they separate: at register there is
 * nothing on top of the ink to blow it out, and off register there are coloured
 * fringes on an ink title. That is also what misregistration actually looks
 * like on paper.
 *
 * REVERSED AGAIN, 10.08.2026, AND THIS TIME BY THE MATERIAL. The paragraph above
 * describes a hero whose plates stayed on screen: fringe growing with --passer
 * was then the same gesture as the plates separating. The material now CLEARS as
 * the copy lands, and that broke the argument arithmetically — at the end of the
 * run --passer is 1 and the plates are gone, so the fringe stood at maximum on a
 * title alone on a clean screen, with nothing left to explain it. Three coloured
 * copies of a heading with no visible cause is not misregistration, it is a
 * rendering fault.
 *
 * So it rides --schleier, which is how much plate is still in front of the type,
 * and the reading is better than either version: the title is inside the
 * material, mis-registered BY it, and comes into register as it emerges. The
 * fringe is not a decoration on the title — it is the material's own separation
 * borrowed by whatever is standing behind it. It ends as clean ink, which is
 * also the only end state a heading should have.
 *
 * NO SCROLLTRIGGER, NO JAVASCRIPT. Both numbers come from Passer, which is
 * already doing the measurement; a second trigger over the same runway would be
 * a second source of truth for one movement. If Passer never publishes — reduced
 * motion, or the effect switched off — the fallback is 0, which resolves to a
 * clean registered title. The honest still frame.
 */

/** --ink separated into three additive channels. See the note above. */
const CHANNELS = [
  { key: "r", color: "#F20000", dx: -0.055, dy: -0.028 },
  { key: "g", color: "#00F000", dx: 0.048, dy: -0.014 },
  { key: "b", color: "#0000EB", dx: 0.012, dy: 0.038 },
] as const;

export default function Konvergenz({ children }: { children: React.ReactNode }) {
  /* Rides the same switch it always did, and the same one the phosphor dot at
     the foot of the page rides. Off means the plate is in register: no fringe. */
  const dock = useFx("scope-dock");

  return (
    /* isolate: the three channels have to screen against EACH OTHER and against
       the ink beneath them, not against the page ground — --bg's near-black
       would lift every channel and the fringe would never sit on --ink exactly. */
    <span className="relative block" style={{ isolation: "isolate" }}>
      {/* The real text — one copy, in the document, in the accessibility tree,
          findable by find-in-page, and never animated. The channels are
          decoration and are marked as such. */}
      <span className="relative block" style={{ zIndex: 1 }}>
        {children}
      </span>
      {dock &&
        CHANNELS.map((c) => (
          <span
            key={c.key}
            aria-hidden="true"
            /* max-md:hidden — 01.09.2026, and it is the same decision as the
               one HeroIntro's narrow branch records. The channels ride
               --schleier, which Passer publishes across the plate's runway: on a
               desktop the title is under the plate the whole time it is split,
               and converges to clean ink as the material clears. On a phone the
               plate now has its own screen and the title lives on the NEXT one,
               so the split is no longer a fringe seen through material — it is
               just a heading with coloured edges, arriving before the veil has
               finished falling. Antony asked for the claim to read white on the
               phone; this is what was making it not.

               A media query rather than a JS condition, deliberately: the thing
               being switched off is decoration on the page's most important
               sentence, and it should not depend on anything running. */
            className="absolute inset-0 block max-md:hidden"
            style={{
              color: c.color,
              mixBlendMode: "screen",
              zIndex: 2,
              // As much fringe as there is plate in front of the type, and none
              // once it is through — so the title ends as clean ink and there is
              // never a separation on screen without a cause.
              opacity: "var(--schleier, 0)",
              // em, so the split scales with the clamp()ed display size instead
              // of being a fixed pixel offset that is huge on a phone.
              transform: `translate(calc(var(--schleier, 0) * ${c.dx}em), calc(var(--schleier, 0) * ${c.dy}em))`,
            }}
          >
            {children}
          </span>
        ))}
    </span>
  );
}
