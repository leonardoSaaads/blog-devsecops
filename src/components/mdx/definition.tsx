import type { ReactNode } from "react";

/** Definição formal numerada ("Definição n."), como em textos acadêmicos. */
export function Definition({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div
      className="definition not-prose my-8 rounded-r-xl border-l-4 border-accent bg-card px-5 py-4 shadow-sm"
      role="note"
      aria-label={`Definição: ${term}`}
    >
      <p className="font-serif text-[1.05rem] leading-relaxed">
        <span className="definition-label" />
        <dfn className="font-semibold not-italic">{term}</dfn>
        <span aria-hidden="true"> — </span>
      </p>
      <div className="mt-1 font-serif text-[1.05rem] leading-relaxed text-foreground/90 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_p+p]:mt-2">
        {children}
      </div>
    </div>
  );
}

/** Citação de destaque, para a ideia central de uma seção. */
export function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="not-prose my-12 border-y border-border py-8 text-center">
      <blockquote className="mx-auto max-w-xl font-serif text-2xl leading-snug font-medium text-balance italic sm:text-[1.7rem]">
        <span className="text-signal" aria-hidden="true">
          “
        </span>
        {children}
        <span className="text-signal" aria-hidden="true">
          ”
        </span>
      </blockquote>
      {cite && (
        <figcaption className="smallcaps mt-4 text-sm text-muted-foreground">— {cite}</figcaption>
      )}
    </figure>
  );
}
