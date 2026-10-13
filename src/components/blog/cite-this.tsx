"use client";

import { Check, Copy, Quote } from "lucide-react";
import { useState } from "react";
import { useClientValue } from "@/hooks/use-client-value";
import { formatAbntDate, formatAuthorName } from "@/lib/content/references";

function todayIso(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "Como citar este artigo" (ABNT), com data de acesso do próprio leitor. */
export function CiteThis({
  author,
  title,
  year,
  url,
}: {
  author: string;
  title: string;
  year: number;
  url: string;
}) {
  // Data de acesso do próprio leitor (calculada só no cliente).
  const accessed = useClientValue<string | undefined>(() => formatAbntDate(todayIso()), undefined);
  const [copied, setCopied] = useState(false);

  const citation = `${formatAuthorName(author)}. ${title}. [S. l.], ${year}. Disponível em: ${url}.${
    accessed ? ` Acesso em: ${accessed}.` : ""
  }`;

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
      aria-labelledby="como-citar"
      className="mt-8 rounded-2xl border border-border bg-muted/50 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="como-citar" className="flex items-center gap-2 text-base font-semibold">
          <Quote className="size-4 text-accent" aria-hidden="true" /> Como citar este artigo
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
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className="mt-3 break-words font-mono text-xs leading-relaxed text-muted-foreground">
        {citation}
      </p>
    </section>
  );
}
