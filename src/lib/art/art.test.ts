import { GENERATORS, MAX_ANIMATED_SHAPES, generateArt, seedFrom, spectralColor } from "./motifs";
import { artworkToSvg } from "./render";
import { MOTIFS, type Shape } from "./types";

function flatten(shapes: Shape[]): Shape[] {
  return shapes.flatMap((shape) => (shape.kind === "group" ? flatten(shape.children) : [shape]));
}

describe("arte generativa", () => {
  it("todos os motivos estão registrados", () => {
    expect(Object.keys(GENERATORS).sort()).toEqual([...MOTIFS].sort());
  });

  it.each(MOTIFS.map((motif) => [motif]))(
    "%s é determinístico, finito e com tamanho controlado",
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
      expect(artworkToSvg(a).length).toBeLessThan(600_000);
    },
  );

  it("limita os elementos animados (custo de repintura sem GPU)", () => {
    const countAnimated = (shapes: Shape[]): number =>
      shapes.reduce(
        (sum, shape) =>
          sum +
          (shape.className ? 1 : 0) +
          (shape.kind === "group" ? countAnimated(shape.children) : 0),
        0,
      );
    for (const motif of MOTIFS) {
      for (const seed of ["a", "b", "cloudflared-tunnel-tutorail"]) {
        expect(countAnimated(generateArt(motif, seed).shapes)).toBeLessThanOrEqual(
          MAX_ANIMATED_SHAPES,
        );
      }
    }
  });

  it("sementes diferentes produzem obras diferentes", () => {
    expect(artworkToSvg(generateArt("lattice", "a"))).not.toBe(
      artworkToSvg(generateArt("lattice", "b")),
    );
    expect(seedFrom("dwdm")).not.toBe(seedFrom("dwdn"));
  });

  it("SVG para Open Graph é autônomo e escapa atributos", () => {
    const svg = artworkToSvg(generateArt("radar", "x"));
    expect(svg.startsWith("<svg xmlns=")).toBe(true);
    expect(svg).not.toContain("class=");
  });

  it("cores espectrais vão do violeta ao vermelho", () => {
    expect(spectralColor(0)).toBe("hsl(265, 90%, 62%)");
    expect(spectralColor(1)).toBe("hsl(0, 90%, 62%)");
  });
});
