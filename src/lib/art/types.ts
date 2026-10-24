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
  /** CSS class for optional animations (applied on the article cover only). */
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
  /** Background gradient (top to bottom). */
  background: [string, string];
  /** Optional radial glow (color, cx, cy as fractions). */
  glow?: { color: string; cx: number; cy: number };
  shapes: Shape[];
  /** Descriptive caption (also used as alt text). */
  caption: string;
}

export const ART_WIDTH = 1200;
export const ART_HEIGHT = 630;
