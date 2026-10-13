import fs from "node:fs";
import path from "node:path";
import { Box, Rotate3d } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { statusLabels, type Product } from "@/lib/shop/schema";
import { StatusBadge } from "./status-badge";

function posterExists(poster?: string): poster is string {
  return Boolean(poster && fs.existsSync(path.join(process.cwd(), "public", poster)));
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
      data-testid="product-card"
    >
      <div className="relative aspect-[4/3] bg-grid">
        {posterExists(product.poster) ? (
          <Image
            src={product.poster}
            alt={`Pré-visualização do modelo ${product.name}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-4 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Box className="absolute inset-0 m-auto size-16 text-accent/60" aria-hidden="true" />
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-xs backdrop-blur">
          <Rotate3d className="size-3.5 text-accent" aria-hidden="true" /> 3D interativo
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          {product.category}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-mono text-lg font-semibold">
            {formatCurrency(product.price.amount)}
          </span>
          <StatusBadge status={product.status} label={statusLabels[product.status]} />
        </div>
      </div>
    </article>
  );
}
