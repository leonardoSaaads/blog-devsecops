// @vitest-environment jsdom
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodePlayground } from "./code-playground";
import { DwdmGridCalculator } from "./dwdm-grid-calculator";
import { K8sSimulator } from "./k8s-simulator";
import { OsnrCalculator } from "./osnr-calculator";
import { PermissionLab } from "./permission-lab";
import { QBerCalculator } from "./q-ber-calculator";

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

describe("K8sSimulator", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("reconcilia réplicas e encaminha requisições", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<K8sSimulator />);
    await act(async () => vi.advanceTimersByTime(800 * 6));
    expect(screen.getByTestId("endpoint-count")).toHaveTextContent("3");

    await user.click(screen.getByTestId("k8s-request"));
    expect(screen.getByRole("status")).toHaveTextContent("200 OK");

    const pods = within(screen.getByTestId("pods")).getAllByRole("listitem");
    await user.click(within(pods[0]!).getByRole("button", { name: /Excluir pod/ }));
    expect(pods[0]).toHaveAttribute("data-phase", "Terminating");

    await act(async () => vi.advanceTimersByTime(800 * 8));
    expect(screen.getByTestId("endpoint-count")).toHaveTextContent("3");
  });

  it("escala para zero e o Service responde 503", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<K8sSimulator />);
    for (let i = 0; i < 3; i++)
      await user.click(screen.getByRole("button", { name: "Diminuir réplicas" }));
    await act(async () => vi.advanceTimersByTime(800 * 6));
    await user.click(screen.getByTestId("k8s-request"));
    expect(screen.getByRole("status")).toHaveTextContent("503");
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

describe("CodePlayground", () => {
  const instances: FakeWorker[] = [];
  class FakeWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    terminated = false;
    constructor(public url: string) {
      instances.push(this);
    }
    postMessage({ id, code }: { id: number; code: string }) {
      queueMicrotask(() => {
        this.onmessage?.({ data: { type: "started", id } } as MessageEvent);
        this.onmessage?.({
          data: { type: "stdout", id, text: `executou: ${code.length} chars` },
        } as MessageEvent);
        this.onmessage?.({
          data: { type: "stdout", id: 999, text: "mensagem de outra execução" },
        } as MessageEvent);
        this.onmessage?.({ data: { type: "done", id, ms: 1.5, ok: true } } as MessageEvent);
      });
    }
    terminate() {
      this.terminated = true;
    }
  }

  beforeEach(() => {
    instances.length = 0;
    vi.stubGlobal("Worker", FakeWorker);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("executa em um worker isolado e ignora mensagens de outras execuções", async () => {
    const user = userEvent.setup();
    render(<CodePlayground language="javascript" initialCode={'console.log("oi")'} />);
    await user.click(screen.getByTestId("playground-run"));

    const output = await screen.findByText("executou: 17 chars");
    expect(output).toBeInTheDocument();
    expect(screen.queryByText("mensagem de outra execução")).not.toBeInTheDocument();
    expect(screen.getByText(/concluído em 1.5 ms/)).toBeInTheDocument();
    expect(instances[0]?.url).toBe("/workers/js-runner.js");
    expect(instances[0]?.terminated).toBe(true); // JS: um worker descartável por execução
  });

  it("Tab indenta dentro do editor", async () => {
    const user = userEvent.setup();
    render(<CodePlayground language="python" initialCode="x = 1" />);
    const editor = screen.getByTestId("playground-editor");
    await user.click(editor);
    await user.keyboard("{End}{Enter}{Tab}y");
    expect(editor).toHaveValue("x = 1\n    y");
  });
});
