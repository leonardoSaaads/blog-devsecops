import type { ReactNode } from "react";

/**
 * Nota de margem numerada (estilo Tufte). Em telas largas flutua na margem direita;
 * em telas menores aparece em linha, logo após a frase. Usa apenas elementos de frase
 * (span) para ser válida dentro de parágrafos.
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
