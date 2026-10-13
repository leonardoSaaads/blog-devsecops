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
    <header className="mb-10 max-w-3xl">
      {eyebrow && (
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h1>
      {description && <p className="mt-4 text-lg text-muted-foreground">{description}</p>}
      {children}
    </header>
  );
}
