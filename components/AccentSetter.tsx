"use client";

import { useEffect } from "react";
import { zeroAccent } from "@/lib/projects";

/** Case-study pages borrow their project's accent for the whole chrome,
 *  and hand it back (needle to zero) on unmount. */
export default function AccentSetter({ accent }: { accent: string }) {
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    return () => {
      document.documentElement.style.setProperty("--accent", zeroAccent);
    };
  }, [accent]);
  return null;
}
