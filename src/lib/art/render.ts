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

/** SVG autônomo (sem CSS externo) — usado nas imagens Open Graph. */
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
    art.shapes.map(shapeToString).join(""),
    "</svg>",
  ].join("");
}

export function artworkToDataUri(art: Artwork): string {
  return `data:image/svg+xml;base64,${Buffer.from(artworkToSvg(art)).toString("base64")}`;
}
