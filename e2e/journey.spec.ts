import { expect, test } from "@playwright/test";

test.describe("reader journey", () => {
  test("from home to an article: filter, table of contents, citations and article navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Leonardo Saads/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Technical essays");

    await page.getByTestId("cta-blog").click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByTestId("post-card")).toHaveCount(2);

    await page.getByTestId("post-filter").fill("linux");
    await expect(page.getByTestId("post-card")).toHaveCount(1);
    await expect(page).toHaveURL(/\?q=linux/);

    await page.getByTestId("post-card").getByRole("link", { name: /Linux/ }).click();
    await expect(page).toHaveURL(/\/blog\/linux-fundamentals$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Linux Fundamentals: Permissions, Processes, Signals and the Filesystem",
    );

    // The table of contents jumps to the section
    await page.getByTestId("toc").getByRole("link", { name: "Processes and signals" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: /Processes and signals/ }),
    ).toBeInViewport();

    // A numbered citation jumps to the IEEE reference list
    await page.locator('sup a[href^="#ref-"]').first().click();
    await expect(page.getByTestId("references")).toBeVisible();
    await expect(page.getByTestId("references")).toContainText("Available:");

    // Next/previous
    await page
      .getByRole("navigation", { name: "Adjacent articles" })
      .getByRole("link")
      .first()
      .click();
    await expect(page).not.toHaveURL(/linux-fundamentals/);
    await expect(page.getByTestId("post-content")).toBeVisible();
  });

  test("academic article: cover, abstract, key takeaways, numbered figures, notes and glossary", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/dwdm-introduction");
    await expect(page.getByTestId("post-hero")).toContainText("Telecommunications");

    // Performance: the cover cannot run continuous animations (repainting the SVG pins
    // the CPU on devices without a GPU). Only the finite initial reveal is allowed.
    const infiniteInHero = await page
      .getByTestId("post-hero")
      .evaluate(
        (hero) =>
          hero
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
            .length,
      );
    expect(infiniteInHero).toBe(0);
    await expect(page.getByTestId("abstract")).toContainText("Abstract");
    await expect(page.getByTestId("abstract")).toContainText("Keywords:");
    await expect(page.getByTestId("key-points").getByRole("listitem")).toHaveCount(4);

    // Automatic numbering via CSS counters: the first figure is "Figure 1."
    const firstLabel = await page
      .locator(".figure-label")
      .first()
      .evaluate((element) => getComputedStyle(element, "::before").content);
    expect(firstLabel).toContain("Figure");

    // The sidenote floats in the side column on wide screens
    const note = page.getByRole("note").filter({ hasText: "mode field" });
    const content = await page.getByTestId("post-content").boundingBox();
    const noteBox = await note.boundingBox();
    expect(noteBox!.x).toBeGreaterThan(content!.x + content!.width - 5);

    // A glossary term opens its definition on focus and closes with Esc
    const term = page.getByTestId("term").filter({ hasText: "LCoS" });
    await term.focus();
    await expect(term).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("tooltip").filter({ hasText: "Liquid Crystal on Silicon" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(term).toHaveAttribute("aria-expanded", "false");
  });

  test("area filter and topics page", async ({ page }) => {
    await page.goto("/blog");
    await page
      .getByRole("group", { name: "Filter by area" })
      .getByRole("button", { name: "Security" })
      .click();
    await expect(page).toHaveURL(/area=security/);
    await expect(page.getByTestId("post-card")).toHaveCount(1);
    await page.goto("/tags");
    await page.getByRole("link", { name: "See Telecommunications articles" }).click();
    await expect(page).toHaveURL(/\/blog\?area=telecommunications$/);
    await expect(page.getByTestId("post-card")).toHaveCount(1);
  });

  test("tags: from the article to the topic listing", async ({ page }) => {
    await page.goto("/blog/linux-fundamentals");
    await page.getByTestId("abstract").getByRole("link", { name: "linux", exact: true }).click();
    await expect(page).toHaveURL(/\/tags\/linux$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("#linux");
    await expect(page.getByTestId("post-card").first()).toBeVisible();
  });

  test("the main menu reaches every section", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation", exact: true });
    for (const [label, url, heading] of [
      ["Articles", /\/blog$/, "Articles"],
      ["Topics", /\/tags$/, "Topics"],
      ["Projects", /\/projects$/, "Projects"],
      ["About", /\/about$/, "Leonardo Saads Pinto"],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    }
  });

  test("unknown pages return 404 with a way back", async ({ page }) => {
    const response = await page.goto("/blog/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("old links keep working (308 redirects)", async ({ page }) => {
    await page.goto("/tags/DEVOPS");
    await expect(page).toHaveURL(/\/tags\/devops$/);
    await page.goto("/blog/comandos-linux");
    await expect(page).toHaveURL(/\/blog\/linux-fundamentals$/);
    await page.goto("/tags/seguranca");
    await expect(page).toHaveURL(/\/tags\/security$/);
  });
});

test.describe("theme and search", () => {
  test("the theme preference persists across pages and reloads", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("theme-toggle");
    await toggle.click(); // system → light
    await toggle.click(); // light → dark
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.goto("/blog");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("Ctrl+K opens search and Enter navigates to the result", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const input = page.getByTestId("search-input");
    await expect(input).toBeFocused();
    await input.fill("osnr");
    await expect(page.getByRole("option").first()).toContainText("DWDM");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/blog\/dwdm-introduction$/);
  });

  test("search finds areas and keywords", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("search-trigger").click();
    await page.getByTestId("search-input").fill("telecommunications");
    await page.getByRole("option", { name: /Area: Telecommunications/ }).click();
    await expect(page).toHaveURL(/\/blog\?area=telecommunications$/);
    await expect(page.getByTestId("post-card")).toHaveCount(1);
  });
});
