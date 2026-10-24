import type { Motif } from "./types";

/** Seeds accepted in the public art URL (slugs and internal identifiers). */
export const ART_SEED_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/** Cache policy for art SVGs (route in `next dev`, `_headers` in production). */
export const ART_CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

/** URL of the static art SVG (generated at build time by the /art/[motif]/[file] route). */
export function artUrl(motif: Motif, seed: string): string {
  return `/art/${motif}/${seed}.svg`;
}
