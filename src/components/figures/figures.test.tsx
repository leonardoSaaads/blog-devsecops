// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DwdmGridCalculator } from "./dwdm-grid-calculator";
import { Fiber3D } from "./fiber-3d";
import { FilesystemExplorer } from "./filesystem-explorer";
import { OsnrCalculator } from "./osnr-calculator";
import { PermissionLab } from "./permission-lab";
import { QBerCalculator } from "./q-ber-calculator";
import { SignalSimulator } from "./signal-simulator";

describe("PermissionLab", () => {
  it("sincroniza caixas, octal e ls -l, alertando sobre world-writable", async () => {
    const user = userEvent.setup();
    render(<PermissionLab fileName="deploy.sh" />);
    expect(screen.getByTestId("ls-output")).toHaveTextContent("-rwxr-x---");

    await user.click(screen.getByTestId("perm-others-write"));
    expect(screen.getByTestId("octal-input")).toHaveValue("752");
    expect(screen.getByText(/world-writable/)).toBeInTheDocument();

    await user.clear(screen.getByTestId("octal-input"));
    await user.type(screen.getByTestId("octal-input"), "644");
    expect(screen.getByTestId("ls-output")).toHaveTextContent("-rw-r--r--");
    expect(screen.getByTestId("perm-owner-execute")).not.toBeChecked();
  });

  it("valida entrada octal e calcula umask com AND NOT", async () => {
    const user = userEvent.setup();
    render(<PermissionLab />);
    await user.clear(screen.getByTestId("octal-input"));
    await user.type(screen.getByTestId("octal-input"), "9");
    expect(screen.getByTestId("octal-input")).toHaveAttribute("aria-invalid", "true");

    await user.clear(screen.getByTestId("umask-input"));
    await user.type(screen.getByTestId("umask-input"), "033");
    expect(screen.getByTestId("umask-output")).toHaveTextContent("644");
  });
});

describe("calculadoras ópticas", () => {
  it("grid DWDM: canal 0 em 193,1 THz e busca por comprimento de onda", () => {
    render(<DwdmGridCalculator />);
    expect(screen.getByText("193.1000 THz")).toBeInTheDocument();
    expect(screen.getByText("1552.524 nm")).toBeInTheDocument();
    expect(screen.getByTestId("dwdm-lookup")).toHaveTextContent("n = 3");
  });

  it("OSNR padrão do enlace de 10 spans ≈ 27 dB", () => {
    render(<OsnrCalculator />);
    expect(screen.getByTestId("osnr-value")).toHaveTextContent("27.0 dB");
  });

  it("Q² de 10 dB (Q ≈ 3,16) ↔ BER ≈ 7,83e-4", () => {
    render(<QBerCalculator />);
    expect(screen.getByTestId("ber-value")).toHaveTextContent("7,83 × 10^-4");
  });
});

describe("novas figuras interativas", () => {
  it("SignalSimulator: forma shell perde o SIGTERM; tini + tratador encerra com elegância", async () => {
    const user = userEvent.setup();
    render(<SignalSimulator />);
    expect(screen.getByTestId("signal-state")).toHaveTextContent("Morto pelo kernel");
    expect(screen.getByTestId("signal-timeline")).toHaveTextContent("SIGKILL");
    await user.click(screen.getByRole("button", { name: "Com init (tini)" }));
    expect(screen.getByTestId("dockerfile")).toHaveTextContent("tini");
    expect(screen.getByTestId("signal-state")).toHaveTextContent("Encerrado com elegância");
    await user.click(screen.getByTestId("signal-handler"));
    expect(screen.getByTestId("signal-state")).toHaveTextContent("Encerrado sem limpeza");
  });

  it("FilesystemExplorer: navega até /etc/ssh/sshd_config", async () => {
    const user = userEvent.setup();
    render(<FilesystemExplorer />);
    await user.click(screen.getByRole("button", { name: /^ssh$/ }));
    await user.click(screen.getByRole("button", { name: /sshd_config/ }));
    expect(screen.getByTestId("fs-path")).toHaveTextContent("/etc/ssh/sshd_config");
    expect(screen.getByText(/PermitRootLogin no/)).toBeInTheDocument();
  });

  it("Fiber3D: alterna o tipo de fibra e exibe a quantidade de modos (sem WebGL em jsdom)", async () => {
    const user = userEvent.setup();
    render(<Fiber3D />);
    expect(screen.getByTestId("fiber-modes")).toHaveTextContent(/≈ \d{3} modos/);
    await user.click(screen.getByTestId("fiber-single"));
    expect(screen.getByTestId("fiber-modes")).toHaveTextContent("1 modo");
  });
});
