/**
 * Variantes de imagem geradas no build (`scripts/optimize-images.mts`).
 *
 * A exportação estática não tem o otimizador do Next (`/_next/image`); cada imagem
 * raster de `public/` ganha versões WebP nas larguras abaixo, e o loader do
 * `next/image` aponta o `srcset` para elas.
 *
 * Este arquivo é importado também pelo script de build (Node, sem bundler): use
 * apenas sintaxe TypeScript apagável e imports relativos.
 */

/** Larguras para imagens responsivas (com `sizes` em vw ou `fill`). */
export const DEVICE_SIZES = [640, 960, 1280, 1920];

/** Larguras para imagens pequenas e de tamanho fixo (avatares, ícones). */
export const IMAGE_SIZES = [48, 96, 192, 256, 384];

/** Todas as larguras pedidas pelo `next/image` — e geradas pelo script. */
export const VARIANT_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];

/** Pasta das variantes, relativa a `public/` (ignorada pelo Git). */
export const VARIANTS_DIR = "_img";

/** Somente arquivos locais PNG/JPEG; SVG e URLs externas não passam pelo loader. */
const LOCAL_RASTER = /^\/(?:[\w-]+\/)*[\w.-]+\.(?:png|jpe?g)$/i;

export function isOptimizable(src: string): boolean {
  return (
    LOCAL_RASTER.test(src) && !src.split("/").includes("..") && !src.startsWith(`/${VARIANTS_DIR}/`)
  );
}

/** Caminho público da variante WebP mais próxima (arredondada para cima). */
export function variantPath(src: string, width: number): string | undefined {
  if (!isOptimizable(src)) return undefined;
  const size =
    VARIANT_WIDTHS.find((candidate) => candidate >= width) ??
    VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
  return `/${VARIANTS_DIR}${src.replace(/\.[^.]+$/, "")}/${size}.webp`;
}
