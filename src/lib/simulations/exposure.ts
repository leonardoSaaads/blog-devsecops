/**
 * Avalia a superfície de exposição de um serviço em contêiner num servidor com IP público.
 * Ponto didático central: portas publicadas pelo Docker não passam pelas regras do UFW.
 */

export interface ExposureConfig {
  /** `ports:` do Compose: nenhuma, 127.0.0.1:9090:9090 ou 9090:9090 (todas as interfaces). */
  publish: "none" | "localhost" | "all";
  ufw: boolean;
  tunnel: boolean;
  access: boolean;
}

export interface ExposurePath {
  id: "direct" | "tunnel";
  label: string;
  reachable: boolean;
  authenticated: boolean;
  note: string;
}

export interface ExposureReport {
  paths: ExposurePath[];
  inboundPorts: string[];
  verdict: "isolado" | "protegido" | "exposto";
  findings: string[];
}

export const SECURE_PRESET: ExposureConfig = {
  publish: "none",
  ufw: true,
  tunnel: true,
  access: true,
};

export function assessExposure(config: ExposureConfig): ExposureReport {
  const findings: string[] = [];
  const direct: ExposurePath = {
    id: "direct",
    label: "Internet → IP público:9090",
    reachable: config.publish === "all",
    authenticated: false,
    note:
      config.publish === "all"
        ? "Qualquer pessoa alcança o Prometheus diretamente pelo IP — e ele não tem autenticação."
        : config.publish === "localhost"
          ? "Porta ligada a 127.0.0.1: só processos do próprio host conectam."
          : "Nenhuma porta publicada: o contêiner só é acessível pela rede interna do Docker.",
  };
  if (config.publish === "all" && config.ufw) {
    findings.push(
      "O UFW não protege portas publicadas pelo Docker: as regras de NAT/FORWARD do Docker são avaliadas antes das regras de INPUT do UFW.",
    );
  }
  if (config.publish === "all")
    findings.push(
      "Varreduras automatizadas encontram portas abertas em minutos após a publicação.",
    );

  const tunnel: ExposurePath = {
    id: "tunnel",
    label: "Internet → borda da Cloudflare → túnel",
    reachable: config.tunnel,
    authenticated: config.tunnel && config.access,
    note: !config.tunnel
      ? "Sem túnel: não há rota pela borda."
      : config.access
        ? "O acesso exige identidade (SSO/OTP) na borda antes de chegar ao túnel."
        : "O hostname público responde a qualquer um: o túnel não autentica por si só.",
  };
  if (config.tunnel && !config.access) {
    findings.push(
      "Túnel sem Cloudflare Access é apenas um proxy reverso público: adicione uma política de acesso.",
    );
  }
  if (config.tunnel)
    findings.push(
      "O cloudflared só abre conexões de saída (porta 7844): nenhuma porta de entrada é necessária.",
    );
  if (!config.ufw)
    findings.push(
      "Firewall do host desligado: serviços que escutam em 0.0.0.0 fora do Docker (ex.: SSH) ficam expostos.",
    );

  const paths = [direct, tunnel];
  const reachable = paths.filter((path) => path.reachable);
  const verdict = reachable.some((path) => !path.authenticated)
    ? "exposto"
    : reachable.length > 0
      ? "protegido"
      : "isolado";
  if (verdict === "isolado")
    findings.push("Seguro, porém inacessível de fora: útil apenas na rede local.");

  return {
    paths,
    inboundPorts: config.publish === "all" ? ["9090/tcp"] : [],
    verdict,
    findings,
  };
}
