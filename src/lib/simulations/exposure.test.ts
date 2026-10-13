import { describe, expect, it } from "vitest";
import { assessExposure, SECURE_PRESET } from "./exposure";

describe("exposição de serviços", () => {
  it("porta publicada em todas as interfaces fica exposta mesmo com UFW ligado", () => {
    const report = assessExposure({ publish: "all", ufw: true, tunnel: false, access: false });
    expect(report.verdict).toBe("exposto");
    expect(report.inboundPorts).toEqual(["9090/tcp"]);
    expect(report.findings.join(" ")).toMatch(/UFW não protege/);
  });

  it("túnel com Access e sem portas publicadas é a configuração recomendada", () => {
    const report = assessExposure(SECURE_PRESET);
    expect(report.verdict).toBe("protegido");
    expect(report.inboundPorts).toEqual([]);
    expect(report.paths.find((path) => path.id === "tunnel")).toMatchObject({
      reachable: true,
      authenticated: true,
    });
  });

  it("túnel sem Access expõe o serviço sem autenticação", () => {
    expect(
      assessExposure({ publish: "none", ufw: true, tunnel: true, access: false }).verdict,
    ).toBe("exposto");
  });

  it("sem túnel e com porta local, o serviço fica isolado", () => {
    expect(
      assessExposure({ publish: "localhost", ufw: true, tunnel: false, access: false }).verdict,
    ).toBe("isolado");
  });
});
