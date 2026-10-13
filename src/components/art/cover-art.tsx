import type { SVGProps } from "react";
import { generateArt } from "@/lib/art/motifs";
import type { Motif, Shape } from "@/lib/art/types";
import { cn } from "@/lib/format";

function ShapeNode({ shape, animated }: { shape: Shape; animated: boolean }) {
  const paint = {
    fill: shape.fill ?? "none",
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
    opacity: shape.opacity,
    strokeDasharray: shape.dash,
    className: animated ? shape.className : undefined,
  };
  switch (shape.kind) {
    case "path":
      return <path d={shape.d} strokeLinecap="round" strokeLinejoin="round" {...paint} />;
    case "circle":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...paint} />;
    case "rect":
      return (
        <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...paint} />
      );
    case "group":
      return (
        <g
          className={animated ? shape.className : undefined}
          style={shape.transformOrigin ? { transformOrigin: shape.transformOrigin } : undefined}
        >
          {shape.children.map((child, index) => (
            <ShapeNode key={index} shape={child} animated={animated} />
          ))}
        </g>
      );
  }
}

/**
 * Arte generativa determinística (SVG estático renderizado no servidor).
 * `animated` liga animações CSS discretas (desligadas com prefers-reduced-motion).
 */
export function CoverArt({
  motif,
  seed,
  animated = false,
  decorative = false,
  className,
  ...props
}: { motif: Motif; seed: string; animated?: boolean; decorative?: boolean } & Omit<
  SVGProps<SVGSVGElement>,
  "children"
>) {
  const art = generateArt(motif, seed);
  const id = `art-${motif}-${seed.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox={`0 0 ${art.width} ${art.height}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": art.caption })}
      {...props}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.background[0]} />
          <stop offset="1" stopColor={art.background[1]} />
        </linearGradient>
        {art.glow && (
          <radialGradient id={`${id}-glow`} cx={art.glow.cx} cy={art.glow.cy} r="0.6">
            <stop offset="0" stopColor={art.glow.color} stopOpacity="0.85" />
            <stop offset="1" stopColor={art.glow.color} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-bg)`} />
      {art.glow && <rect width="100%" height="100%" fill={`url(#${id}-glow)`} />}
      {art.shapes.map((shape, index) => (
        <ShapeNode key={index} shape={shape} animated={animated} />
      ))}
    </svg>
  );
}

export function artCaption(motif: Motif, seed: string): string {
  return generateArt(motif, seed).caption;
}
