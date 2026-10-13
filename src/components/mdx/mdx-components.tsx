import { ExternalLink } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import { ArtExplorer } from "@/components/figures/art-explorer";
import { CodePlayground } from "@/components/figures/code-playground";
import { ComplexityChart } from "@/components/figures/complexity-chart";
import { ConstellationViewer } from "@/components/figures/constellation-viewer";
import { DwdmGridCalculator } from "@/components/figures/dwdm-grid-calculator";
import { Fiber3D } from "@/components/figures/fiber-3d";
import { FiberBandsChart } from "@/components/figures/fiber-bands-chart";
import { FilesystemExplorer } from "@/components/figures/filesystem-explorer";
import { FlowDiagram } from "@/components/figures/flow-diagram";
import { K8sSimulator } from "@/components/figures/k8s-simulator";
import { MibExplorer } from "@/components/figures/mib-explorer";
import { OsnrCalculator } from "@/components/figures/osnr-calculator";
import { OtnHierarchy } from "@/components/figures/otn-hierarchy";
import { PermissionLab } from "@/components/figures/permission-lab";
import { PortExposure } from "@/components/figures/port-exposure";
import { QBerCalculator } from "@/components/figures/q-ber-calculator";
import { RateExplainer } from "@/components/figures/rate-explainer";
import { SignalSimulator } from "@/components/figures/signal-simulator";
import type { Reference } from "@/lib/content/schema";
import { Callout } from "./callout";
import { Card, CardGrid } from "./cards";
import { createCite } from "./cite";
import { CodeBlock } from "./code-block";
import { Definition, PullQuote } from "./definition";
import { Figure } from "./figure";
import { Quiz } from "./quiz";
import { Sidenote } from "./sidenote";
import { Tab, Tabs } from "./tabs";
import { Term } from "./term";
import { Video } from "./video";

function SmartLink({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href as Route} {...props}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <ExternalLink
        className="ml-0.5 inline size-3 align-baseline opacity-60"
        aria-label="(abre em nova aba)"
        role="img"
      />
    </a>
  );
}

function MdxImage({ src = "", alt = "", title }: ComponentProps<"img">) {
  return <Figure src={String(src)} alt={alt} caption={title} />;
}

const baseComponents = {
  a: SmartLink,
  pre: CodeBlock,
  img: MdxImage,
  // Estrutura acadêmica
  Callout,
  Card,
  CardGrid,
  Definition,
  Figure,
  PullQuote,
  Quiz,
  Sidenote,
  Tab,
  Tabs,
  Term,
  Video,
  // Figuras interativas
  ArtExplorer,
  CodePlayground,
  ComplexityChart,
  ConstellationViewer,
  DwdmGridCalculator,
  Fiber3D,
  FiberBandsChart,
  FilesystemExplorer,
  FlowDiagram,
  K8sSimulator,
  MibExplorer,
  OsnrCalculator,
  OtnHierarchy,
  PermissionLab,
  PortExposure,
  QBerCalculator,
  RateExplainer,
  SignalSimulator,
} satisfies MDXComponents;

export const MDX_COMPONENT_NAMES = Object.keys(baseComponents);

/** Componentes disponíveis nos artigos; `Cite` é vinculado às referências do próprio artigo. */
export function getMdxComponents(references: Reference[]): MDXComponents {
  return { ...baseComponents, Cite: createCite(references) } as MDXComponents;
}
