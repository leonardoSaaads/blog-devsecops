import { expect, test } from "@playwright/test";

test.describe("segurança e SEO", () => {
  test("cabeçalhos de segurança presentes em páginas HTML", async ({ request }) => {
    const response = await request.get("/blog/comandos-linux");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("workers recebem CSP própria e restritiva", async ({ request }) => {
    const js = await request.get("/workers/js-runner.js");
    expect(js.headers()["content-security-policy"]).toBe(
      "default-src 'none'; script-src 'unsafe-eval'",
    );
    const py = await request.get("/workers/py-runner.mjs");
    expect(py.headers()["content-security-policy"]).toContain(
      "connect-src https://cdn.jsdelivr.net",
    );
  });

  test("a página não gera violações de CSP nem erros de console", async ({ page }) => {
    test.setTimeout(90_000); // quatro páginas completas

    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
    for (const path of ["/", "/blog/dwdm_intoduction", "/blog/bastidores-do-blog", "/tags"]) {
      await page.goto(path, { waitUntil: "networkidle" });
    }
    // A fibra 3D (three.js) só carrega quando entra na tela: rola até ela e espera o WebGL.
    await page.goto("/blog/dwdm_intoduction");
    await page.getByTestId("fiber-3d").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("fiber-3d").locator("canvas")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    // Recursos externos (ex.: imagens de terceiros, Giscus) podem falhar sem rede; CSP nunca.
    expect(problems.filter((text) => /Content Security Policy|Refused to/i.test(text))).toEqual([]);
    expect(problems.filter((text) => /hydrat|pageerror/i.test(text))).toEqual([]);
    // APIs obsoletas (ex.: THREE.Clock) e preloads desperdiçados não podem voltar.
    expect(
      problems.filter((text) => /deprecated|preloaded using link preload/i.test(text)),
    ).toEqual([]);
  });

  test("páginas leves: arte como imagem estática, fora do HTML", async ({ request }) => {
    const home = await (await request.get("/")).text();
    // Antes da correção: 1,9 MB (SVGs embutidos no HTML e no payload do React).
    expect(home.length).toBeLessThan(250_000);
    expect(home).toContain('src="/art/eye/inicio.svg"');
    const art = await request.get("/art/spectrum/dwdm_intoduction.svg");
    expect(art.headers()["content-type"]).toContain("image/svg+xml");
    expect(art.headers()["cache-control"]).toContain("max-age");
    expect((await art.body()).length).toBeLessThan(70_000);
    expect((await request.get("/art/spectrum/..%2F..%2Fetc.svg")).status()).toBe(404);
  });

  test("sitemap, robots, RSS e manifest", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/blog/dwdm_intoduction");
    expect(sitemap).toContain("/tags/kubernetes");
    expect(sitemap).not.toContain("/shop");
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    const feed = await request.get("/feed.xml");
    expect(feed.headers()["content-type"]).toContain("application/rss+xml");
    expect(await feed.text()).toContain("<item>");
    expect((await request.get("/manifest.webmanifest")).ok()).toBe(true);
  });

  test("metadados, JSON-LD com citações e imagem Open Graph", async ({ page, request }) => {
    await page.goto("/blog/valocidade-de-linguagem-nao-importa");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/blog\/valocidade-de-linguagem-nao-importa$/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.citation.length).toBeGreaterThan(5);

    const og = await request.get("/blog/valocidade-de-linguagem-nao-importa/opengraph-image");
    expect(og.ok()).toBe(true);
    expect(og.headers()["content-type"]).toBe("image/png");
  });

  test("links externos dos artigos abrem com rel=noopener", async ({ page }) => {
    await page.goto("/blog/deploy-zabbix-em-minutos");
    const external = page.locator('[data-testid="post-content"] a[href^="http"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(external.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });
});
