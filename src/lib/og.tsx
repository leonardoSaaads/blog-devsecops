import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/** Imagem Open Graph padronizada (gerada em build time). */
export function renderOgImage({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer?: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "linear-gradient(135deg, #0b1220 0%, #10213a 55%, #0e3a4a 100%)",
        color: "#e2e8f0",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #22d3ee, #2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          LS
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#67e8f9",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      </div>
      <div
        style={{
          fontSize: title.length > 60 ? "56px" : "68px",
          fontWeight: 700,
          lineHeight: 1.1,
          maxWidth: "1000px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "26px",
          color: "#94a3b8",
        }}
      >
        <span>{site.author.name}</span>
        <span>{footer ?? new URL(site.url).host}</span>
      </div>
    </div>,
    OG_SIZE,
  );
}
