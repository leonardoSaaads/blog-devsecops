"use client";

import { BookOpen, CornerDownLeft, FileText, Hash, Search } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { searchEntries, type SearchEntry, type SearchKind } from "@/lib/search/query";

const KIND_META: Record<SearchKind, { label: string; icon: typeof BookOpen }> = {
  post: { label: "Article", icon: BookOpen },
  page: { label: "Page", icon: FileText },
  tag: { label: "Tag", icon: Hash },
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function CommandPalette({ entries }: { entries: SearchEntry[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchEntries(entries, query, 8), [entries, query]);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut || (event.key === "/" && !isTypingTarget(event.target))) {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    close();
    router.push(entry.href as Route);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm text-muted-foreground transition hover:border-accent hover:text-foreground sm:w-56"
        // The accessible name starts with the visible text (WCAG 2.5.3); the shortcut goes in aria-keyshortcuts.
        aria-keyshortcuts="Control+K"
        data-testid="search-trigger"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="sr-only">Search the site</span>
        <span aria-hidden="true" className="hidden flex-1 text-left sm:inline">
          Search…
        </span>
        <kbd
          aria-hidden="true"
          className="hidden rounded border border-border px-1.5 font-mono text-[11px] sm:inline"
        >
          Ctrl K
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site search"
        onClick={(event) => event.target === dialogRef.current && close()}
        className="m-auto mt-[12vh] w-[min(42rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            placeholder="Search articles, topics and concepts…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            data-testid="search-input"
          />
          <kbd className="rounded border border-border px-1.5 font-mono text-[11px] text-muted-foreground">
            Esc
          </kbd>
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-label="Results"
          className="max-h-[60vh] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </li>
          )}
          {results.map((entry, index) => {
            const { icon: Icon, label } = KIND_META[entry.kind];
            return (
              <li
                key={`${entry.kind}-${entry.href}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(entry)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5",
                  index === active && "bg-accent-soft",
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{entry.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {label} · {entry.description}
                  </span>
                </span>
                {index === active && (
                  <CornerDownLeft
                    className="mt-1 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </dialog>
    </>
  );
}
