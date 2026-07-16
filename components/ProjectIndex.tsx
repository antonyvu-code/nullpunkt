"use client";

import Image from "next/image";
import Link from "next/link";
import { projects, zeroAccent } from "@/lib/projects";

function setAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

export default function ProjectIndex() {
  return (
    <ol
      className="list-none border-t p-0"
      style={{ borderColor: "var(--line)" }}
      onMouseLeave={() => setAccent(zeroAccent)}
    >
      {projects.map((p) => (
        <li key={p.slug} className="m-0 p-0">
          <Link
            href={`/work/${p.slug}`}
            onMouseEnter={() => setAccent(p.accent)}
            onFocus={() => setAccent(p.accent)}
            onBlur={() => setAccent(zeroAccent)}
            className="accent-t group grid grid-cols-[3ch_88px_1fr] items-center gap-x-4 border-b px-3 py-5 no-underline md:grid-cols-[3ch_112px_1fr_auto] md:gap-x-6"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="hud text-muted group-hover:text-accent group-focus-visible:text-accent">
              {p.index}
            </span>
            <span className="block border p-0.5" style={{ borderColor: "var(--line)" }}>
              <Image
                src={p.plates[0].src}
                alt=""
                width={2400}
                height={1500}
                sizes="112px"
                className="block h-auto w-full opacity-60 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 motion-reduce:transition-none"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-xl text-muted group-hover:text-ink group-focus-visible:text-ink md:text-2xl">
                {p.title}
              </span>
              <span className="hud mt-1 block text-muted/70 md:hidden">{p.metaLine}</span>
            </span>
            <span className="hud hidden text-muted/70 group-hover:text-accent md:block">
              {p.metaLine}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
