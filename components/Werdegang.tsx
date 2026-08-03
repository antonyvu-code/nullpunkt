import { site } from "@/lib/site";
import { L } from "@/components/Lang";

/**
 * The stations, on a time axis rather than in a table — the section has to
 * carry a different shape to CAPABILITIES above it, which is already a
 * horizontal hairline ledger. Here the rule runs vertically and every station
 * is a tick on it; the current one is the only one wearing the accent.
 */
export default function Werdegang() {
  const stations = site.werdegang;

  return (
    <ol className="m-0 list-none p-0">
      {stations.map((s, i) => {
        const current = i === 0;
        const last = i === stations.length - 1;
        return (
          <li
            key={s.when}
            className="grid grid-cols-[5.5rem_1rem_1fr] gap-x-3 md:grid-cols-[9.5rem_1.5rem_1fr] md:gap-x-6"
          >
            {/* Right-aligned so the dates sit against the axis rather than
                floating a column away from their own tick. */}
            <span
              className={`hud pt-1.5 md:text-right ${current ? "accent-t text-accent" : "text-muted-dim"}`}
            >
              {s.when}
            </span>
            <span aria-hidden="true" className="relative flex justify-center">
              {/* The axis segment for this station. origin-top so FX.06 can draw
                  it downward as the date passes; untouched when that is off. */}
              <span
                data-fx-line="axis"
                className="absolute top-0 w-px origin-top"
                style={{ background: "var(--line)", bottom: last ? "calc(100% - 1.6rem)" : 0 }}
              />
              <span
                className={`relative mt-2 h-1.5 w-1.5 ${current ? "accent-t bg-accent" : "bg-muted-dim"}`}
              />
            </span>
            <div className={last ? "pb-0" : "pb-8"}>
              <p className="font-display text-lg font-medium leading-snug text-ink md:text-2xl">
                <L text={s.what} />
              </p>
              <p className="hud mt-1.5 text-muted-dim">
                <L text={s.note} />
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
