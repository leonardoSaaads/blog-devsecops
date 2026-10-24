import type { ArtworkRef } from "@/lib/art/catalog";
import { artUrl } from "@/lib/art/url";
import { cn } from "@/lib/utils";

/**
 * Site cover/illustration as a static SVG image: it stays out of the HTML and the React
 * payload (nothing to hydrate), loads on demand and is reused from cache.
 */
export function CoverArt({
  motif,
  seed,
  alt = "",
  priority = false,
  className,
}: ArtworkRef & { alt?: string; priority?: boolean; className?: string }) {
  return (
    // next/image does not optimize SVG (nor does it need to): the file is vector and small.
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
