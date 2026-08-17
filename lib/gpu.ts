/**
 * Is there a GPU stack behind this browser at all?
 *
 * Two places need the same answer and must not disagree about it: EchoProbe,
 * which refuses to download 252KB it cannot use, and Selected, which decides
 * what the specimen cell shows instead. It lives here so there is one probe and
 * one comment, not two that drift.
 *
 * THE GATE IS A CONTEXT, NOT `navigator.gpu`. Measured 15.08.2026 under
 * `chrome --disable-gpu` (OFFEN §16): the property is still there — the
 * interface exists, the adapter does not — so a gate on `"gpu" in navigator`
 * passes, the chunk comes down, and `WebGPURenderer` warns, falls back to
 * WebGL2 and then dereferences a null context. Both backends come off the same
 * GPU stack, so no WebGL means no adapter either. The one case this gets wrong,
 * WebGPU present while WebGL is absent, shows the plate rather than crashing.
 *
 * ON A THROWAWAY CANVAS, NEVER ON A REAL ONE. A canvas keeps the first context
 * type it is handed, so asking the question on the element that has to render
 * afterwards would spend the answer.
 *
 * Client only — it touches `document`. Call it from an effect, not during
 * render: the prerendered HTML has to be the same for every reader.
 */
export function hasGpuBackend(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}
