"use client";

import { ListTree } from "lucide-react";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/content/plugins/rehype-collect-headings";
import { cn } from "@/lib/utils";

function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // O primeiro título visível (na ordem do documento) é o ativo.
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocList({ items, active }: { items: TocItem[]; active?: string }) {
  return (
    <ol className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? "pl-3" : undefined}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "block border-l-2 py-1 pl-3 transition",
              active === item.id
                ? "border-accent font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

const NO_IDS: string[] = [];

export function TableOfContents({
  items,
  variant = "inline",
}: {
  items: TocItem[];
  variant?: "inline" | "aside";
}) {
  const [ids] = useState(() => items.map((item) => item.id));
  const active = useActiveHeading(variant === "aside" ? ids : NO_IDS);
  if (items.length < 2) return null;

  if (variant === "inline") {
    // Telas menores: sumário recolhível no topo do artigo.
    return (
      <details className="mb-8 rounded-xl border border-border bg-card p-4 xl:hidden">
        <summary className="flex cursor-pointer items-center gap-2 font-medium">
          <ListTree className="size-4 text-accent" aria-hidden="true" /> Neste artigo
        </summary>
        <nav aria-label="Sumário do artigo" className="mt-3">
          <TocList items={items} />
        </nav>
      </details>
    );
  }

  // Telas largas: sumário fixo lateral com indicação da seção atual.
  return (
    <nav
      aria-label="Sumário do artigo"
      className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto"
      data-testid="toc"
    >
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ListTree className="size-4" aria-hidden="true" /> Neste artigo
      </p>
      <TocList items={items} active={active} />
    </nav>
  );
}
