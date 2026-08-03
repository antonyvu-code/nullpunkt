"use client";

import { useEffect } from "react";
import { zeroAccent } from "@/lib/projects";

/** Case-study pages borrow their project's accent for the whole chrome,
 *  and hand it back (needle to zero) on unmount. */
export default function AccentSetter({ accent }: { accent: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    /* Published separately because --accent is written by everything that
       borrows — hover, the scroll dial, the notes sweep — so by the time any of
       them wants to hand the colour back, the property no longer remembers what
       "back" was. This one is only ever written here, and it is what the page
       rests on. */
    root.style.setProperty("--accent-rest", accent);
    return () => {
      root.style.setProperty("--accent", zeroAccent);
      root.style.setProperty("--accent-rest", zeroAccent);
    };
  }, [accent]);
  return null;
}
