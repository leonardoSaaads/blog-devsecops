import { ImageResponse } from "next/og";
import { generateArt } from "@/lib/art/motifs";
import { artworkToDataUri } from "@/lib/art/render";
import type { Motif } from "@/lib/art/types";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/** Imagem Open Graph padronizada (gerada em build time) com a arte do tema ao fundo. */
export function renderOgImage({
  eyebrow,
  title,
  footer,
  art,
}: {
  eyebrow: string;
  title: string;
  footer?: string;
  art: { motif: Motif; seed: string };
}) {
  const background = artworkToDataUri(generateArt(art.motif, art.seed));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        color: "#f1f5f9",
        fontFamily: "serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori só aceita <img> */}
      <img
        src={background}
        alt=""
        width={OG_SIZE.width}
        height={OG_SIZE.height}
        style={{ position: "absolute", inset: 0 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "linear-gradient(100deg, rgba(5,8,18,0.94) 0%, rgba(5,8,18,0.78) 52%, rgba(5,8,18,0.25) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#f1f5f9",
              color: "#0b1324",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            LS
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#93c5fd",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            {eyebrow}
          </div>
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? "58px" : "70px",
            fontWeight: 600,
            lineHeight: 1.08,
            maxWidth: "860px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "24px",
            color: "#cbd5e1",
            fontFamily: "sans-serif",
          }}
        >
          <span>{site.author.name}</span>
          <span>{footer ?? new URL(site.url).host}</span>
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
}
