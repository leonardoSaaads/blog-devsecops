import type { Artwork, Shape } from "./types";

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function paintAttrs(shape: Shape): string {
  const attrs: string[] = [];
  attrs.push(`fill="${escapeAttr(shape.fill ?? (shape.kind === "path" ? "none" : "none"))}"`);
  if (shape.stroke) attrs.push(`stroke="${escapeAttr(shape.stroke)}"`);
  if (shape.strokeWidth) attrs.push(`stroke-width="${shape.strokeWidth}"`);
  if (shape.opacity !== undefined) attrs.push(`opacity="${shape.opacity}"`);
  if (shape.dash) attrs.push(`stroke-dasharray="${escapeAttr(shape.dash)}"`);
  return attrs.join(" ");
}

function shapeToString(shape: Shape): string {
  switch (shape.kind) {
    case "path":
      return `<path d="${shape.d}" ${paintAttrs(shape)} stroke-linecap="round" stroke-linejoin="round"/>`;
    case "circle":
      return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" ${paintAttrs(shape)}/>`;
    case "rect":
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" rx="${shape.rx ?? 0}" ${paintAttrs(shape)}/>`;
    case "group":
      return `<g>${shape.children.map(shapeToString).join("")}</g>`;
  }
}

const n = (value: number) => Number(value.toFixed(1));

/** A shape that can be converted to path data (to merge several into a single element). */
function asPathData(shape: Shape): string | null {
  if (shape.kind === "path") return shape.d;
  if (shape.kind === "rect" && !shape.stroke) {
    const r = Math.min(n(shape.rx ?? 0), shape.w / 2, shape.h / 2);
    if (r === 0) return `M${n(shape.x)} ${n(shape.y)}h${n(shape.w)}v${n(shape.h)}h${n(-shape.w)}z`;
    const w = n(shape.w - 2 * r);
    const h = n(shape.h - 2 * r);
    return `M${n(shape.x + r)} ${n(shape.y)}h${w}a${r} ${r} 0 0 1 ${r} ${r}v${h}a${r} ${r} 0 0 1 ${-r} ${r}h${-w}a${r} ${r} 0 0 1 ${-r} ${-r}v${-h}a${r} ${r} 0 0 1 ${r} ${-r}z`;
  }
  if (shape.kind === "circle" && !shape.stroke) {
    const r = n(shape.r);
    return `M${n(shape.cx - shape.r)} ${n(shape.cy)}a${r} ${r} 0 1 0 ${n(2 * shape.r)} 0a${r} ${r} 0 1 0 ${n(-2 * shape.r)} 0`;
  }
  return null;
}

const paintKey = (shape: Shape) =>
  [
    shape.fill ?? "none",
    shape.stroke ?? "",
    shape.strokeWidth ?? "",
    shape.opacity ?? "",
    shape.dash ?? "",
  ].join("|");

/**
 * Serializes shapes, merging consecutive ones with the same paint into a single <path>:
 * hundreds of elements become a handful, and the file shrinks several times over.
 */
function shapesToString(shapes: readonly Shape[]): string {
  let out = "";
  type Run = { key: string; shape: Shape; d: string[] };
  // The cast stops TS from narrowing to `null` (the variable also changes inside `flush`).
  let run = null as Run | null;
  const flush = () => {
    if (!run) return;
    out += `<path d="${run.d.join("")}" ${paintAttrs(run.shape)} stroke-linecap="round" stroke-linejoin="round"/>`;
    run = null;
  };
  for (const shape of shapes) {
    if (shape.kind === "group") {
      flush();
      out += `<g>${shapesToString(shape.children)}</g>`;
      continue;
    }
    const d = asPathData(shape);
    if (d === null) {
      flush();
      out += shapeToString(shape);
      continue;
    }
    const key = paintKey(shape);
    if (run?.key === key) run.d.push(d);
    else {
      flush();
      run = { key, shape, d: [d] };
    }
  }
  flush();
  return out;
}

/** Standalone SVG (no external CSS) — served under /art and used in Open Graph images. */
export function artworkToSvg(art: Artwork): string {
  const [top, bottom] = art.background;
  const glow = art.glow
    ? `<radialGradient id="glow" cx="${art.glow.cx}" cy="${art.glow.cy}" r="0.6"><stop offset="0" stop-color="${art.glow.color}" stop-opacity="0.85"/><stop offset="1" stop-color="${art.glow.color}" stop-opacity="0"/></radialGradient>`
    : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.width} ${art.height}" width="${art.width}" height="${art.height}">`,
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>${glow}</defs>`,
    `<rect width="100%" height="100%" fill="url(#bg)"/>`,
    art.glow ? `<rect width="100%" height="100%" fill="url(#glow)"/>` : "",
    shapesToString(art.shapes),
    "</svg>",
  ].join("");
}

export function artworkToDataUri(art: Artwork): string {
  return `data:image/svg+xml;base64,${Buffer.from(artworkToSvg(art)).toString("base64")}`;
}
