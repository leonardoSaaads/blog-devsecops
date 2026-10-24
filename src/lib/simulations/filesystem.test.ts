import { describe, expect, it } from "vitest";
import { ancestors, findFsNode, flattenFs } from "./filesystem";

describe("directory hierarchy", () => {
  it("paths are unique and well formed", () => {
    const entries = flattenFs();
    expect(new Set(entries.map((entry) => entry.path)).size).toBe(entries.length);
    expect(entries.every((entry) => entry.path === "/" || /^(\/[a-z_]+)+$/.test(entry.path))).toBe(
      true,
    );
    expect(entries.every((entry) => entry.node.summary.length > 10)).toBe(true);
  });

  it("finds nodes and flags virtual filesystems", () => {
    expect(findFsNode("/etc/ssh/sshd_config")?.security).toMatch(/PermitRootLogin/);
    expect(findFsNode("/proc")?.virtual).toBe(true);
    expect(findFsNode("/bin")?.link).toBe("usr/bin");
    expect(findFsNode("/does-not-exist")).toBeUndefined();
  });

  it("lists ancestors from the root down to the path", () => {
    expect(ancestors("/etc/ssh")).toEqual(["/", "/etc", "/etc/ssh"]);
    expect(ancestors("/")).toEqual(["/"]);
  });
});
