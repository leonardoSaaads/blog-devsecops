import type { ComponentProps } from "react";
import { CopyButton } from "./copy-button";

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "bash",
  shellsession: "terminal",
  yaml: "YAML",
  json: "JSON",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  tsx: "TSX",
  c: "C",
  rust: "Rust",
  go: "Go",
  docker: "Dockerfile",
  ini: "INI",
  toml: "TOML",
  sql: "SQL",
  markdown: "Markdown",
  asm: "Assembly",
  diff: "diff",
  nginx: "nginx",
  html: "HTML",
  css: "CSS",
  text: "texto",
};

type PreProps = ComponentProps<"pre"> & { "data-language"?: string; "data-title"?: string };

/** Moldura dos blocos de código (Shiki): título/arquivo, linguagem e botão de cópia. */
export function CodeBlock({
  "data-language": language,
  "data-title": title,
  children,
  ...props
}: PreProps) {
  const label = language ? (LANGUAGE_LABELS[language] ?? language) : undefined;

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-code">
      <figcaption className="flex items-center gap-3 border-b border-border px-3 py-1.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
        </span>
        <span className="truncate font-mono text-xs text-muted-foreground">{title ?? label}</span>
        <span className="ml-auto flex items-center gap-2">
          {title && label && (
            <span className="hidden font-mono text-[11px] uppercase text-muted-foreground sm:inline">
              {label}
            </span>
          )}
          <CopyButton />
        </span>
      </figcaption>
      <pre {...props} tabIndex={0}>
        {children}
      </pre>
    </figure>
  );
}
