import { describe, expect, it } from "vitest";
import { ancestors, findFsNode, flattenFs } from "./filesystem";

describe("hierarquia de diretórios", () => {
  it("caminhos únicos e bem formados", () => {
    const entries = flattenFs();
    expect(new Set(entries.map((entry) => entry.path)).size).toBe(entries.length);
    expect(entries.every((entry) => entry.path === "/" || /^(\/[a-z_]+)+$/.test(entry.path))).toBe(
      true,
    );
    expect(entries.every((entry) => entry.node.summary.length > 10)).toBe(true);
  });

  it("encontra nós e marca sistemas virtuais", () => {
    expect(findFsNode("/etc/ssh/sshd_config")?.security).toMatch(/PermitRootLogin/);
    expect(findFsNode("/proc")?.virtual).toBe(true);
    expect(findFsNode("/bin")?.link).toBe("usr/bin");
    expect(findFsNode("/nao-existe")).toBeUndefined();
  });

  it("ancestrais da raiz até o caminho", () => {
    expect(ancestors("/etc/ssh")).toEqual(["/", "/etc", "/etc/ssh"]);
    expect(ancestors("/")).toEqual(["/"]);
  });
});
