export const MOTIFS = [
  "spectrum",
  "lattice",
  "bits",
  "network",
  "ridgeline",
  "radar",
  "flamegraph",
  "circuit",
  "eye",
] as const;

export type Motif = (typeof MOTIFS)[number];

interface Paint {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** Classe CSS para animações opcionais (aplicadas só na capa do artigo). */
  className?: string;
  dash?: string;
}

export type Shape =
  | ({ kind: "path"; d: string } & Paint)
  | ({ kind: "circle"; cx: number; cy: number; r: number } & Paint)
  | ({ kind: "rect"; x: number; y: number; w: number; h: number; rx?: number } & Paint)
  | ({ kind: "group"; children: Shape[]; transformOrigin?: string } & Paint);

export interface Artwork {
  motif: Motif;
  width: number;
  height: number;
  /** Gradiente de fundo (de cima para baixo). */
  background: [string, string];
  /** Brilho radial opcional (cor, cx, cy em fração). */
  glow?: { color: string; cx: number; cy: number };
  shapes: Shape[];
  /** Legenda descritiva (também usada como texto alternativo). */
  caption: string;
}

export const ART_WIDTH = 1200;
export const ART_HEIGHT = 630;
