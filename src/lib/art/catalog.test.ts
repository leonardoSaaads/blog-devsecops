import { GET, generateStaticParams } from "@/app/art/[motif]/[file]/route";
import { getAllPosts } from "@/lib/content/posts";
import { allArtworks } from "./catalog";
import { ART_SEED_PATTERN, artUrl } from "./url";

const call = (motif: string, file: string) =>
  GET(new Request(`http://localhost/art/${motif}/${file}`), {
    params: Promise.resolve({ motif, file }),
  });

describe("art as a static file", () => {
  it("the catalog covers every article with valid, unique seeds", () => {
    const artworks = allArtworks();
    const keys = artworks.map(({ motif, seed }) => `${motif}/${seed}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(artworks.every(({ seed }) => ART_SEED_PATTERN.test(seed))).toBe(true);
    for (const post of getAllPosts()) expect(keys).toContain(`${post.art}/${post.slug}`);
    expect(generateStaticParams()).toHaveLength(artworks.length);
  });

  it("serves a self-contained SVG, without scripts and with caching", async () => {
    const response = await call("spectrum", "dwdm-introduction.svg");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("cache-control")).toContain("max-age=");
    const svg = await response.text();
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toMatch(/<script|on[a-z]+=/i);
    expect(artUrl("spectrum", "dwdm-introduction")).toBe("/art/spectrum/dwdm-introduction.svg");
  });

  it("rejects an invalid motif or seed", async () => {
    expect((await call("does-not-exist", "x.svg")).status).toBe(404);
    expect((await call("spectrum", "../etc.svg")).status).toBe(404);
    expect((await call("spectrum", "NO-EXTENSION")).status).toBe(404);
  });
});
