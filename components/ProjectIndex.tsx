"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/projects";

function setAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

/** The index's home-rest accent — the first experiment's signal, not zero. */
const homeAccent = projects[0].accent;

/** Shared column track so the header and every row align on the same grid. */
const COLS =
  "grid grid-cols-[3ch_88px_minmax(0,1fr)] items-center gap-x-4 md:grid-cols-[3ch_112px_minmax(0,1fr)_auto_1.25rem] md:gap-x-6";

export default function ProjectIndex() {
  // On entry the page is already calibrated to project 01 (see manifesto).
  useEffect(() => {
    setAccent(homeAccent);
  }, []);

  return (
    <div onMouseLeave={() => setAccent(homeAccent)}>
      {/* Column header — the index reads like an instrument log. */}
      <div
        className={`${COLS} hud border-b border-t px-3 py-2 text-muted-dim`}
        style={{ borderColor: "var(--line)" }}
        aria-hidden="true"
      >
        <span>Nº</span>
        <span>Preview</span>
        <span>Project</span>
        <span className="hidden md:block">Reading</span>
        <span className="hidden md:block" />
      </div>

      <ol className="list-none p-0">
        {projects.map((p) => (
          <li key={p.slug} className="m-0 p-0">
            <Link
              href={`/work/${p.slug}`}
              onMouseEnter={() => setAccent(p.accent)}
              onFocus={() => setAccent(p.accent)}
              className={`${COLS} accent-t group relative border-b px-3 py-5 no-underline transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] motion-reduce:transition-none`}
              style={{ borderColor: "var(--line)" }}
            >
              {/* Left signal bar — grows on hover in the borrowed accent. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
              />
              <span
                className={`hud group-focus-visible:text-accent ${
                  p.featured ? "text-accent" : "text-muted group-hover:text-accent"
                }`}
              >
                {p.index}
              </span>
              <span className="block overflow-hidden border p-0.5" style={{ borderColor: "var(--line)" }}>
                {p.plates[0] ? (
                  <Image
                    src={p.plates[0].src}
                    alt=""
                    width={2400}
                    height={1500}
                    sizes="112px"
                    className="block h-auto w-full scale-100 opacity-60 grayscale transition duration-500 group-hover:scale-[1.05] group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  // No plate shot yet — hold the slot at the same 16:10 ratio so the
                  // index rhythm survives. Deliberately empty: the number already sits
                  // in the column to the left, and a faked thumbnail would be a lie.
                  <span
                    aria-hidden
                    className="block aspect-[16/10] w-full"
                    style={{ background: "color-mix(in srgb, var(--line) 45%, transparent)" }}
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xl text-muted group-hover:text-ink group-focus-visible:text-ink md:text-2xl">
                  {p.title}
                  {p.featured && (
                    <span
                      className="accent-t ml-3 inline-block -translate-y-0.5 rounded-sm border border-accent px-1.5 py-0.5 text-accent"
                      style={{ fontSize: "9px", letterSpacing: "0.14em" }}
                    >
                      START HERE
                    </span>
                  )}
                  {p.label === "REBUILD" && (
                    <span
                      className="hud ml-3 inline-block -translate-y-0.5 rounded-sm border px-1.5 py-0.5 text-muted group-hover:border-accent group-hover:text-accent"
                      style={{ borderColor: "var(--line)", fontSize: "9px" }}
                    >
                      REBUILD
                    </span>
                  )}
                </span>
                <span className="hud mt-1 block text-muted-dim md:hidden">{p.metaLine}</span>
              </span>
              <span className="hud hidden text-muted-dim group-hover:text-accent md:block">
                {p.metaLine}
              </span>
              <span
                aria-hidden="true"
                className="hidden -translate-x-1 text-lg text-muted/40 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100 motion-reduce:transition-none md:block"
              >
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
