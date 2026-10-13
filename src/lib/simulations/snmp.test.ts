import { describe, expect, it } from "vitest";
import {
  compareOid,
  counterWrapSeconds,
  flattenMib,
  formatTimeticks,
  formatVarBind,
  getNext,
  instances,
  walk,
} from "./snmp";

describe("SNMP / MIB", () => {
  it("OIDs são únicos e a sub-árvore system está no lugar certo", () => {
    const entries = flattenMib();
    expect(new Set(entries.map((entry) => entry.oid)).size).toBe(entries.length);
    expect(entries.find((entry) => entry.node.name === "system")?.oid).toBe("1.3.6.1.2.1.1");
    expect(entries.find((entry) => entry.node.name === "sysName")?.oid).toBe("1.3.6.1.2.1.1.5");
  });

  it("ordem lexicográfica numérica (10 vem depois de 9)", () => {
    expect(compareOid("1.3.6.1.2.1.1.10", "1.3.6.1.2.1.1.9")).toBeGreaterThan(0);
    expect(compareOid("1.3.6.1.2.1.1", "1.3.6.1.2.1.1.0")).toBeLessThan(0);
    const all = instances();
    expect(all.map((bind) => bind.oid)).toEqual([...all.map((bind) => bind.oid)].sort(compareOid));
  });

  it("GetNext e walk percorrem a sub-árvore system em ordem", () => {
    expect(getNext("1.3.6.1.2.1.1")?.name).toBe("SNMPv2-MIB::sysDescr.0");
    const names = walk("1.3.6.1.2.1.1").map((bind) => bind.name.split("::")[1]);
    expect(names).toEqual([
      "sysDescr.0",
      "sysObjectID.0",
      "sysUpTime.0",
      "sysContact.0",
      "sysName.0",
      "sysLocation.0",
    ]);
    expect(walk("1.3.6.1.2.1.2.2.1.2").map((bind) => bind.oid)).toEqual([
      "1.3.6.1.2.1.2.2.1.2.1",
      "1.3.6.1.2.1.2.2.1.2.2",
    ]);
  });

  it("formata valores como o Net-SNMP", () => {
    expect(formatTimeticks(123456789)).toBe("(123456789) 14 days, 6:56:07.89");
    const status = walk("1.3.6.1.2.1.2.2.1.8")[0]!;
    expect(formatVarBind(status)).toBe("IF-MIB::ifOperStatus.1 = INTEGER: up(1)");
  });

  it("contador de 32 bits dá a volta em ~34 s a 1 Gb/s", () => {
    expect(counterWrapSeconds(32, 1e9)).toBeCloseTo(34.36, 1);
    expect(counterWrapSeconds(64, 100e9) / (365 * 86_400)).toBeGreaterThan(40);
  });
});
