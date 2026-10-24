import { WORKER_CSP } from "@/lib/security/headers";
import {
  CLOUDFLARE_LIMITS,
  cloudflareHeadersFile,
  cloudflareRedirectsFile,
  serializeHeadersFile,
  serializeRedirectsFile,
  toCloudflarePath,
} from "./cloudflare";
import { legacyTagRedirects } from "./redirects";

/** Agrupa o `_headers` em blocos { caminho: linhas }. */
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

describe("_headers da Cloudflare", () => {
  const blocks = parseBlocks(cloudflareHeadersFile());

  it("aplica a CSP de produção e os cabeçalhos de segurança a todas as rotas", () => {
    const global = blocks.get("/*")!;
    const csp = global.find((line) => line.startsWith("Content-Security-Policy:"))!;
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(global).toContain("X-Frame-Options: DENY");
    expect(global.some((line) => line.startsWith("Strict-Transport-Security:"))).toBe(true);
  });

  it("substitui (não concatena) a CSP dos workers", () => {
    expect(blocks.get("/workers/js-runner.js")).toEqual([
      "! Content-Security-Policy",
      `Content-Security-Policy: ${WORKER_CSP.javascript}`,
    ]);
    expect(blocks.get("/workers/py-runner.mjs")).toContain(
      `Content-Security-Policy: ${WORKER_CSP.python}`,
    );
  });

  it("define tipo e cache que a exportação estática não preserva", () => {
    expect(blocks.get("/_next/static/*")).toContain(
      "Cache-Control: public, max-age=31536000, immutable",
    );
    expect(blocks.get("/feed.xml")).toContain("Content-Type: application/rss+xml; charset=utf-8");
    expect(blocks.get("/opengraph-image")).toContain("Content-Type: image/png");
    expect(blocks.get("/blog/:slug/opengraph-image")).toContain("Content-Type: image/png");
    expect(blocks.get("/art/*")?.some((line) => line.includes("max-age=86400"))).toBe(true);
    expect(blocks.get("/_img/*")?.some((line) => line.includes("max-age=86400"))).toBe(true);
  });

  it("respeita os limites da plataforma", () => {
    expect(blocks.size).toBeLessThanOrEqual(CLOUDFLARE_LIMITS.headerRules);
    for (const line of cloudflareHeadersFile().split("\n")) {
      expect(line.length).toBeLessThanOrEqual(CLOUDFLARE_LIMITS.lineLength);
    }
  });

  it("rejeita quebras de linha (injeção de regras)", () => {
    expect(() =>
      serializeHeadersFile([{ source: "/*", headers: [{ key: "X-A", value: "1\n/x\n  X-B: 2" }] }]),
    ).toThrow(/Quebra de linha/);
  });

  it("converte padrões do Next e recusa os que não têm equivalente", () => {
    expect(toCloudflarePath("/:path*")).toBe("/*");
    expect(toCloudflarePath("/art/:path*")).toBe("/art/*");
    expect(toCloudflarePath("/blog/:slug/opengraph-image")).toBe("/blog/:slug/opengraph-image");
    expect(() => toCloudflarePath("/blog/:slug(\\d+)")).toThrow();
    expect(() => toCloudflarePath("/:path+")).toThrow();
    expect(() => toCloudflarePath("blog")).toThrow();
  });
});

describe("_redirects da Cloudflare", () => {
  it("mantém os links legados com 308", () => {
    const file = cloudflareRedirectsFile(["devops", "zero-trust"]);
    expect(file.split("\n")).toEqual([
      "/blog/hello-world /blog/bastidores-do-blog 308",
      "/tags/DEVOPS /tags/devops 308",
      "/tags/ZERO-TRUST /tags/zero-trust 308",
      "",
    ]);
  });

  it("não gera regra para tags sem letras (evita laço de redirecionamento)", () => {
    expect(legacyTagRedirects(["5g", "123"])).toEqual([
      { source: "/tags/5G", destination: "/tags/5g", permanent: true },
    ]);
  });

  it("rejeita origens inválidas", () => {
    expect(() =>
      serializeRedirectsFile([{ source: "/a b", destination: "/c", permanent: true }]),
    ).toThrow(/inválido/);
    expect(() =>
      serializeRedirectsFile([{ source: "a", destination: "/c", permanent: true }]),
    ).toThrow(/inválido/);
  });
});
