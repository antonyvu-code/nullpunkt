import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Site-wide Open Graph card — inherited by every route that doesn't define its
// own, so a bare link (home, or any page) previews as a measured Lab Noir plate
// instead of a blank card in Slack.
export const alt =
  "Nullpunkt — the lab of Antony Vu, creative developer in Berlin who designs and builds websites end to end.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#050505";
const INK = "#F2F0EB";
const MUTED = "#8A8781";
const LINE = "rgba(242,240,235,0.16)";

// Corner registration tick — the site's signature framing mark.
function Tick({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const v: Record<string, React.CSSProperties> = {
    tl: { top: 40, left: 40, borderTop: `2px solid ${INK}`, borderLeft: `2px solid ${INK}` },
    tr: { top: 40, right: 40, borderTop: `2px solid ${INK}`, borderRight: `2px solid ${INK}` },
    bl: { bottom: 40, left: 40, borderBottom: `2px solid ${INK}`, borderLeft: `2px solid ${INK}` },
    br: { bottom: 40, right: 40, borderBottom: `2px solid ${INK}`, borderRight: `2px solid ${INK}` },
  };
  return <div style={{ position: "absolute", width: 26, height: 26, ...v[pos] }} />;
}

export default function Image() {
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
          <span>NULLPUNKT — THE LAB OF {site.wordmark}</span>
          <span>52.5200°N · 13.4050°E</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 100, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3 }}>
            Creative Developer
          </div>
          <div style={{ fontSize: 100, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3, color: MUTED }}>
            Design + Build.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: INK, maxWidth: 900, lineHeight: 1.35 }}>
            A communication designer who builds what he designs — many distinct sites, each its own world.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 22, letterSpacing: 2, color: MUTED }}>
          <span style={{ color: INK }}>BERLIN, DE</span>
          <span>·</span>
          <span>DE · EN · VI</span>
          <span>·</span>
          <span style={{ color: INK }}>OPEN — REMOTE OR BERLIN</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
