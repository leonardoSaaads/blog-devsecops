import { OG_SIZE, renderOgImage } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.author.name} — ${site.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: site.tagline,
    title: "Ensaios técnicos para ler, experimentar e citar.",
    art: { motif: "eye", seed: "inicio" },
  });
}
