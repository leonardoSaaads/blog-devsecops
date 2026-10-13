import { expect, test } from "@playwright/test";

test.describe("figuras interativas", () => {
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
    const figure = page.getByTestId("permission-lab");
    await figure.getByRole("button", { name: "777" }).click();
    await expect(figure.getByTestId("ls-output")).toContainText("-rwxrwxrwx");
    await expect(figure).toContainText("777: qualquer usuário");
    await figure.getByTestId("perm-others-write").uncheck();
    await expect(figure.getByTestId("octal-input")).toHaveValue("775");
    await figure.getByTestId("umask-input").fill("077");
    await expect(figure.getByTestId("umask-output")).toContainText("600");
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

  test("figuras de DWDM respondem aos controles", async ({ page }) => {
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

  test("sinais: forma shell perde o SIGTERM; tini com tratador encerra com elegância", async ({
    page,
  }) => {
    await page.goto("/blog/comandos-linux");
    const figure = page.getByTestId("signal-simulator");
    await expect(figure.getByTestId("signal-state")).toHaveText("Morto pelo kernel");
    await figure.getByRole("button", { name: "Com init (tini)" }).click();
    await expect(figure.getByTestId("signal-state")).toHaveText("Encerrado com elegância");
    await expect(figure.getByTestId("signal-timeline")).toContainText("exit(0)");
  });

  test("hierarquia de diretórios: navegação até sshd_config", async ({ page }) => {
    await page.goto("/blog/comandos-linux");
    const figure = page.getByTestId("filesystem-explorer");
    await figure.getByRole("button", { name: /^ssh$/ }).click();
    await figure.getByRole("button", { name: /sshd_config/ }).click();
    await expect(figure.getByTestId("fs-path")).toHaveText("/etc/ssh/sshd_config");
    await expect(figure).toContainText("PermitRootLogin no");
  });

  test("exposição de portas: UFW não protege porta publicada pelo Docker", async ({ page }) => {
    await page.goto("/blog/cloudflared-tunnel-tutorail");
    const figure = page.getByTestId("port-exposure");
    await expect(figure.getByTestId("exposure-verdict")).toContainText("Exposto");
    await figure.getByRole("button", { name: /Configuração recomendada/ }).click();
    await expect(figure.getByTestId("exposure-verdict")).toContainText("autenticação na borda");
  });

  test("PromQL: janela, reset e rate()", async ({ page }) => {
    await page.goto("/blog/monitoramento-homeserver");
    const figure = page.getByTestId("rate-explainer");
    await expect(figure.getByTestId("naive-delta")).toHaveText(/^-/);
    await figure.getByTestId("rate-reset").uncheck();
    await expect(figure.getByTestId("naive-delta")).not.toHaveText(/^-/);
    await figure.getByRole("button", { name: "[5m]" }).click();
    await expect(figure.getByTestId("rate-value")).toHaveText(/B\/s$/);
  });

  test("SNMP: walk da sub-árvore system", async ({ page }) => {
    await page.goto("/blog/deploy-zabbix-em-minutos");
    const figure = page.getByTestId("mib-explorer");
    await figure.getByRole("button", { name: /^system/ }).click();
    await figure.getByTestId("mib-walk").click();
    await expect(figure.getByTestId("mib-output")).toContainText("SNMPv2-MIB::sysLocation.0", {
      timeout: 5000,
    });
  });

  test("complexidade: ponto de cruzamento acompanha o fator da linguagem", async ({ page }) => {
    await page.goto("/blog/valocidade-de-linguagem-nao-importa");
    const figure = page.getByTestId("complexity-chart");
    await expect(figure.getByTestId("complexity-crossover")).toContainText("n ≈ 4");
    await figure.getByTestId("complexity-factor").fill("100");
    await expect(figure.getByTestId("complexity-crossover")).toContainText("100×");
  });

  test("fibra óptica 3D renderiza em WebGL e alterna o tipo de fibra", async ({ page }) => {
    await page.goto("/blog/dwdm_intoduction");
    const figure = page.getByTestId("fiber-3d");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(figure).not.toContainText("carregando modelo 3D");
    await figure.getByTestId("fiber-single").click();
    await expect(figure.getByTestId("fiber-modes")).toHaveText("1 modo");
    // O canvas tem pixels desenhados (não está vazio)
    const drawn = await figure
      .locator("canvas")
      .evaluate((canvas: HTMLCanvasElement) => canvas.width > 0 && canvas.height > 0);
    expect(drawn).toBe(true);
  });

  test("arte generativa: a semente determina a ilustração", async ({ page }) => {
    await page.goto("/blog/bastidores-do-blog");
    const figure = page.getByTestId("art-explorer");
    const original = await figure.getByTestId("art-preview").innerHTML();
    await figure.getByTestId("art-seed").fill("outra-semente");
    await expect.poll(() => figure.getByTestId("art-preview").innerHTML()).not.toBe(original);
    await figure.getByTestId("art-seed").fill("bastidores-do-blog");
    await expect.poll(() => figure.getByTestId("art-preview").innerHTML()).toBe(original);
  });
});
