import type { ReactNode } from "react";

/**
 * Numbered margin note (Tufte style). On wide screens it floats in the right margin;
 * on smaller screens it appears inline, right after the sentence. Uses phrasing
 * elements only (span) so it stays valid inside paragraphs.
 */
export function Sidenote({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="sidenote-ref" aria-hidden="true" />
      <span className="sidenote" role="note">
        {children}
      </span>
    </>
  );
}
