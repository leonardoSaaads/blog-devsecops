import { BookOpen } from "lucide-react";
import { formatReference } from "@/lib/content/references";
import type { Reference } from "@/lib/content/schema";

export function referenceAnchor(id: string): string {
  return `ref-${id}`;
}

export function ReferenceList({ references }: { references: Reference[] }) {
  return (
    <section
      aria-labelledby="referencias"
      className="mt-16 border-t border-border pt-10"
      data-testid="references"
    >
      <h2
        id="referencias"
        className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
      >
        <BookOpen className="size-5 text-accent" aria-hidden="true" />
        Referências
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Formatadas segundo a ABNT NBR 6023:2018.</p>
      <ol className="mt-6 space-y-3 text-sm leading-relaxed">
        {references.map((ref, index) => (
          <li
            key={ref.id}
            id={referenceAnchor(ref.id)}
            className="grid scroll-mt-24 grid-cols-[2.25rem_1fr] rounded-lg p-2 transition target:bg-accent-soft"
          >
            <span className="font-mono text-muted-foreground">[{index + 1}]</span>
            <span className="break-words">
              {formatReference(ref).map((part, partIndex) =>
                part.href ? (
                  <a
                    key={partIndex}
                    href={part.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-strong underline decoration-dotted underline-offset-4 hover:decoration-solid"
                  >
                    {part.text}
                  </a>
                ) : part.strong ? (
                  <strong key={partIndex}>{part.text}</strong>
                ) : (
                  <span key={partIndex}>{part.text}</span>
                ),
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
