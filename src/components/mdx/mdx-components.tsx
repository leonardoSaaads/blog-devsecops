import { ExternalLink } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import { CodePlayground } from "@/components/labs/code-playground";
import { ConstellationViewer } from "@/components/labs/constellation-viewer";
import { DwdmGridCalculator } from "@/components/labs/dwdm-grid-calculator";
import { FiberBandsChart } from "@/components/labs/fiber-bands-chart";
import { FlowDiagram } from "@/components/labs/flow-diagram";
import { K8sSimulator } from "@/components/labs/k8s-simulator";
import { OsnrCalculator } from "@/components/labs/osnr-calculator";
import { OtnHierarchy } from "@/components/labs/otn-hierarchy";
import { PermissionLab } from "@/components/labs/permission-lab";
import { QBerCalculator } from "@/components/labs/q-ber-calculator";
import type { Reference } from "@/lib/content/schema";
import { Callout } from "./callout";
import { createCite } from "./cite";
import { CodeBlock } from "./code-block";
import { Figure } from "./figure";
import { Quiz } from "./quiz";
import { Tab, Tabs } from "./tabs";
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
  Callout,
  Figure,
  Video,
  Tabs,
  Tab,
  Quiz,
  CodePlayground,
  PermissionLab,
  K8sSimulator,
  DwdmGridCalculator,
  OsnrCalculator,
  QBerCalculator,
  ConstellationViewer,
  FiberBandsChart,
  FlowDiagram,
  OtnHierarchy,
} satisfies MDXComponents;

/** Componentes disponíveis nos artigos; `Cite` é vinculado às referências do próprio artigo. */
export function getMdxComponents(references: Reference[]): MDXComponents {
  return { ...baseComponents, Cite: createCite(references) } as MDXComponents;
}
