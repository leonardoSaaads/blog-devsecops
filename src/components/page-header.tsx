import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-12 max-w-3xl">
      {eyebrow && <p className="smallcaps text-sm font-semibold text-accent-strong">{eyebrow}</p>}
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      <div
        className="mt-5 h-px w-24 bg-gradient-to-r from-signal to-transparent"
        aria-hidden="true"
      />
      {description && (
        <p className="mt-5 font-serif text-xl leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
