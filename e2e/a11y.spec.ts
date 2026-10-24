import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/blog",
  "/blog/linux-fundamentals",
  "/blog/dwdm-introduction",
  "/projects",
  "/about",
  "/tags",
];

for (const theme of ["light", "dark"] as const) {
  test.describe(`accessibility (${theme} theme)`, () => {
    test.use({ colorScheme: theme });
    // axe walks thousands of nodes in long articles; on 2-core runners that exceeds 30 s.
    test.describe.configure({ timeout: 90_000 });

    for (const path of PAGES) {
      test(`${path} has no serious WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" });
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          // Third-party iframe (comments) outside our control
          .exclude("iframe.giscus-frame")
          .analyze();
        const serious = results.violations.filter((violation) =>
          ["serious", "critical"].includes(violation.impact ?? ""),
        );
        expect(
          serious.map(
            (violation) =>
              `${violation.id}: ${violation.nodes
                .map((node) => node.target.join(" "))
                .slice(0, 3)
                .join(" | ")}`,
          ),
        ).toEqual([]);
      });
    }
  });
}
