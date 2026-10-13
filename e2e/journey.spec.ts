import { expect, test } from "@playwright/test";

test.describe("jornada do leitor", () => {
  test("da home até um artigo: filtro, sumário, citações e navegação entre artigos", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Leonardo Saads/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Infraestrutura");

    await page.getByTestId("cta-blog").click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByTestId("post-card")).toHaveCount(8);

    await page.getByTestId("post-filter").fill("kubernetes");
    await expect(page.getByTestId("post-card")).toHaveCount(1);
    await expect(page).toHaveURL(/\?q=kubernetes/);

    await page
      .getByTestId("post-card")
      .getByRole("link", { name: /Kubernetes/ })
      .click();
    await expect(page).toHaveURL(/\/blog\/first-steps-with-k8s$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Aprendendo Kubernetes: os primeiros passos",
    );

    // Sumário lateral leva à seção
    await page.getByTestId("toc").getByRole("link", { name: "Nível 3: Service" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: /Nível 3: Service/ }),
    ).toBeInViewport();

    // Citação numerada leva à lista de referências ABNT
    await page.locator('sup a[href^="#ref-"]').first().click();
    await expect(page.getByTestId("references")).toBeVisible();
    await expect(page.getByTestId("references").getByRole("listitem").first()).toContainText(
      "Disponível em:",
    );

    // Próximo/anterior
    await page
      .getByRole("navigation", { name: "Artigos adjacentes" })
      .getByRole("link")
      .first()
      .click();
    await expect(page).not.toHaveURL(/first-steps-with-k8s/);
    await expect(page.getByTestId("post-content")).toBeVisible();
  });

  test("tags: do artigo para a listagem por tema", async ({ page }) => {
    await page.goto("/blog/comandos-linux");
    await page.getByRole("link", { name: "#linux" }).first().click();
    await expect(page).toHaveURL(/\/tags\/linux$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("#linux");
    await expect(page.getByTestId("post-card").first()).toBeVisible();
  });

  test("menu principal leva a todas as seções", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    for (const [label, url, heading] of [
      ["Loja 3D", /\/shop$/, "Modelos 3D"],
      ["Projetos", /\/projects$/, "Projetos"],
      ["Tags", /\/tags$/, "Tags"],
      ["Sobre", /\/about$/, "Leonardo Saads Pinto"],
      ["Blog", /\/blog$/, "Artigos"],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    }
  });

  test("páginas inexistentes retornam 404 com caminho de volta", async ({ page }) => {
    const response = await page.goto("/blog/nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
    await page.getByRole("link", { name: "Voltar ao início" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("links antigos continuam funcionando (redirecionamentos 308)", async ({ page }) => {
    await page.goto("/blog/hello-world");
    await expect(page).toHaveURL(/\/blog\/bastidores-do-blog$/);
    await page.goto("/tags/DEVOPS");
    await expect(page).toHaveURL(/\/tags\/devops$/);
  });
});

test.describe("tema e busca", () => {
  test("preferência de tema persiste entre páginas e recarregamentos", async ({ page }) => {
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

  test("Ctrl+K abre a busca e Enter navega para o resultado", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const input = page.getByTestId("search-input");
    await expect(input).toBeFocused();
    await input.fill("osnr");
    await expect(page.getByRole("option").first()).toContainText("DWDM");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/blog\/dwdm_intoduction$/);
  });

  test("busca encontra produtos da loja", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("search-trigger").click();
    await page.getByTestId("search-input").fill("raspberry");
    await page.getByRole("option", { name: /Case ventilado/ }).click();
    await expect(page).toHaveURL(/\/shop\/case-raspberry-pi-homeserver$/);
  });
});
