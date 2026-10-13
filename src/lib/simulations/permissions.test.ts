import {
  applyUmask,
  modeToChmodSymbolic,
  modeToOctal,
  modeToSymbolic,
  parseOctal,
  permissionWarnings,
  toOctalString,
} from "./permissions";

describe("permissões Unix", () => {
  it("converte octal ↔ simbólico", () => {
    const mode = parseOctal("750")!;
    expect(modeToSymbolic(mode)).toBe("-rwxr-x---");
    expect(modeToOctal(mode)).toBe("750");
    expect(modeToChmodSymbolic(mode)).toBe("u=rwx,g=rx,o=");
  });

  it("representa bits especiais (setuid, sticky)", () => {
    expect(modeToSymbolic(parseOctal("4755")!)).toBe("-rwsr-xr-x");
    expect(modeToSymbolic(parseOctal("1777")!, "directory")).toBe("drwxrwxrwt");
    expect(modeToSymbolic(parseOctal("1776")!, "directory")).toBe("drwxrwxrwT");
    expect(modeToOctal(parseOctal("4755")!)).toBe("4755");
  });

  it("rejeita entradas inválidas", () => {
    expect(parseOctal("789")).toBeNull();
    expect(parseOctal("75")).toBeNull();
    expect(parseOctal("rwx")).toBeNull();
  });

  it("alerta sobre 777 e world-writable", () => {
    expect(permissionWarnings(parseOctal("777")!)[0]?.level).toBe("danger");
    expect(
      permissionWarnings(parseOctal("646")!).some((w) => w.message.includes("world-writable")),
    ).toBe(true);
    expect(permissionWarnings(parseOctal("640")!)).toHaveLength(0);
  });

  it("umask é AND NOT, não subtração", () => {
    expect(toOctalString(applyUmask("022", "file"))).toBe("644");
    expect(toOctalString(applyUmask("022", "directory"))).toBe("755");
    expect(toOctalString(applyUmask("077", "file"))).toBe("600");
    // 666 - 033 seria 633; o resultado correto é 644.
    expect(toOctalString(applyUmask("033", "file"))).toBe("644");
    expect(() => applyUmask("999", "file")).toThrow();
  });
});
