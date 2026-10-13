"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CATEGORIES, type CategoryId } from "@/lib/content/categories";
import { cn } from "@/lib/format";
import { normalize } from "@/lib/search";
import { PostCard, type PostCardData } from "./post-card";

export function filterPosts(
  posts: readonly PostCardData[],
  query: string,
  tag: string | null,
  area: string | null = null,
) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return posts.filter((post) => {
    if (tag && !post.tags.includes(tag)) return false;
    if (area && post.category !== area) return false;
    if (terms.length === 0) return true;
    const haystack = normalize(
      [post.title, post.description, ...post.tags, CATEGORIES[post.category].label].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-3.5 py-1.5 text-sm transition",
    active
      ? "border-accent bg-accent-soft text-foreground"
      : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground",
  );

/** Listagem com busca, área e tag sincronizadas na URL (?q=&area=&tag=). */
export function PostExplorer({ posts, tags }: { posts: PostCardData[]; tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  // Estado local mantém a digitação fluida; a URL é atualizada em transição.
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const activeTag = params.get("tag");
  const activeArea = params.get("area");
  const filtered = useMemo(
    () => filterPosts(posts, query, activeTag, activeArea),
    [posts, query, activeTag, activeArea],
  );

  const update = (next: { q?: string; tag?: string | null; area?: string | null }) => {
    if (next.q !== undefined) setQuery(next.q);
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    const qs = search.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}` as Parameters<typeof router.replace>[0], {
        scroll: false,
      });
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5">
        <label className="relative block">
          <span className="sr-only">Filtrar artigos</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Buscar por título, conceito ou tecnologia…"
            className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 font-serif text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
            data-testid="post-filter"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por área">
          <button
            type="button"
            onClick={() => update({ area: null })}
            aria-pressed={!activeArea}
            className={chip(!activeArea)}
          >
            Todas as áreas
          </button>
          {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => update({ area: activeArea === id ? null : id })}
              aria-pressed={activeArea === id}
              className={chip(activeArea === id)}
            >
              {CATEGORIES[id].label}
            </button>
          ))}
        </div>

        <details className="group/tags">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Filtrar por tag{" "}
            {activeTag && <span className="font-mono text-accent">#{activeTag}</span>}
          </summary>
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tag">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => update({ tag: activeTag === tag ? null : tag })}
                aria-pressed={activeTag === tag}
                className={cn(chip(activeTag === tag), "px-2.5 py-1 font-mono text-xs")}
              >
                #{tag}
              </button>
            ))}
          </div>
        </details>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="post-count">
        {filtered.length} {filtered.length === 1 ? "artigo encontrado" : "artigos encontrados"}
        {(query || activeTag || activeArea) && (
          <button
            type="button"
            onClick={() => update({ q: "", tag: null, area: null })}
            className="ml-3 inline-flex items-center gap-1 text-accent-strong underline-offset-4 hover:underline"
          >
            <X className="size-3.5" aria-hidden="true" /> limpar filtros
          </button>
        )}
      </p>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
