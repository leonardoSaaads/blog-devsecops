import type { Motif } from "./types";

/** Sementes aceitas na URL pública da arte (slugs e identificadores internos). */
export const ART_SEED_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/** URL do SVG estático da arte (gerado no build pela rota /art/[motif]/[file]). */
export function artUrl(motif: Motif, seed: string): string {
  return `/art/${motif}/${seed}.svg`;
}
