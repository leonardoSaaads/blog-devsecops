import { expect, test } from "@playwright/test";

test.describe("loja 3D", () => {
  test("da vitrine ao produto: visualizador 3D interativo e pedido", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("product-card")).toHaveCount(3);
    await page.getByRole("link", { name: "Organizador de transceivers SFP/QSFP" }).click();
    await expect(page).toHaveURL(/\/shop\/organizador-transceivers-sfp$/);
    await expect(page.getByTestId("product-price")).toContainText("R$");

    const viewer = page.getByTestId("model-viewer");
    await expect(viewer).toHaveAttribute("data-status", "ready", { timeout: 30_000 });
    await expect(viewer.getByTestId("model-dimensions")).toContainText("mm");
    await expect(viewer.locator("canvas")).toBeVisible();

    await viewer.getByRole("radio", { name: "Grafite" }).click();
    await expect(viewer.getByRole("radio", { name: "Grafite" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await viewer.getByTestId("toggle-wireframe").click();
    await expect(viewer.getByTestId("toggle-wireframe")).toHaveAttribute("aria-pressed", "true");

    // Interação de órbita (arrastar) não quebra a página
    const box = (await viewer.locator("canvas").boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 30, { steps: 8 });
    await page.mouse.up();

    const buy = page.getByTestId("buy-button");
    await expect(buy).toHaveAttribute("href", /^mailto:.*subject=Encomenda/);
  });
});
