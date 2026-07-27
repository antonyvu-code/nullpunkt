import { ImageResponse } from "next/og";
import { projects } from "@/lib/projects";

// Per-case Open Graph card — each experiment link previews with its own title,
// EXP number and borrowed accent, so a case URL pasted in Slack reads as itself.
export const alt = "Nullpunkt case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pre-render one card per known slug at build time (matches the page's params).
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const BG = "#050505";
const INK = "#F2F0EB";
const MUTED = "#8A8781";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  const accent = p?.accent ?? INK;

  function Tick({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
    const v: Record<string, React.CSSProperties> = {
      tl: { top: 40, left: 40, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
      tr: { top: 40, right: 40, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
      bl: { bottom: 40, left: 40, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
      br: { bottom: 40, right: 40, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
    };
    return <div style={{ position: "absolute", width: 26, height: 26, ...v[pos] }} />;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: INK,
          padding: "72px 84px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <Tick pos="tl" />
        <Tick pos="tr" />
        <Tick pos="bl" />
        <Tick pos="br" />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2, color: MUTED }}>
          <span style={{ color: accent }}>
            NULLPUNKT — EXP.{p?.index ?? "00"} · {(p?.label ?? "LAB").toUpperCase()}
          </span>
          <span>THE LAB OF ANTONY VU</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3, maxWidth: 1000 }}>
            {p?.title ?? "Nullpunkt"}
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: INK, maxWidth: 940, lineHeight: 1.35 }}>
            {p?.oneLiner ?? ""}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 22, letterSpacing: 2, color: MUTED }}>
          <span style={{ display: "flex", width: 16, height: 16, background: accent }} />
          <span style={{ color: INK }}>{(p?.stack ?? []).slice(0, 3).join(" · ").toUpperCase()}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
