import type { Motif } from "@/lib/art/types";

export const CATEGORIES = {
  telecommunications: {
    label: "Telecommunications",
    description: "Optical transmission, DWDM/OTN, coherent modulation and signal quality.",
    motif: "spectrum",
  },
  infrastructure: {
    label: "Infrastructure",
    description: "Linux, containers, Kubernetes and end-to-end observability.",
    motif: "lattice",
  },
  security: {
    label: "Security",
    description: "Minimal exposure, Zero Trust and system hardening.",
    motif: "network",
  },
  software: {
    label: "Software",
    description: "Software engineering, performance, languages and architecture.",
    motif: "flamegraph",
  },
} as const satisfies Record<string, { label: string; description: string; motif: Motif }>;

export type CategoryId = keyof typeof CATEGORIES;
export const CATEGORY_IDS = Object.keys(CATEGORIES) as [CategoryId, ...CategoryId[]];

/** Areas with at least one article, in canonical order (empty areas are hidden). */
export function categoriesInUse(posts: readonly { category: CategoryId }[]): CategoryId[] {
  const used = new Set(posts.map((post) => post.category));
  return CATEGORY_IDS.filter((id) => used.has(id));
}
