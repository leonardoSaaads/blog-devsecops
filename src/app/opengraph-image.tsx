import { OG_SIZE, renderOgImage } from "@/lib/seo/og";
import { site } from "@/config/site";

export const alt = `${site.author.name} — ${site.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: site.tagline,
    title: "Technical essays to read, explore and cite.",
    art: { motif: "eye", seed: "inicio" },
  });
}
