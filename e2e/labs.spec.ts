import { expect, test } from "@playwright/test";

test.describe("laboratórios interativos", () => {
  test("playground JavaScript executa no worker, mas sem acesso à rede", async ({ page }) => {
    await page.goto("/blog/bastidores-do-blog");
    const playground = page.getByTestId("playground-javascript");
    await playground.getByTestId("playground-run").click();
    const output = playground.getByTestId("playground-output");
    await expect(output).toContainText(
      "Primeiros 10 primos: [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ]",
    );
    await expect(output).toContainText("fetch bloqueado");
    await expect(playground).toContainText(/concluído em/);
  });

  test("loop infinito é interrompido pelo timeout sem travar a página", async ({ page }) => {
    await page.goto("/blog/bastidores-do-blog");
    const playground = page.getByTestId("playground-javascript");
    const editor = playground.getByTestId("playground-editor");
    await editor.fill("while (true) {}");
    await playground.getByTestId("playground-run").click();
    // A página continua responsiva enquanto o worker está ocupado
    await page.getByTestId("theme-toggle").click();
    await expect(playground.getByTestId("playground-output")).toContainText(
      "Execução interrompida",
      { timeout: 10_000 },
    );
  });

  test("calculadora de permissões reage às caixas e ao modo octal", async ({ page }) => {
    await page.goto("/blog/comandos-linux");
    const lab = page.getByTestId("permission-lab");
    await lab.getByRole("button", { name: "777" }).click();
    await expect(lab.getByTestId("ls-output")).toContainText("-rwxrwxrwx");
    await expect(lab).toContainText("777: qualquer usuário");
    await lab.getByTestId("perm-others-write").uncheck();
    await expect(lab.getByTestId("octal-input")).toHaveValue("775");
    await lab.getByTestId("umask-input").fill("077");
    await expect(lab.getByTestId("umask-output")).toContainText("600");
  });

  test("simulador de Kubernetes: self-healing e Service", async ({ page }) => {
    await page.goto("/blog/first-steps-with-k8s");
    const sim = page.getByTestId("k8s-simulator");
    await sim.scrollIntoViewIfNeeded();
    await expect(sim.getByTestId("endpoint-count")).toHaveText("3", { timeout: 10_000 });

    await sim
      .getByRole("button", { name: /Excluir pod/ })
      .first()
      .click();
    await expect(sim.locator('[data-phase="Terminating"]')).toHaveCount(1);
    await expect(sim.getByTestId("endpoint-count")).toHaveText("3", { timeout: 15_000 });
    await expect(sim.locator('[data-phase="Terminating"]')).toHaveCount(0, { timeout: 10_000 });

    await sim.getByTestId("k8s-request").click();
    await expect(sim.getByRole("status")).toContainText("200 OK");
    await expect(sim.getByTestId("k8s-events")).toContainText("GET /  200 OK");
  });

  test("laboratórios de DWDM respondem aos controles", async ({ page }) => {
    await page.goto("/blog/dwdm_intoduction");

    const grid = page.getByTestId("dwdm-grid");
    await grid.getByRole("button", { name: "50 GHz" }).click();
    await expect(grid.getByRole("button", { name: "50 GHz" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const bands = page.getByTestId("fiber-bands");
    await bands.getByRole("button", { name: "L", exact: true }).click();
    await expect(bands.getByTestId("band-detail")).toContainText("Banda L");

    const osnr = page.getByTestId("osnr-calculator");
    await expect(osnr.getByTestId("osnr-value")).toHaveText("27.0 dB");
    await osnr.getByTestId("osnr-spans").fill("20");
    await expect(osnr.getByTestId("osnr-value")).toHaveText("23.9 dB"); // 27,0 − 10·log10(2)

    const constellation = page.getByTestId("constellation-viewer");
    await constellation.getByRole("button", { name: "DP-64QAM" }).click();
    await constellation.getByTestId("constellation-osnr").fill("12");
    await expect(constellation).toContainText("SER simulada");
    const ser = Number(await constellation.getByTestId("ser-simulated").innerText());
    expect(ser).toBeGreaterThan(0.1); // 64QAM com OSNR baixo erra muito

    await page.getByTestId("otn-hierarchy").getByRole("button", { name: /^OTU/ }).click();
    await expect(page.getByTestId("otn-hierarchy")).toContainText("FEC: paridade");
  });

  test("quiz e diagrama de fluxo", async ({ page }) => {
    await page.goto("/blog/cloudflared-tunnel-tutorail");
    const quiz = page.getByTestId("quiz");
    await quiz.getByLabel(/contorna regras do UFW/).check();
    await quiz.getByRole("button", { name: "Verificar resposta" }).click();
    await expect(quiz).toContainText("Correto!");

    const flow = page.getByTestId("flow-diagram").nth(1);
    await flow.getByRole("button", { name: "Prometheus" }).click();
    await expect(flow).toContainText("Escuta apenas na rede interna");
  });

  test("playground Python (Pyodide) — requer acesso ao CDN", async ({ page, request }) => {
    const reachable = await request
      .head("https://cdn.jsdelivr.net/npm/pyodide@314.0.7/pyodide.mjs", { timeout: 5000 })
      .then((response) => response.ok())
      .catch(() => false);
    test.skip(!reachable, "CDN do Pyodide indisponível neste ambiente");

    await page.goto("/blog/valocidade-de-linguagem-nao-importa");
    const playground = page.getByTestId("playground-python");
    await playground.getByTestId("playground-run").click();
    await expect(playground.getByTestId("playground-output")).toContainText("memoizado: fib(300)", {
      timeout: 90_000,
    });
  });
});
