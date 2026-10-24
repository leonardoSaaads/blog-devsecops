"use client";

import { ChevronRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MIB_ROOT, flattenMib, formatVarBind, walk, type MibNode } from "@/lib/simulations/snmp";
import { InteractiveFigure, primaryButton } from "./interactive-figure";

const ENTRIES = flattenMib();
const AGENT = "192.0.2.10"; // faixa de documentação (RFC 5737)
const SNMP_V3 = "-v3 -l authPriv -u zabbix -a SHA-256 -A '***' -x AES -X '***'";

function MibTreeNode({
  node,
  oid,
  depth,
  selected,
  onSelect,
}: {
  node: MibNode;
  oid: string;
  depth: number;
  selected: string;
  onSelect: (oid: string) => void;
}) {
  const open = selected === oid || selected.startsWith(`${oid}.`);
  const hasChildren = Boolean(node.children?.length);
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(oid)}
        aria-current={selected === oid ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        className={cn(
          "flex w-full items-baseline gap-1.5 rounded-md py-0.5 pr-2 text-left text-[13px] transition",
          selected === oid
            ? "bg-accent-soft text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        style={{ paddingLeft: `${0.3 + depth * 0.75}rem` }}
      >
        <ChevronRight
          className={cn(
            "size-3 shrink-0 self-center transition",
            !hasChildren && "invisible",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
        <span className={cn("font-medium", node.type && "text-accent-strong")}>{node.name}</span>
        <span className="font-mono text-[11px] opacity-70">({node.id})</span>
      </button>
      {hasChildren && open && (
        <ul>
          {node.children!.map((child) => (
            <MibTreeNode
              key={child.id}
              node={child}
              oid={`${oid}.${child.id}`}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MibExplorer() {
  const [selected, setSelected] = useState("1.3.6.1.2.1.1.5");
  const [walkStep, setWalkStep] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);
  const entry = ENTRIES.find((item) => item.oid === selected) ?? ENTRIES[0]!;
  const results = walk(selected);
  const isLeaf = Boolean(entry.node.type);
  const shown = walkStep === null ? [] : results.slice(0, walkStep);

  const select = (oid: string) => {
    clearTimers();
    setSelected(oid);
    setWalkStep(null);
  };

  const runWalk = () => {
    clearTimers();
    setWalkStep(0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setWalkStep(results.length);
      return;
    }
    timers.current = results.map((_, index) =>
      window.setTimeout(() => setWalkStep(index + 1), 220 * (index + 1)),
    );
  };

  const command = isLeaf
    ? `snmpget ${SNMP_V3} ${AGENT} ${selected}.${entry.node.instances?.[0]?.index ?? "0"}`
    : `snmpwalk ${SNMP_V3} ${AGENT} ${selected}`;

  return (
    <InteractiveFigure
      title="A árvore de OIDs do SNMP"
      description="Cada objeto gerenciável tem um endereço numérico único. Navegue de iso(1) até as folhas e execute um walk: ele é apenas uma sequência de GetNext em ordem lexicográfica. Valores ilustrativos de um agente Linux embarcado."
      testId="mib-explorer"
    >
      <div className="grid gap-5 md:grid-cols-[17rem_minmax(0,1fr)]">
        <nav
          aria-label="Árvore MIB"
          className="max-h-[26rem] overflow-y-auto rounded-xl border border-border bg-background p-2"
        >
          <ul>
            <MibTreeNode node={MIB_ROOT} oid="1" depth={0} selected={selected} onSelect={select} />
          </ul>
        </nav>

        <div className="min-w-0 space-y-4">
          <div>
            <p className="smallcaps text-xs text-muted-foreground">{entry.node.module ?? "SMI"}</p>
            <p className="font-mono text-lg font-semibold break-all" data-testid="mib-oid">
              {selected}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground break-all">
              {entry.path.join(".")}
            </p>
          </div>
          <p className="font-serif text-[1.05rem] leading-relaxed">{entry.node.description}</p>
          {entry.node.type && (
            <p className="text-sm">
              Tipo:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {entry.node.type}
              </code>
              {entry.node.instances?.length === 1
                ? " · escalar (instância .0)"
                : ` · coluna de tabela (${entry.node.instances?.length} linhas)`}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/60 px-3 py-2">
              <code className="min-w-0 font-mono text-xs leading-relaxed [overflow-wrap:anywhere]">
                $ {command}
              </code>
              <button
                type="button"
                className={cn(primaryButton, "shrink-0")}
                onClick={runWalk}
                disabled={results.length === 0}
                data-testid="mib-walk"
              >
                <Play className="size-3.5" aria-hidden="true" /> {isLeaf ? "Consultar" : "Walk"}
              </button>
            </div>
            <pre
              className="min-h-24 overflow-x-auto bg-code p-3 font-mono text-xs leading-relaxed"
              aria-live="polite"
              data-testid="mib-output"
            >
              {walkStep === null ? (
                <span className="text-muted-foreground">
                  {results.length === 0
                    ? "Sub-árvore sem objetos implementados neste agente."
                    : `${results.length} objeto(s) sob este OID.`}
                </span>
              ) : (
                shown.map((bind) => <div key={bind.oid}>{formatVarBind(bind)}</div>)
              )}
            </pre>
          </div>
        </div>
      </div>
    </InteractiveFigure>
  );
}
