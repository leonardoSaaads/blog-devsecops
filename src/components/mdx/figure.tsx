import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import Image from "next/image";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Lê as dimensões de uma imagem local em build time (evita layout shift). */
export function localImageSize(src: string): { width: number; height: number } | undefined {
  if (!src.startsWith("/")) return undefined;
  const file = path.normalize(path.join(PUBLIC_DIR, src));
  if (!file.startsWith(PUBLIC_DIR + path.sep) || !fs.existsSync(file)) return undefined;
  const { width, height } = imageSize(fs.readFileSync(file));
  return width && height ? { width, height } : undefined;
}

export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  /** Crédito/fonte da imagem (obrigatório para imagens de terceiros). */
  source?: string;
  sourceUrl?: string;
  priority?: boolean;
  /** Largura máxima de exibição em px (ex.: diagramas pequenos). */
  maxWidth?: number;
}

export function Figure({ src, alt, caption, source, sourceUrl, priority, maxWidth }: FigureProps) {
  const size = localImageSize(src);

  return (
    <figure className="not-prose my-8">
      <div
        className="mx-auto overflow-hidden rounded-xl border border-border bg-card"
        style={maxWidth ? { maxWidth } : undefined}
      >
        {size ? (
          <Image
            src={src}
            alt={alt}
            width={size.width}
            height={size.height}
            sizes="(min-width: 1024px) 768px, 100vw"
            priority={priority}
            className="h-auto w-full"
          />
        ) : (
          // Imagens externas: sem otimização do Next (domínios de terceiros variados).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-auto w-full"
          />
        )}
      </div>
      {(caption || source) && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
          {source && (
            <>
              {caption ? " " : ""}
              <span className="whitespace-nowrap">
                Fonte:{" "}
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {source}
                  </a>
                ) : (
                  source
                )}
                .
              </span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
