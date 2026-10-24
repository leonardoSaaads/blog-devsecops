import { expect, test } from "@playwright/test";

test.describe("jornada do leitor", () => {
  test("da home até um artigo: filtro, sumário, citações e navegação entre artigos", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Leonardo Saads/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ensaios técnicos");

    await page.getByTestId("cta-blog").click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByTestId("post-card")).toHaveCount(2);

    await page.getByTestId("post-filter").fill("linux");
    await expect(page.getByTestId("post-card")).toHaveCount(1);
    await expect(page).toHaveURL(/\?q=linux/);

    await page.getByTestId("post-card").getByRole("link", { name: /Linux/ }).click();
    await expect(page).toHaveURL(/\/blog\/comandos-linux$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Entendendo um pouco de Linux",
    );

    // Sumário lateral leva à seção
    await page.getByTestId("toc").getByRole("link", { name: "Processos e sinais" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: /Processos e sinais/ }),
    ).toBeInViewport();

    // Citação numerada leva à lista de referências ABNT
    await page.locator('sup a[href^="#ref-"]').first().click();
    await expect(page.getByTestId("references")).toBeVisible();
    await expect(page.getByTestId("references")).toContainText("Disponível em:");

    // Próximo/anterior
    await page
      .getByRole("navigation", { name: "Artigos adjacentes" })
      .getByRole("link")
      .first()
      .click();
    await expect(page).not.toHaveURL(/comandos-linux/);
    await expect(page.getByTestId("post-content")).toBeVisible();
  });

  test("artigo acadêmico: capa, resumo, pontos-chave, figuras numeradas, notas e glossário", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/dwdm_intoduction");
    await expect(page.getByTestId("post-hero")).toContainText("Telecomunicações");

    // Desempenho: a capa não pode ter animações contínuas (repintar o SVG ocupa a CPU
    // inteira em aparelhos sem GPU). Só a revelação inicial, finita, é permitida.
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
    await expect(page.getByTestId("abstract")).toContainText("Resumo");
    await expect(page.getByTestId("abstract")).toContainText("Palavras-chave:");
    await expect(page.getByTestId("key-points").getByRole("listitem")).toHaveCount(4);

    // Numeração automática por contadores CSS: a primeira figura é a "Figura 1."
    const firstLabel = await page
      .locator(".figure-label")
      .first()
      .evaluate((element) => getComputedStyle(element, "::before").content);
    expect(firstLabel).toContain("Figura");

    // Nota de margem flutua na coluna lateral em telas largas
    const note = page.getByRole("note").filter({ hasText: "campo modal" });
    const content = await page.getByTestId("post-content").boundingBox();
    const noteBox = await note.boundingBox();
    expect(noteBox!.x).toBeGreaterThan(content!.x + content!.width - 5);

    // Termo do glossário abre a definição no foco e fecha com Esc
    const term = page.getByTestId("term").filter({ hasText: "LCoS" });
    await term.focus();
    await expect(term).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("tooltip").filter({ hasText: "Liquid Crystal on Silicon" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(term).toHaveAttribute("aria-expanded", "false");
  });

  test("filtro por área e página de tópicos", async ({ page }) => {
    await page.goto("/blog");
    await page
      .getByRole("group", { name: "Filtrar por área" })
      .getByRole("button", { name: "Segurança" })
      .click();
    await expect(page).toHaveURL(/area=seguranca/);
    await expect(page.getByTestId("post-card")).toHaveCount(1);
    await page.goto("/tags");
    await page.getByRole("link", { name: "Ver artigos de Telecomunicações" }).click();
    await expect(page).toHaveURL(/\/blog\?area=telecomunicacoes$/);
    await expect(page.getByTestId("post-card")).toHaveCount(1);
  });

  test("tags: do artigo para a listagem por tema", async ({ page }) => {
    await page.goto("/blog/comandos-linux");
    await page.getByTestId("abstract").getByRole("link", { name: "linux", exact: true }).click();
    await expect(page).toHaveURL(/\/tags\/linux$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("#linux");
    await expect(page.getByTestId("post-card").first()).toBeVisible();
  });

  test("menu principal leva a todas as seções", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    for (const [label, url, heading] of [
      ["Artigos", /\/blog$/, "Artigos"],
      ["Tópicos", /\/tags$/, "Tópicos"],
      ["Projetos", /\/projects$/, "Projetos"],
      ["Sobre", /\/about$/, "Leonardo Saads Pinto"],
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

  test("busca encontra áreas e palavras-chave", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("search-trigger").click();
    await page.getByTestId("search-input").fill("telecomunicacoes");
    await page.getByRole("option", { name: /Área: Telecomunicações/ }).click();
    await expect(page).toHaveURL(/\/blog\?area=telecomunicacoes$/);
    await expect(page.getByTestId("post-card")).toHaveCount(1);
  });
});
