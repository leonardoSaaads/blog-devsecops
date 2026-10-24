import dynamic from "next/dynamic";

/*
 * Figuras interativas com divisão de código: cada artigo baixa apenas o JavaScript das
 * figuras que usa. A renderização no servidor continua (o HTML chega completo); só a
 * hidratação espera o pedaço de código correspondente.
 */
export const ConstellationViewer = dynamic(() =>
  import("./constellation-viewer").then((m) => m.ConstellationViewer),
);
export const DwdmGridCalculator = dynamic(() =>
  import("./dwdm-grid-calculator").then((m) => m.DwdmGridCalculator),
);
export const Fiber3D = dynamic(() => import("./fiber-3d").then((m) => m.Fiber3D));
export const FiberBandsChart = dynamic(() =>
  import("./fiber-bands-chart").then((m) => m.FiberBandsChart),
);
export const FilesystemExplorer = dynamic(() =>
  import("./filesystem-explorer").then((m) => m.FilesystemExplorer),
);
export const FlowDiagram = dynamic(() => import("./flow-diagram").then((m) => m.FlowDiagram));
export const OsnrCalculator = dynamic(() =>
  import("./osnr-calculator").then((m) => m.OsnrCalculator),
);
export const OtnHierarchy = dynamic(() => import("./otn-hierarchy").then((m) => m.OtnHierarchy));
export const PermissionLab = dynamic(() => import("./permission-lab").then((m) => m.PermissionLab));
export const QBerCalculator = dynamic(() =>
  import("./q-ber-calculator").then((m) => m.QBerCalculator),
);
export const SignalSimulator = dynamic(() =>
  import("./signal-simulator").then((m) => m.SignalSimulator),
);
