import type { ArtworkRef } from "@/lib/art/catalog";
import { artUrl } from "@/lib/art/url";
import { cn } from "@/lib/utils";

/**
 * Capa/ilustração do site como imagem SVG estática: fica fora do HTML e do payload
 * do React (nada a hidratar), é baixada sob demanda e reaproveitada pelo cache.
 */
export function CoverArt({
  motif,
  seed,
  alt = "",
  priority = false,
  className,
}: ArtworkRef & { alt?: string; priority?: boolean; className?: string }) {
  return (
    // next/image não otimiza SVG (nem precisa): o arquivo já é vetorial e pequeno.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={artUrl(motif, seed)}
      alt={alt}
      width={1200}
      height={630}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("block h-full w-full object-cover", className)}
    />
  );
}
