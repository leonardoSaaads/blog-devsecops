import { expect, test } from "@playwright/test";

test.describe("experiência móvel", () => {
  test("menu móvel navega e fecha ao trocar de página", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.getByRole("navigation", { name: "Navegação principal (móvel)" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Sobre" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(menu).toBeHidden();
  });

  test("artigo usa sumário recolhível e não tem rolagem horizontal", async ({ page }) => {
    await page.goto("/blog/dwdm_intoduction");
    const summary = page.locator("summary", { hasText: "Neste artigo" });
    await summary.click();
    await page
      .getByRole("navigation", { name: "Sumário do artigo" })
      .getByRole("link", { name: /7\.1 OSNR/ })
      .click();
    await expect(page.getByRole("heading", { name: "7.1 OSNR" })).toBeInViewport();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("simulador de Kubernetes funciona com toque", async ({ page }) => {
    await page.goto("/blog/first-steps-with-k8s");
    const sim = page.getByTestId("k8s-simulator");
    await sim.scrollIntoViewIfNeeded();
    await sim.getByRole("button", { name: "Aumentar réplicas" }).tap();
    await expect(sim.getByTestId("replicas")).toHaveText("replicas: 4");
  });
});
