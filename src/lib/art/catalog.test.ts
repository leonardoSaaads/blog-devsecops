import { GET, generateStaticParams } from "@/app/art/[motif]/[file]/route";
import { getAllPosts } from "@/lib/content/posts";
import { allArtworks } from "./catalog";
import { ART_SEED_PATTERN, artUrl } from "./url";

const call = (motif: string, file: string) =>
  GET(new Request(`http://localhost/art/${motif}/${file}`), {
    params: Promise.resolve({ motif, file }),
  });

describe("arte como arquivo estático", () => {
  it("catálogo cobre todos os artigos com sementes válidas e únicas", () => {
    const artworks = allArtworks();
    const keys = artworks.map(({ motif, seed }) => `${motif}/${seed}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(artworks.every(({ seed }) => ART_SEED_PATTERN.test(seed))).toBe(true);
    for (const post of getAllPosts()) expect(keys).toContain(`${post.art}/${post.slug}`);
    expect(generateStaticParams()).toHaveLength(artworks.length);
  });

  it("serve SVG autônomo, sem scripts e com cache", async () => {
    const response = await call("spectrum", "dwdm_intoduction.svg");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("cache-control")).toContain("max-age=");
    const svg = await response.text();
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toMatch(/<script|on[a-z]+=/i);
    expect(artUrl("spectrum", "dwdm_intoduction")).toBe("/art/spectrum/dwdm_intoduction.svg");
  });

  it("rejeita motivo ou semente inválidos", async () => {
    expect((await call("nao-existe", "x.svg")).status).toBe(404);
    expect((await call("spectrum", "../etc.svg")).status).toBe(404);
    expect((await call("spectrum", "SEM-EXTENSAO")).status).toBe(404);
  });
});
