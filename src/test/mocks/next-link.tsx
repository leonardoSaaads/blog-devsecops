import type { AnchorHTMLAttributes, ReactNode } from "react";

/** Substituto de `next/link` para testes (renderiza um <a> simples). */
export default function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: unknown; children?: ReactNode }) {
  return (
    <a href={String(href)} {...props}>
      {children}
    </a>
  );
}
