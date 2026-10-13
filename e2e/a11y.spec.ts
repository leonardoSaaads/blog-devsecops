import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/blog",
  "/blog/comandos-linux",
  "/blog/dwdm_intoduction",
  "/shop",
  "/shop/case-raspberry-pi-homeserver",
  "/projects",
  "/about",
  "/tags",
];

for (const theme of ["light", "dark"] as const) {
  test.describe(`acessibilidade (tema ${theme})`, () => {
    test.use({ colorScheme: theme });

    for (const path of PAGES) {
      test(`${path} sem violações sérias de WCAG 2.2 AA`, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" });
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          // Iframe de terceiros (comentários) fora do nosso controle
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
