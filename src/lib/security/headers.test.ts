import { buildContentSecurityPolicy, buildSecurityHeaders } from "./headers";

function directives(csp: string): Map<string, string[]> {
  return new Map(
    csp.split(";").map((part) => {
      const [name, ...values] = part.trim().split(/\s+/);
      return [name!, values];
    }),
  );
}

describe("security headers", () => {
  it("the production CSP is restrictive", () => {
    const csp = directives(buildContentSecurityPolicy({ isDev: false }));
    expect(csp.get("default-src")).toEqual(["'self'"]);
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("frame-ancestors")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("script-src")).not.toContain("'unsafe-eval'");
    expect(csp.get("frame-src")).toEqual(["https://giscus.app"]);
  });

  it("'unsafe-eval' only in development (React Refresh)", () => {
    expect(directives(buildContentSecurityPolicy({ isDev: true })).get("script-src")).toContain(
      "'unsafe-eval'",
    );
  });

  it("no page uses Web Workers: worker-src 'none'", () => {
    expect(directives(buildContentSecurityPolicy({ isDev: false })).get("worker-src")).toEqual([
      "'none'",
    ]);
  });

  it("a single global rule carries every security header", () => {
    const rules = buildSecurityHeaders({ isDev: false });
    expect(rules[0]?.source).toBe("/:path*");
    const keys = rules[0]!.headers.map((header) => header.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Cross-Origin-Opener-Policy",
      ]),
    );
    expect(rules).toHaveLength(1);
  });
});
