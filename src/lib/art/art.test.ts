import { GENERATORS, MAX_ANIMATED_SHAPES, generateArt, seedFrom, spectralColor } from "./motifs";
import { artworkToSvg } from "./render";
import { MOTIFS, type Shape } from "./types";

function flatten(shapes: Shape[]): Shape[] {
  return shapes.flatMap((shape) => (shape.kind === "group" ? flatten(shape.children) : [shape]));
}

describe("generative art", () => {
  it("every motif is registered", () => {
    expect(Object.keys(GENERATORS).sort()).toEqual([...MOTIFS].sort());
  });

  it.each(MOTIFS.map((motif) => [motif]))(
    "%s is deterministic, finite and size-bounded",
    (motif) => {
      const a = generateArt(motif, "slug-a");
      const b = generateArt(motif, "slug-a");
      expect(artworkToSvg(a)).toBe(artworkToSvg(b));
      const shapes = flatten(a.shapes);
      expect(shapes.length).toBeGreaterThan(20);
      expect(shapes.length).toBeLessThan(4000);
      for (const shape of shapes) {
        const numbers = Object.values(shape).filter(
          (value): value is number => typeof value === "number",
        );
        expect(numbers.every(Number.isFinite)).toBe(true);
        if (shape.kind === "path") expect(shape.d).not.toMatch(/NaN|Infinity/);
      }
      expect(a.caption.length).toBeGreaterThan(20);
      // File served under /art: bounded size (downloaded for cards and covers).
      expect(artworkToSvg(a).length).toBeLessThan(70_000);
    },
  );

  it("caps animated elements (repaint cost without a GPU)", () => {
    const countAnimated = (shapes: Shape[]): number =>
      shapes.reduce(
        (sum, shape) =>
          sum +
          (shape.className ? 1 : 0) +
          (shape.kind === "group" ? countAnimated(shape.children) : 0),
        0,
      );
    for (const motif of MOTIFS) {
      for (const seed of ["a", "b", "linux-fundamentals"]) {
        expect(countAnimated(generateArt(motif, seed).shapes)).toBeLessThanOrEqual(
          MAX_ANIMATED_SHAPES,
        );
      }
    }
  });

  it("different seeds produce different artworks", () => {
    expect(artworkToSvg(generateArt("lattice", "a"))).not.toBe(
      artworkToSvg(generateArt("lattice", "b")),
    );
    expect(seedFrom("dwdm")).not.toBe(seedFrom("dwdn"));
  });

  it("the Open Graph SVG is self-contained and escapes attributes", () => {
    const svg = artworkToSvg(generateArt("radar", "x"));
    expect(svg.startsWith("<svg xmlns=")).toBe(true);
    expect(svg).not.toContain("class=");
  });

  it("spectral colors run from violet to red", () => {
    expect(spectralColor(0)).toBe("hsl(265, 90%, 62%)");
    expect(spectralColor(1)).toBe("hsl(0, 90%, 62%)");
  });
});
