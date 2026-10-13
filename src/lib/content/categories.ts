import type { Motif } from "@/lib/art/types";

export const CATEGORIES = {
  telecomunicacoes: {
    label: "Telecomunicações",
    description: "Transmissão óptica, DWDM/OTN, modulação coerente e qualidade de sinal.",
    motif: "spectrum",
  },
  infraestrutura: {
    label: "Infraestrutura",
    description: "Linux, containers, Kubernetes e observabilidade de ponta a ponta.",
    motif: "lattice",
  },
  seguranca: {
    label: "Segurança",
    description: "Exposição mínima, Zero Trust e endurecimento de sistemas.",
    motif: "network",
  },
  software: {
    label: "Software",
    description: "Engenharia de software, desempenho, linguagens e arquitetura.",
    motif: "flamegraph",
  },
} as const satisfies Record<string, { label: string; description: string; motif: Motif }>;

export type CategoryId = keyof typeof CATEGORIES;
export const CATEGORY_IDS = Object.keys(CATEGORIES) as [CategoryId, ...CategoryId[]];
