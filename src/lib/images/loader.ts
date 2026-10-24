"use client";

import { variantPath } from "./variants.mts";

/**
 * Loader do `next/image` (configurado em `next.config.ts`): aponta cada largura do
 * `srcset` para a variante WebP gerada no build. Imagens fora do padrão (externas,
 * SVG) seguem com a URL original.
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  return variantPath(src, width) ?? src;
}
