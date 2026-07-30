import type { ReactNode } from "react";

/**
 * The shell both legal pages share.
 *
 * Deliberately the quietest layout on the site: one measure, no rail, no
 * instrument furniture. These pages exist to be read and to be found by
 * someone checking a formality — the page has nothing to prove here, and
 * dressing an Impressum up in HUD chrome would only make it harder to scan.
 * The type roles and tokens stay the site's own, so it is still the same
 * document, just at rest.
 */
export default function Rechtstext({
  titel,
  kicker,
  children,
}: {
  titel: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="py-16 md:py-24">
      <p className="hud hud-wide text-accent accent-t">{kicker}</p>
      <h1 className="font-display mt-6 text-[clamp(2.2rem,6vw,4rem)] font-medium leading-[0.98] tracking-[-0.03em]">
        {titel}
      </h1>
      <div className="mt-12 max-w-[62ch] border-t pt-10" style={{ borderColor: "var(--line)" }}>
        {children}
      </div>
    </section>
  );
}

/** One titled block — the mono heading keeps metadata in its own register. */
export function Block({ h, children }: { h: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="hud text-muted-dim">{h}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Absatz({ children }: { children: ReactNode }) {
  return <p className="mb-3 leading-relaxed text-muted">{children}</p>;
}

/** A list where each item is one obligation or one right — reads faster than prose. */
export function Liste({ punkte }: { punkte: ReactNode[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {punkte.map((p, i) => (
        <li
          key={i}
          className="border-t py-2.5 leading-relaxed text-muted first:border-t-0 first:pt-0"
          style={{ borderColor: "var(--line)" }}
        >
          {p}
        </li>
      ))}
    </ul>
  );
}
