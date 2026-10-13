"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/format";
import { normalize } from "@/lib/search";
import { PostCard, type PostCardData } from "./post-card";

export function filterPosts(posts: readonly PostCardData[], query: string, tag: string | null) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return posts.filter((post) => {
    if (tag && !post.tags.includes(tag)) return false;
    if (terms.length === 0) return true;
    const haystack = normalize(
      [post.title, post.description, ...post.tags, ...post.labs].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}

/** Listagem com busca e filtro por tag sincronizados na URL (?q=&tag=). */
export function PostExplorer({ posts, tags }: { posts: PostCardData[]; tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  // Estado local mantém a digitação fluida; a URL é atualizada em transição.
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const activeTag = params.get("tag");
  const filtered = useMemo(() => filterPosts(posts, query, activeTag), [posts, query, activeTag]);

  const update = (next: { q?: string; tag?: string | null }) => {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <label className="relative block">
          <span className="sr-only">Filtrar artigos</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Filtrar por título, tema ou laboratório…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-[var(--ring)]"
            data-testid="post-filter"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tag">
          <button
            type="button"
            onClick={() => update({ tag: null })}
            aria-pressed={!activeTag}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              !activeTag
                ? "border-accent bg-accent-soft"
                : "border-border text-muted-foreground hover:border-accent",
            )}
          >
            Todas
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => update({ tag: activeTag === tag ? null : tag })}
              aria-pressed={activeTag === tag}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs transition",
                activeTag === tag
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border text-muted-foreground hover:border-accent",
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="post-count">
        {filtered.length} {filtered.length === 1 ? "artigo encontrado" : "artigos encontrados"}
        {(query || activeTag) && (
          <button
            type="button"
            onClick={() => update({ q: "", tag: null })}
            className="ml-3 inline-flex items-center gap-1 text-accent-strong underline-offset-4 hover:underline"
          >
            <X className="size-3.5" aria-hidden="true" /> limpar filtros
          </button>
        )}
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
