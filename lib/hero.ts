/**
 * THE HERO'S RUNWAY — one number, read by two files.
 *
 * The hero is pinned while its copy is revealed (components/HeroIntro.tsx) and
 * the plates come apart over exactly the same stretch of wheel
 * (components/Passer.tsx, which publishes `--passer` from it). Two numbers here
 * would be two gestures on one screen — the material finishing while the type is
 * still arriving, or the other way round — so there is one.
 *
 * 2.4 SCREENS OF WHEEL. Der Passer used to run over 62 % of a window, and that
 * number was chosen for a hero that SCROLLED AWAY while it played: the gesture
 * had to be finished before the material left the fold. Pinned, the hero holds
 * the screen for the whole run, so that constraint is gone and the only question
 * left is how long a reader should be held.
 *
 * It was one screen, and one screen was too fast once there was something to
 * watch: the eye now travels through the plate stack — 1× to 3.7× across three
 * layers that arrive at three different times — and a fly-through the length of
 * a single flick of the wheel is a cut, not a movement. At the ~600–900 px/s a
 * reader actually scrolls at, 2.4 screens is roughly a second and a half more
 * than one, which is what was asked for.
 *
 * THIS IS THE KNOB. Everything paced by the hero — the reveal, the plates coming
 * apart, the approach, the fringe on the title — is a proportion of this number
 * and nothing else, so the whole opening can be made slower or faster here
 * without any of it drifting out of step.
 */
export const heroRunway = () => window.innerHeight * 2.4;
