import {
  CLOUDFLARE_LIMITS,
  cloudflareHeadersFile,
  cloudflareRedirectsFile,
  serializeHeadersFile,
  serializeRedirectsFile,
  toCloudflarePath,
} from "./cloudflare";
import { LEGACY_REDIRECTS, legacyTagRedirects } from "./redirects";

/** Groups `_headers` into { path: lines } blocks. */
function parseBlocks(file: string): Map<string, string[]> {
  return new Map(
    file
      .trim()
      .split("\n\n")
      .map((block) => {
        const [path, ...lines] = block.split("\n");
        return [path!, lines.map((line) => line.trim())];
      }),
  );
}

describe("Cloudflare _headers", () => {
  const blocks = parseBlocks(cloudflareHeadersFile());

  it("applies the production CSP and security headers to every route", () => {
    const global = blocks.get("/*")!;
    const csp = global.find((line) => line.startsWith("Content-Security-Policy:"))!;
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(global).toContain("X-Frame-Options: DENY");
    expect(global.some((line) => line.startsWith("Strict-Transport-Security:"))).toBe(true);
  });

  it("a later rule replaces (does not join) the inherited header", () => {
    const file = serializeHeadersFile([
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'self'" }],
      },
      {
        source: "/embed/*",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'none'" }],
      },
    ]);
    expect(parseBlocks(file).get("/embed/*")).toEqual([
      "! Content-Security-Policy",
      "Content-Security-Policy: default-src 'none'",
    ]);
  });

  it("sets the type and cache headers a static export does not keep", () => {
    expect(blocks.get("/_next/static/*")).toContain(
      "Cache-Control: public, max-age=31536000, immutable",
    );
    expect(blocks.get("/feed.xml")).toContain("Content-Type: application/rss+xml; charset=utf-8");
    expect(blocks.get("/opengraph-image")).toContain("Content-Type: image/png");
    expect(blocks.get("/blog/:slug/opengraph-image")).toContain("Content-Type: image/png");
    expect(blocks.get("/art/*")?.some((line) => line.includes("max-age=86400"))).toBe(true);
    expect(blocks.get("/_img/*")?.some((line) => line.includes("max-age=86400"))).toBe(true);
  });

  it("stays within the platform limits", () => {
    expect(blocks.size).toBeLessThanOrEqual(CLOUDFLARE_LIMITS.headerRules);
    for (const line of cloudflareHeadersFile().split("\n")) {
      expect(line.length).toBeLessThanOrEqual(CLOUDFLARE_LIMITS.lineLength);
    }
  });

  it("rejects line breaks (rule injection)", () => {
    expect(() =>
      serializeHeadersFile([{ source: "/*", headers: [{ key: "X-A", value: "1\n/x\n  X-B: 2" }] }]),
    ).toThrow(/Line break/);
  });

  it("converts Next patterns and refuses those with no equivalent", () => {
    expect(toCloudflarePath("/:path*")).toBe("/*");
    expect(toCloudflarePath("/art/:path*")).toBe("/art/*");
    expect(toCloudflarePath("/blog/:slug/opengraph-image")).toBe("/blog/:slug/opengraph-image");
    expect(() => toCloudflarePath("/blog/:slug(\\d+)")).toThrow();
    expect(() => toCloudflarePath("/:path+")).toThrow();
    expect(() => toCloudflarePath("blog")).toThrow();
  });
});

describe("Cloudflare _redirects", () => {
  it("redirects old uppercase tags with a 308", () => {
    const file = cloudflareRedirectsFile(["devops", "zero-trust"]);
    expect(file.split("\n").slice(LEGACY_REDIRECTS.length)).toEqual([
      "/tags/DEVOPS /tags/devops 308",
      "/tags/ZERO-TRUST /tags/zero-trust 308",
      "",
    ]);
  });

  it("redirects the Portuguese slugs and tags from before the translation", () => {
    const file = cloudflareRedirectsFile([]);
    expect(file).toContain("/blog/comandos-linux /blog/linux-fundamentals 308");
    expect(file).toContain("/blog/dwdm_intoduction /blog/dwdm-introduction 308");
    expect(file).toContain("/tags/seguranca /tags/security 308");
  });

  it("skips tags without letters (avoids a redirect loop)", () => {
    expect(legacyTagRedirects(["5g", "123"])).toEqual([
      { source: "/tags/5G", destination: "/tags/5g", permanent: true },
    ]);
  });

  it("rejects invalid sources", () => {
    expect(() =>
      serializeRedirectsFile([{ source: "/a b", destination: "/c", permanent: true }]),
    ).toThrow(/Invalid redirect/);
    expect(() =>
      serializeRedirectsFile([{ source: "a", destination: "/c", permanent: true }]),
    ).toThrow(/Invalid redirect/);
  });
});
