/**
 * Árvore MIB simplificada (SNMPv2-MIB, IF-MIB, HOST-RESOURCES-MIB) com valores
 * ilustrativos de um agente SNMP em Linux embarcado — base da figura de OIDs.
 */

export type SnmpType =
  "STRING" | "OID" | "Timeticks" | "INTEGER" | "Counter32" | "Counter64" | "Gauge32";

export interface MibNode {
  /** Sub-identificador relativo ao pai. */
  id: number;
  name: string;
  module?: string;
  description: string;
  /** Folhas: tipo SNMP e instâncias (".0" para escalares; índice para colunas de tabela). */
  type?: SnmpType;
  instances?: Array<{ index: string; value: string | number; label?: string }>;
  children?: MibNode[];
}

const scalar = (value: string | number) => [{ index: "0", value }];

export const MIB_ROOT: MibNode = {
  id: 1,
  name: "iso",
  description: "Raiz administrada pela ISO.",
  children: [
    {
      id: 3,
      name: "org",
      description: "Organizações reconhecidas.",
      children: [
        {
          id: 6,
          name: "dod",
          description: "Departamento de Defesa dos EUA (origem da Internet).",
          children: [
            {
              id: 1,
              name: "internet",
              description: "Sub-árvore da Internet (RFC 1155).",
              children: [
                {
                  id: 2,
                  name: "mgmt",
                  description: "Objetos padronizados pela IETF.",
                  children: [
                    {
                      id: 1,
                      name: "mib-2",
                      description:
                        "MIB-II (RFC 1213): o conjunto básico que quase todo agente implementa.",
                      children: [
                        {
                          id: 1,
                          name: "system",
                          module: "SNMPv2-MIB",
                          description: "Identificação do equipamento.",
                          children: [
                            {
                              id: 1,
                              name: "sysDescr",
                              module: "SNMPv2-MIB",
                              type: "STRING",
                              description: "Descrição textual: hardware, sistema e versão.",
                              instances: scalar("Linux dvr 4.9.37 armv7l"),
                            },
                            {
                              id: 2,
                              name: "sysObjectID",
                              module: "SNMPv2-MIB",
                              type: "OID",
                              description:
                                "Identificador do modelo, sob a sub-árvore do fabricante (enterprises).",
                              instances: scalar("NET-SNMP-MIB::netSnmpAgentOIDs.10"),
                            },
                            {
                              id: 3,
                              name: "sysUpTime",
                              module: "SNMPv2-MIB",
                              type: "Timeticks",
                              description:
                                "Tempo desde a inicialização do agente, em centésimos de segundo.",
                              instances: scalar(123456789),
                            },
                            {
                              id: 4,
                              name: "sysContact",
                              module: "SNMPv2-MIB",
                              type: "STRING",
                              description: "Responsável pelo equipamento.",
                              instances: scalar("noc@example.com"),
                            },
                            {
                              id: 5,
                              name: "sysName",
                              module: "SNMPv2-MIB",
                              type: "STRING",
                              description: "Nome administrativo (geralmente o hostname).",
                              instances: scalar("dvr-recepcao"),
                            },
                            {
                              id: 6,
                              name: "sysLocation",
                              module: "SNMPv2-MIB",
                              type: "STRING",
                              description: "Localização física.",
                              instances: scalar("Rack 1 — Recepção"),
                            },
                          ],
                        },
                        {
                          id: 2,
                          name: "interfaces",
                          module: "IF-MIB",
                          description: "Interfaces de rede.",
                          children: [
                            {
                              id: 1,
                              name: "ifNumber",
                              module: "IF-MIB",
                              type: "INTEGER",
                              description: "Quantidade de interfaces.",
                              instances: scalar(2),
                            },
                            {
                              id: 2,
                              name: "ifTable",
                              module: "IF-MIB",
                              description:
                                "Tabela de interfaces: cada coluna é um OID; cada linha, um índice (ifIndex).",
                              children: [
                                {
                                  id: 1,
                                  name: "ifEntry",
                                  module: "IF-MIB",
                                  description: "Linha da tabela (uma por interface).",
                                  children: [
                                    {
                                      id: 2,
                                      name: "ifDescr",
                                      module: "IF-MIB",
                                      type: "STRING",
                                      description: "Nome da interface.",
                                      instances: [
                                        { index: "1", value: "lo" },
                                        { index: "2", value: "eth0" },
                                      ],
                                    },
                                    {
                                      id: 8,
                                      name: "ifOperStatus",
                                      module: "IF-MIB",
                                      type: "INTEGER",
                                      description:
                                        "Estado operacional: up(1), down(2), testing(3)…",
                                      instances: [
                                        { index: "1", value: 1, label: "up" },
                                        { index: "2", value: 1, label: "up" },
                                      ],
                                    },
                                    {
                                      id: 10,
                                      name: "ifInOctets",
                                      module: "IF-MIB",
                                      type: "Counter32",
                                      description:
                                        "Bytes recebidos. Contador de 32 bits: a 1 Gb/s dá a volta em ~34 s.",
                                      instances: [
                                        { index: "1", value: 48213 },
                                        { index: "2", value: 3912447810 },
                                      ],
                                    },
                                    {
                                      id: 16,
                                      name: "ifOutOctets",
                                      module: "IF-MIB",
                                      type: "Counter32",
                                      description: "Bytes enviados (32 bits).",
                                      instances: [
                                        { index: "1", value: 48213 },
                                        { index: "2", value: 2203918442 },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: 25,
                          name: "host",
                          module: "HOST-RESOURCES-MIB",
                          description: "Recursos do host (RFC 2790): CPU, memória, armazenamento.",
                          children: [
                            {
                              id: 3,
                              name: "hrDevice",
                              module: "HOST-RESOURCES-MIB",
                              description: "Dispositivos do host.",
                              children: [
                                {
                                  id: 3,
                                  name: "hrProcessorTable",
                                  module: "HOST-RESOURCES-MIB",
                                  description: "Tabela de processadores.",
                                  children: [
                                    {
                                      id: 1,
                                      name: "hrProcessorEntry",
                                      module: "HOST-RESOURCES-MIB",
                                      description: "Linha por núcleo.",
                                      children: [
                                        {
                                          id: 2,
                                          name: "hrProcessorLoad",
                                          module: "HOST-RESOURCES-MIB",
                                          type: "INTEGER",
                                          description:
                                            "Carga média do núcleo no último minuto (%).",
                                          instances: [
                                            { index: "196608", value: 37 },
                                            { index: "196609", value: 22 },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: 31,
                          name: "ifMIB",
                          module: "IF-MIB",
                          description: "Extensões da IF-MIB (RFC 2863).",
                          children: [
                            {
                              id: 1,
                              name: "ifMIBObjects",
                              module: "IF-MIB",
                              description: "Objetos estendidos.",
                              children: [
                                {
                                  id: 1,
                                  name: "ifXTable",
                                  module: "IF-MIB",
                                  description: "Tabela estendida de interfaces.",
                                  children: [
                                    {
                                      id: 1,
                                      name: "ifXEntry",
                                      module: "IF-MIB",
                                      description: "Linha por interface.",
                                      children: [
                                        {
                                          id: 6,
                                          name: "ifHCInOctets",
                                          module: "IF-MIB",
                                          type: "Counter64",
                                          description:
                                            "Bytes recebidos em 64 bits (High Capacity): prefira-o em enlaces ≥ 100 Mb/s.",
                                          instances: [
                                            { index: "1", value: 48213 },
                                            { index: "2", value: 912384771234 },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 4,
                  name: "private",
                  description: "Objetos privados.",
                  children: [
                    {
                      id: 1,
                      name: "enterprises",
                      description:
                        "Cada fabricante recebe da IANA um Private Enterprise Number (PEN) e define aqui as suas MIBs.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export interface MibEntry {
  oid: string;
  path: string[];
  node: MibNode;
}

/** Percorre a árvore devolvendo cada nó com o OID numérico completo. */
export function flattenMib(root: MibNode = MIB_ROOT): MibEntry[] {
  const out: MibEntry[] = [];
  const visit = (node: MibNode, prefix: string, path: string[]) => {
    const oid = prefix ? `${prefix}.${node.id}` : String(node.id);
    const names = [...path, node.name];
    out.push({ oid, path: names, node });
    node.children?.forEach((child) => visit(child, oid, names));
  };
  visit(root, "", []);
  return out;
}

export function compareOid(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let index = 0; index < Math.min(pa.length, pb.length); index += 1) {
    if (pa[index] !== pb[index]) return pa[index]! - pb[index]!;
  }
  return pa.length - pb.length;
}

export interface VarBind {
  oid: string;
  name: string;
  type: SnmpType;
  value: string | number;
  label?: string;
}

/** Todas as instâncias (folhas consultáveis), em ordem lexicográfica de OID. */
export function instances(root: MibNode = MIB_ROOT): VarBind[] {
  return flattenMib(root)
    .flatMap(({ oid, node }) =>
      (node.instances ?? []).map((instance) => ({
        oid: `${oid}.${instance.index}`,
        name: `${node.module ?? "SNMPv2-SMI"}::${node.name}.${instance.index}`,
        type: node.type!,
        value: instance.value,
        label: instance.label,
      })),
    )
    .sort((a, b) => compareOid(a.oid, b.oid));
}

/** GetNext: primeira instância estritamente após o OID informado. */
export function getNext(oid: string, all: VarBind[] = instances()): VarBind | undefined {
  return all.find((bind) => compareOid(bind.oid, oid) > 0);
}

/** snmpwalk = GetNext repetido enquanto o resultado estiver sob o prefixo. */
export function walk(prefix: string, all: VarBind[] = instances()): VarBind[] {
  const result: VarBind[] = [];
  let cursor = getNext(prefix, all);
  while (cursor && (cursor.oid === prefix || cursor.oid.startsWith(`${prefix}.`))) {
    result.push(cursor);
    cursor = getNext(cursor.oid, all);
  }
  return result;
}

/** Timeticks no formato do Net-SNMP: "(123456789) 14 days, 6:56:07.89". */
export function formatTimeticks(ticks: number): string {
  const totalSeconds = Math.floor(ticks / 100);
  const hundredths = ticks % 100;
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `(${ticks}) ${days} days, ${hours}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

export function formatVarBind(bind: VarBind): string {
  const value =
    bind.type === "STRING"
      ? `"${bind.value}"`
      : bind.type === "Timeticks"
        ? formatTimeticks(Number(bind.value))
        : bind.label
          ? `${bind.label}(${bind.value})`
          : String(bind.value);
  return `${bind.name} = ${bind.type}: ${value}`;
}

/** Tempo até um contador de `bits` dar a volta a uma taxa em bits/s. */
export function counterWrapSeconds(bits: 32 | 64, bitsPerSecond: number): number {
  return (2 ** bits * 8) / bitsPerSecond;
}
