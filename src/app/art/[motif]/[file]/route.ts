import { allArtworks } from "@/lib/art/catalog";
import { generateArt } from "@/lib/art/motifs";
import { artworkToSvg } from "@/lib/art/render";
import { MOTIFS, type Motif } from "@/lib/art/types";
import { ART_SEED_PATTERN } from "@/lib/art/url";

// SVG gerado no build e servido como arquivo estático (cacheável, fora do HTML).
export const dynamic = "force-static";

export function generateStaticParams() {
  return allArtworks().map(({ motif, seed }) => ({ motif, file: `${seed}.svg` }));
}

export async function GET(_request: Request, { params }: RouteContext<"/art/[motif]/[file]">) {
  const { motif, file } = await params;
  const seed = file.endsWith(".svg") ? file.slice(0, -4) : "";
  if (
    !(MOTIFS as readonly string[]).includes(motif) ||
    !ART_SEED_PATTERN.test(seed) ||
    seed.length > 64
  ) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(artworkToSvg(generateArt(motif as Motif, seed)), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
