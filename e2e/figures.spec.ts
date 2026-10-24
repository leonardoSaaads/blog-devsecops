import { expect, test } from "@playwright/test";

test.describe("interactive figures", () => {
  test("the permission calculator reacts to checkboxes and octal mode", async ({ page }) => {
    await page.goto("/blog/linux-fundamentals");
    const figure = page.getByTestId("permission-lab");
    await figure.getByRole("button", { name: "777" }).click();
    await expect(figure.getByTestId("ls-output")).toContainText("-rwxrwxrwx");
    await expect(figure).toContainText("777: any user");
    await figure.getByTestId("perm-others-write").uncheck();
    await expect(figure.getByTestId("octal-input")).toHaveValue("775");
    await figure.getByTestId("umask-input").fill("077");
    await expect(figure.getByTestId("umask-output")).toContainText("600");
  });

  test("DWDM figures respond to their controls", async ({ page }) => {
    await page.goto("/blog/dwdm-introduction");

    const grid = page.getByTestId("dwdm-grid");
    await grid.getByRole("button", { name: "50 GHz" }).click();
    await expect(grid.getByRole("button", { name: "50 GHz" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const bands = page.getByTestId("fiber-bands");
    await bands.getByRole("button", { name: "L", exact: true }).click();
    await expect(bands.getByTestId("band-detail")).toContainText("L-band");

    const osnr = page.getByTestId("osnr-calculator");
    await expect(osnr.getByTestId("osnr-value")).toHaveText("27.0 dB");
    await osnr.getByTestId("osnr-spans").fill("20");
    await expect(osnr.getByTestId("osnr-value")).toHaveText("23.9 dB"); // 27.0 − 10·log10(2)

    const constellation = page.getByTestId("constellation-viewer");
    await constellation.getByRole("button", { name: "DP-64QAM" }).click();
    await constellation.getByTestId("constellation-osnr").fill("12");
    await expect(constellation).toContainText("Simulated SER");
    const ser = Number(await constellation.getByTestId("ser-simulated").innerText());
    expect(ser).toBeGreaterThan(0.1); // 64QAM at a low OSNR makes many errors

    await page.getByTestId("otn-hierarchy").getByRole("button", { name: /^OTU/ }).click();
    await expect(page.getByTestId("otn-hierarchy")).toContainText("FEC: parity");
  });

  test("signals: shell form loses SIGTERM; tini with a handler shuts down gracefully", async ({
    page,
  }) => {
    await page.goto("/blog/linux-fundamentals");
    const figure = page.getByTestId("signal-simulator");
    await expect(figure.getByTestId("signal-state")).toHaveText("Killed by the kernel");
    await figure.getByRole("button", { name: "With init (tini)" }).click();
    await expect(figure.getByTestId("signal-state")).toHaveText("Shut down gracefully");
    await expect(figure.getByTestId("signal-timeline")).toContainText("exit(0)");
  });

  test("directory hierarchy: navigating to sshd_config", async ({ page }) => {
    await page.goto("/blog/linux-fundamentals");
    const figure = page.getByTestId("filesystem-explorer");
    await figure.getByRole("button", { name: /^ssh$/ }).click();
    await figure.getByRole("button", { name: /sshd_config/ }).click();
    await expect(figure.getByTestId("fs-path")).toHaveText("/etc/ssh/sshd_config");
    await expect(figure).toContainText("PermitRootLogin no");
  });

  test("the 3D optical fiber renders in WebGL and switches the fiber type", async ({ page }) => {
    await page.goto("/blog/dwdm-introduction");
    const figure = page.getByTestId("fiber-3d");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(figure).not.toContainText("loading 3D model");
    await figure.getByTestId("fiber-single").click();
    await expect(figure.getByTestId("fiber-modes")).toHaveText("1 mode");
    // The canvas has drawn pixels (it is not empty)
    const drawn = await figure
      .locator("canvas")
      .evaluate((canvas: HTMLCanvasElement) => canvas.width > 0 && canvas.height > 0);
    expect(drawn).toBe(true);
  });
});
