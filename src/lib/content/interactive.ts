/**
 * MDX components that are interactive figures. Used to count figures per article
 * (shown on cards). The component test ensures every figure is registered.
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

/** Counts interactive figures in an MDX body (fenced code blocks are ignored). */
export function countInteractiveFigures(body: string): number {
  const withoutFences = body.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, "");
  return withoutFences.match(PATTERN)?.length ?? 0;
}
