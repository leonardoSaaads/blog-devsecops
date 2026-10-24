import type { AnchorHTMLAttributes, ReactNode } from "react";

/** Test stand-in for `next/link` (renders a plain <a>). */
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
