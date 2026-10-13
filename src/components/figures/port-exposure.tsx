"use client";

import { Cloud, Globe, Lock, Server, ShieldCheck, ShieldOff, Unlock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/format";
import { SECURE_PRESET, assessExposure, type ExposureConfig } from "@/lib/simulations/exposure";
import { InteractiveFigure, controlButton, controlToggle } from "./interactive-figure";

const PUBLISH = [
  { value: "all", label: '"9090:9090"', hint: "todas as interfaces" },
  { value: "localhost", label: '"127.0.0.1:9090:9090"', hint: "só local" },
  { value: "none", label: "sem ports:", hint: "rede interna" },
] as const;

const VERDICT = {
  exposto: {
    label: "Exposto sem autenticação",
    className: "border-danger/50 bg-danger/5 text-danger",
    icon: Unlock,
  },
  protegido: {
    label: "Acessível com autenticação na borda",
    className: "border-success/50 bg-success/5 text-success",
    icon: ShieldCheck,
  },
  isolado: {
    label: "Isolado (inacessível de fora)",
    className: "border-border bg-muted text-muted-foreground",
    icon: Lock,
  },
} as const;

function Hop({
  icon: Icon,
  label,
  active,
  danger,
}: {
  icon: typeof Globe;
  label: string;
  active: boolean;
  danger?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex flex-col items-center gap-1 text-center text-xs",
        active ? "text-foreground" : "text-muted-foreground/60",
      )}
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl border",
          active
            ? danger
              ? "border-danger bg-danger/10 text-danger"
              : "border-accent bg-accent-soft text-accent-strong"
            : "border-border",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      {label}
    </span>
  );
}

function Wire({ active, danger }: { active: boolean; danger?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-5 h-0.5 flex-1",
        active
          ? danger
            ? "bg-danger"
            : "bg-accent"
          : "bg-border [background-image:linear-gradient(90deg,var(--border)_50%,transparent_50%)] [background-size:8px_2px]",
      )}
    />
  );
}

export function PortExposure() {
  const [config, setConfig] = useState<ExposureConfig>({
    publish: "all",
    ufw: true,
    tunnel: false,
    access: false,
  });
  const report = assessExposure(config);
  const verdict = VERDICT[report.verdict];
  const VerdictIcon = verdict.icon;
  const set = (patch: Partial<ExposureConfig>) =>
    setConfig((current) => ({ ...current, ...patch }));
  const direct = report.paths.find((path) => path.id === "direct")!;
  const tunnel = report.paths.find((path) => path.id === "tunnel")!;

  return (
    <InteractiveFigure
      title="Superfície de exposição de um serviço em contêiner"
      description="Um Prometheus (sem autenticação) num servidor com IP público. Combine a publicação de portas, o firewall e o túnel e veja quais caminhos chegam ao serviço."
      testId="port-exposure"
      actions={
        <button type="button" className={controlButton} onClick={() => setConfig(SECURE_PRESET)}>
          <ShieldCheck className="size-4" aria-hidden="true" /> Configuração recomendada
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Publicação de porta no compose.yaml
            </legend>
            <div className="flex flex-col gap-2">
              {PUBLISH.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={config.publish === option.value}
                  onClick={() => set({ publish: option.value })}
                  className={controlToggle(config.publish === option.value, "justify-between")}
                >
                  <code className="font-mono text-xs">{option.label}</code>
                  <span className="text-xs text-muted-foreground">{option.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.ufw}
                onChange={(event) => set({ ufw: event.target.checked })}
                className="size-4 accent-[var(--accent)]"
              />
              UFW ativo (<code className="font-mono text-xs">default deny incoming</code>)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.tunnel}
                onChange={(event) =>
                  set({
                    tunnel: event.target.checked,
                    access: event.target.checked && config.access,
                  })
                }
                className="size-4 accent-[var(--accent)]"
                data-testid="exposure-tunnel"
              />
              Cloudflare Tunnel (cloudflared)
            </label>
            <label className={cn("flex items-center gap-2", !config.tunnel && "opacity-50")}>
              <input
                type="checkbox"
                checked={config.access}
                disabled={!config.tunnel}
                onChange={(event) => set({ access: event.target.checked })}
                className="size-4 accent-[var(--accent)]"
                data-testid="exposure-access"
              />
              Cloudflare Access (SSO/OTP na borda)
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <p
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold",
              verdict.className,
            )}
            data-testid="exposure-verdict"
            aria-live="polite"
          >
            <VerdictIcon className="size-5" aria-hidden="true" /> {verdict.label}
          </p>

          {[direct, tunnel].map((path) => (
            <div key={path.id} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">{path.label}</p>
              <div className="mt-3 flex items-start gap-1" aria-hidden="true">
                <Hop
                  icon={Globe}
                  label="Internet"
                  active={path.reachable}
                  danger={path.reachable && !path.authenticated}
                />
                <Wire active={path.reachable} danger={path.reachable && !path.authenticated} />
                {path.id === "tunnel" && (
                  <>
                    <Hop
                      icon={config.access ? ShieldCheck : Cloud}
                      label={config.access ? "Access" : "Borda"}
                      active={path.reachable}
                      danger={path.reachable && !path.authenticated}
                    />
                    <Wire active={path.reachable} danger={path.reachable && !path.authenticated} />
                  </>
                )}
                {path.id === "direct" && (
                  <>
                    <Hop
                      icon={config.ufw ? ShieldOff : Unlock}
                      label={
                        config.ufw ? (path.reachable ? "UFW (contornado)" : "UFW") : "sem firewall"
                      }
                      active={path.reachable}
                      danger={path.reachable}
                    />
                    <Wire active={path.reachable} danger={path.reachable} />
                  </>
                )}
                <Hop
                  icon={Server}
                  label="Prometheus"
                  active={path.reachable}
                  danger={path.reachable && !path.authenticated}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{path.note}</p>
            </div>
          ))}

          <p className="text-sm">
            <span className="font-medium">Portas de entrada abertas no host: </span>
            <span className="font-mono">
              {report.inboundPorts.length > 0 ? report.inboundPorts.join(", ") : "nenhuma"}
            </span>
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {report.findings.map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        </div>
      </div>
    </InteractiveFigure>
  );
}
