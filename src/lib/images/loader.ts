"use client";

import { variantPath } from "./variants.mts";

/**
 * `next/image` loader (configured in `next.config.ts`): points each `srcset` width to
 * the WebP variant generated at build time. Anything else (external images, SVG)
 * keeps its original URL.
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  return variantPath(src, width) ?? src;
}
