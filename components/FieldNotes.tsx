import { fieldNotes } from "@/lib/projects";

/**
 * Field notes as a typographic register: big display names, a hanging mono
 * index, and a hover that indents the whole line — the cursor "tunes in".
 * All motion is CSS-only; reduced motion falls back via .accent-t rules
 * and transition-none utilities.
 */
export default function FieldNotes() {
  return (
    <div className="mt-10">
      {fieldNotes.map((f, i) => (
        <a
          key={f.url}
          href={f.url}
          target="_blank"
          rel="noopener"
          className="group relative block border-b py-6 pl-11 no-underline transition-[padding] duration-300 hover:pl-16 motion-reduce:transition-none md:py-7 md:hover:pl-20"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="hud absolute left-0 top-7 text-muted/50 group-hover:text-accent md:top-8">
            F.{String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="font-display text-4xl font-medium leading-none tracking-tight text-muted transition-colors duration-300 group-hover:text-ink motion-reduce:transition-none md:text-6xl lg:text-7xl">
              {f.name}
            </span>
            <span className="max-w-[36ch] text-sm leading-snug text-muted/60 transition-colors duration-300 group-hover:text-muted motion-reduce:transition-none">
              {f.note}
            </span>
            <span
              aria-hidden="true"
              className="ml-auto hidden -translate-x-1.5 text-3xl text-muted/40 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100 motion-reduce:transition-none md:block"
            >
              ↗
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
