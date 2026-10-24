import "server-only";
import { CATEGORIES, CATEGORY_IDS } from "@/lib/content/categories";
import { getAllPosts } from "@/lib/content/posts";
import { PROJECTS } from "@/lib/content/projects";
import type { Motif } from "./types";

export interface ArtworkRef {
  motif: Motif;
  seed: string;
}

/** Fixed layout artworks (outside articles, areas and projects).
 *  Seeds are stable identifiers: changing one changes the generated art. */
export const SITE_ARTWORKS = {
  home: { motif: "eye", seed: "inicio" },
  footer: { motif: "ridgeline", seed: "rodape" },
} as const satisfies Record<string, ArtworkRef>;

export const areaArtwork = (id: keyof typeof CATEGORIES): ArtworkRef => ({
  motif: CATEGORIES[id].motif,
  seed: `area-${id}`,
});

export const projectArtwork = (name: string, motif: Motif): ArtworkRef => ({
  motif,
  seed: `projeto-${name}`,
});

/** Every artwork used on the site — pre-generated as static SVG at build time. */
export function allArtworks(): ArtworkRef[] {
  return [
    ...Object.values(SITE_ARTWORKS),
    ...getAllPosts().map((post) => ({ motif: post.art, seed: post.slug })),
    ...CATEGORY_IDS.map(areaArtwork),
    ...PROJECTS.map((project) => projectArtwork(project.name, project.art)),
  ];
}
