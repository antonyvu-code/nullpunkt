/**
 * How often anything on this page is allowed to do per-frame work.
 *
 * WHY THERE IS A CAP AT ALL. Measured 14.08.2026 from a 36.4s DevTools trace on
 * Antony's own machine — a **360Hz** display — while scrolling the built home
 * page. The compositor was flawless: 13,094 `BeginFrame` at a 2.78ms median, not
 * one of them late. The renderer answered 205 times a second. 32% of its commits
 * overran a whole frame, 5.1% overran six, and the main thread was busy for 81%
 * of the wall clock. `PageAnimator::serviceScriptedAnimations` alone averaged
 * **2.34ms against a 2.78ms frame** — the budget was gone before style recalc
 * started. Four independent rAF loops were running on every one of those frames.
 *
 * None of that shows at 60Hz, where the same commits sit at 3.33ms inside a
 * 16.7ms budget. The site was never slow; it was written against an assumption
 * about frame rate that nothing in the repo had ever stated. This constant
 * states it.
 *
 * WHY 60 AND NOT "AS FAST AS THE DISPLAY". Scroll-driven work here is all
 * delta-time based — the swarm integrates `dt`, GSAP scrubs against elapsed
 * time, Lenis lerps against it — so running it less often changes how often the
 * result is sampled, not what it is. What the reader loses is sampling
 * resolution; what they gain is frames that arrive when the display asks for
 * them. 60 also divides 120, 180, 240 and 360 evenly, so the work lands on a
 * steady cadence on every common high-refresh panel instead of beating against
 * it. On a 60Hz machine this cap is inert.
 *
 * CHECKED, NOT ASSUMED — a per-frame lerp would have made this cap a change in
 * feel rather than in cost. Lenis damps with
 * `damp(value, to, lerp * 60, deltaTime)`, which is exponential decay against
 * elapsed time, so its smoothing converges at the same wall-clock rate at 60
 * ticks as at 360. ScrollTrigger's `scrub` is likewise a number of seconds of
 * lag, not of frames. Passer and EchoProbe both integrate `dt`. Nothing here
 * measures time in frames, which is the precondition for capping frames at all.
 *
 * TUNING IT BY EYE. The GSAP half can be changed live from the console without a
 * rebuild — `gsap.ticker.fps(120)` — which is the honest way to judge whether
 * more resolution is worth the frames it costs, on the display that has to show
 * it. The other two loops read the constant below.
 */
export const MOTION_FPS = 60;

/** Milliseconds between allowed frames, for the hand-rolled loops. */
export const FRAME_MS = 1000 / MOTION_FPS;
