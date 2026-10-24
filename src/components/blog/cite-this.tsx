"use client";

import { Check, Copy, Quote } from "lucide-react";
import { useState } from "react";
import { useClientValue } from "@/hooks/use-client-value";
import { formatAuthorName, formatIeeeDate } from "@/lib/content/references";

function todayIso(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "How to cite this article" (IEEE), with the reader's own access date. */
export function CiteThis({
  author,
  title,
  site,
  published,
  url,
}: {
  author: string;
  title: string;
  site: string;
  /** ISO publication date (YYYY-MM-DD). */
  published: string;
  url: string;
}) {
  // The reader's access date (computed on the client only).
  const accessed = useClientValue<string | undefined>(() => formatIeeeDate(todayIso()), undefined);
  const [copied, setCopied] = useState(false);

  const citation = `${formatAuthorName(author)}, “${title},” ${site}, ${formatIeeeDate(published)}.${
    accessed ? ` Accessed: ${accessed}.` : ""
  } [Online]. Available: ${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-labelledby="cite-this"
      className="mt-8 rounded-2xl border border-border bg-muted/50 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="cite-this" className="flex items-center gap-2 text-base font-semibold">
          <Quote className="size-4 text-accent" aria-hidden="true" /> How to cite this article
        </h2>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs transition hover:border-accent"
        >
          {copied ? (
            <Check className="size-3.5 text-success" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-3 break-words font-mono text-xs leading-relaxed text-muted-foreground">
        {citation}
      </p>
    </section>
  );
}
