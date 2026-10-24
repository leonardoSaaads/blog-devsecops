/**
 * Componentes MDX que são figuras interativas. Usado para contar figuras por artigo
 * (exibido nos cards). O teste de componentes garante que todos estejam registrados.
 */
export const INTERACTIVE_COMPONENTS = [
  "PermissionLab",
  "SignalSimulator",
  "FilesystemExplorer",
  "DwdmGridCalculator",
  "OsnrCalculator",
  "QBerCalculator",
  "ConstellationViewer",
  "FiberBandsChart",
  "Fiber3D",
  "FlowDiagram",
  "OtnHierarchy",
] as const;

const PATTERN = new RegExp(`^\\s*<(?:${INTERACTIVE_COMPONENTS.join("|")})\\b`, "gm");

/** Conta figuras interativas no corpo MDX (ignora blocos de código cercados). */
export function countInteractiveFigures(body: string): number {
  const withoutFences = body.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, "");
  return withoutFences.match(PATTERN)?.length ?? 0;
}
