import dynamic from "next/dynamic";

/*
 * Figuras interativas com divisão de código: cada artigo baixa apenas o JavaScript das
 * figuras que usa. A renderização no servidor continua (o HTML chega completo); só a
 * hidratação espera o pedaço de código correspondente.
 */
export const ArtExplorer = dynamic(() => import("./art-explorer").then((m) => m.ArtExplorer));
export const CodePlayground = dynamic(() =>
  import("./code-playground").then((m) => m.CodePlayground),
);
export const ComplexityChart = dynamic(() =>
  import("./complexity-chart").then((m) => m.ComplexityChart),
);
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
export const K8sSimulator = dynamic(() => import("./k8s-simulator").then((m) => m.K8sSimulator));
export const MibExplorer = dynamic(() => import("./mib-explorer").then((m) => m.MibExplorer));
export const OsnrCalculator = dynamic(() =>
  import("./osnr-calculator").then((m) => m.OsnrCalculator),
);
export const OtnHierarchy = dynamic(() => import("./otn-hierarchy").then((m) => m.OtnHierarchy));
export const PermissionLab = dynamic(() => import("./permission-lab").then((m) => m.PermissionLab));
export const PortExposure = dynamic(() => import("./port-exposure").then((m) => m.PortExposure));
export const QBerCalculator = dynamic(() =>
  import("./q-ber-calculator").then((m) => m.QBerCalculator),
);
export const RateExplainer = dynamic(() => import("./rate-explainer").then((m) => m.RateExplainer));
export const SignalSimulator = dynamic(() =>
  import("./signal-simulator").then((m) => m.SignalSimulator),
);
