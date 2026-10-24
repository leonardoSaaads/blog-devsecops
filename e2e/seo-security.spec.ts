import { expect, test } from "@playwright/test";

test.describe("security and SEO", () => {
  test("security headers are present on HTML pages", async ({ request }) => {
    const response = await request.get("/blog/linux-fundamentals");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("pages raise no CSP violations or console errors", async ({ page }) => {
    test.setTimeout(90_000); // four full pages

    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
    for (const path of ["/", "/blog/dwdm-introduction", "/blog/linux-fundamentals", "/tags"]) {
      await page.goto(path, { waitUntil: "networkidle" });
    }
    // The 3D fiber (three.js) only loads once on screen: scroll to it and wait for WebGL.
    await page.goto("/blog/dwdm-introduction");
    await page.getByTestId("fiber-3d").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("fiber-3d").locator("canvas")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    // External resources (e.g., third-party images, Giscus) may fail offline; CSP never may.
    expect(problems.filter((text) => /Content Security Policy|Refused to/i.test(text))).toEqual([]);
    expect(problems.filter((text) => /hydrat|pageerror/i.test(text))).toEqual([]);
    // Deprecated APIs (e.g., THREE.Clock) and wasted preloads must not come back.
    expect(
      problems.filter((text) => /deprecated|preloaded using link preload/i.test(text)),
    ).toEqual([]);
  });

  test("lightweight pages: art as a static image, outside the HTML", async ({ request }) => {
    const home = await (await request.get("/")).text();
    // Before the fix: 1.9 MB (SVGs inlined in the HTML and in the React payload).
    expect(home.length).toBeLessThan(250_000);
    expect(home).toContain('src="/art/eye/inicio.svg"');
    const art = await request.get("/art/spectrum/dwdm-introduction.svg");
    expect(art.headers()["content-type"]).toContain("image/svg+xml");
    expect(art.headers()["cache-control"]).toContain("max-age");
    expect((await art.body()).length).toBeLessThan(70_000);
    expect((await request.get("/art/spectrum/..%2F..%2Fetc.svg")).status()).toBe(404);
  });

  test("sitemap, robots, RSS and manifest", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/blog/dwdm-introduction");
    expect(sitemap).toContain("/tags/linux");
    expect(sitemap).not.toContain("/shop");
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    const feed = await request.get("/feed.xml");
    expect(feed.headers()["content-type"]).toContain("application/rss+xml");
    expect(await feed.text()).toContain("<item>");
    expect((await request.get("/manifest.webmanifest")).ok()).toBe(true);
  });

  test("metadata, JSON-LD with citations and the Open Graph image", async ({ page, request }) => {
    await page.goto("/blog/dwdm-introduction");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/blog\/dwdm-introduction$/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.citation.length).toBeGreaterThan(5);

    const og = await request.get("/blog/dwdm-introduction/opengraph-image");
    expect(og.ok()).toBe(true);
    expect(og.headers()["content-type"]).toBe("image/png");
  });

  test("external article links open with rel=noopener", async ({ page }) => {
    await page.goto("/blog/linux-fundamentals");
    const external = page.locator('main a[href^="http"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(external.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });
});
