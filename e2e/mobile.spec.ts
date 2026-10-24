import { expect, test } from "@playwright/test";

test.describe("mobile experience", () => {
  test("the mobile menu navigates and closes on page change", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Main navigation (mobile)" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(menu).toBeHidden();
  });

  test("articles use a collapsible table of contents and have no horizontal scroll", async ({
    page,
  }) => {
    await page.goto("/blog/dwdm-introduction");
    const summary = page.locator("summary", { hasText: "In this article" });
    await summary.click();
    await page
      .getByRole("navigation", { name: "Table of contents" })
      .getByRole("link", { name: /7\.1 OSNR/ })
      .click();
    await expect(page.getByRole("heading", { name: "7.1 OSNR" })).toBeInViewport();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("no page scrolls horizontally", async ({ page }) => {
    test.setTimeout(60_000); // 7 full navigations

    const paths = [
      "/",
      "/blog",
      "/tags",
      "/projects",
      "/about",
      "/blog/linux-fundamentals",
      "/blog/dwdm-introduction",
    ];
    const overflowing: string[] = [];
    for (const path of paths) {
      // "load" is enough for layout; "networkidle" depends on third-party images and iframes.
      await page.goto(path, { waitUntil: "load" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) overflowing.push(`${path}: ${overflow}px`);
    }
    expect(overflowing).toEqual([]);
  });
});
