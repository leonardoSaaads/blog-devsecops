import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import Image from "next/image";
import { cn } from "@/lib/format";

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
  /** Imagem acima da dobra (LCP): pré-carregada no `<head>`. */
  priority?: boolean;
  /** Largura máxima de exibição em px (ex.: diagramas pequenos). */
  maxWidth?: number;
}

export function Figure({ src, alt, caption, source, sourceUrl, priority, maxWidth }: FigureProps) {
  const size = localImageSize(src);

  return (
    <figure className={cn("not-prose my-10", (caption || source) && "figure-numbered")}>
      <div
        className="mx-auto overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        style={maxWidth ? { maxWidth } : undefined}
      >
        {size ? (
          <Image
            src={src}
            alt={alt}
            width={size.width}
            height={size.height}
            sizes="(min-width: 1024px) 768px, 100vw"
            preload={priority}
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
        <figcaption className="mx-auto mt-3 max-w-2xl text-center font-serif text-[0.95rem] leading-relaxed text-muted-foreground">
          <span className="figure-label" />
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
