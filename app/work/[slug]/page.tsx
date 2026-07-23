import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, type Plate } from "@/lib/projects";
import AccentSetter from "@/components/AccentSetter";

function PlateFigure({ plate, priority = false }: { plate: Plate; priority?: boolean }) {
  return (
    <figure className="m-0" data-reveal>
      <div className="border p-1.5" style={{ borderColor: "var(--line)" }}>
        <Image
          src={plate.src}
          alt={plate.caption}
          width={2400}
          height={1500}
          priority={priority}
          sizes="(min-width: 1024px) 960px, 100vw"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="hud mt-3 text-muted/70">{plate.caption}</figcaption>
    </figure>
  );
}

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `EXP.${p.index} ${p.title}`, description: p.oneLiner };
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  const next = projects[(projects.indexOf(p) + 1) % projects.length];

  return (
    <article>
      <AccentSetter accent={p.accent} />

      <header className="py-14 md:py-20" data-reveal>
        <p className="hud hud-wide text-accent">
          NULLPUNKT — EXP.{p.index} · {p.label} · {p.status.toUpperCase()}
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-medium leading-[1.08] md:text-6xl">
          {p.title}
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">{p.oneLiner}</p>
        {p.given && (
          <p
            className="mt-6 max-w-xl border-l-2 pl-4 text-sm leading-relaxed text-muted/80"
            style={{ borderColor: "var(--accent)" }}
          >
            <span className="hud text-muted/70">SUPPLIED — </span>
            {p.given}
          </p>
        )}
        {p.liveUrl && (
          <a
            href={p.liveUrl}
            target="_blank"
            rel="noopener"
            className="hud accent-t mt-8 inline-block border px-6 py-3.5 text-ink no-underline transition-colors hover:border-accent hover:text-accent"
            style={{ borderColor: "var(--line)" }}
          >
            VIEW LIVE — {p.liveUrl.replace("https://", "")} ↗
          </a>
        )}
      </header>

      {p.plates[0] && (
        <div className="pb-12 md:pb-16">
          <PlateFigure plate={p.plates[0]} priority />
        </div>
      )}

      <dl
        className="m-0 grid grid-cols-2 gap-px border-y md:grid-cols-4"
        style={{ borderColor: "var(--line)", background: "var(--line)" }}
        data-reveal
      >
        {[
          ["YEAR", p.year],
          ["KIND", p.kind],
          ["ROLE", p.role],
          ["STACK", p.stack.join(" · ")],
        ].map(([k, v]) => (
          <div key={k} className="bg-bg px-4 py-5">
            <dt className="hud text-muted/70">{k}</dt>
            <dd className="hud m-0 mt-2 text-ink">{v.toUpperCase()}</dd>
          </div>
        ))}
      </dl>

      <section aria-label="Readings" className="py-12 md:py-16" data-reveal>
        {/* The claim is only made when the numbers can back it up. */}
        <p className="hud hud-wide mb-8 text-accent">
          {p.metrics.some((m) => m.source) ? "READINGS — MEASURED, NOT CLAIMED" : "READINGS"}
        </p>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {p.metrics.map((m) => (
            <div key={m.label}>
              <p className="font-mono text-3xl text-accent md:text-4xl">{m.value}</p>
              <p className="hud mt-2 text-muted/70">{m.label.toUpperCase()}</p>
              {m.source && (
                <p className="mt-2 text-xs leading-snug text-muted/60">{m.source}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {p.plates[1] && (
        <div className="pb-12 md:pb-16">
          <PlateFigure plate={p.plates[1]} />
        </div>
      )}

      {p.sections.map((s, i) => (
        <section
          key={s.heading}
          className="border-t py-12 md:py-16"
          style={{ borderColor: "var(--line)" }}
          data-reveal
        >
          <div className="grid gap-6 md:grid-cols-[220px_1fr] md:gap-12">
            <h2 className="hud hud-wide text-muted">
              {String.fromCharCode(97 + i)}. {s.heading.toUpperCase()}
            </h2>
            <div className="max-w-2xl">
              {s.body.map((para) => (
                <p key={para.slice(0, 32)} className="mb-4 leading-relaxed text-ink/90">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}

      <nav
        aria-label="Experiment navigation"
        className="flex flex-wrap items-center justify-between gap-4 border-t py-10"
        style={{ borderColor: "var(--line)" }}
        data-reveal
      >
        <Link href="/" className="hud accent-t text-muted no-underline hover:text-accent">
          ← BACK TO INDEX
        </Link>
        <Link
          href={`/work/${next.slug}`}
          className="hud accent-t text-ink no-underline hover:text-accent"
        >
          NEXT — EXP.{next.index} {next.title.toUpperCase()} →
        </Link>
      </nav>
    </article>
  );
}
