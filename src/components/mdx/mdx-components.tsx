import { ExternalLink } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import {
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
} from "@/components/figures/lazy";
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
