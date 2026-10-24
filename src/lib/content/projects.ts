import type { Motif } from "@/lib/art/types";
import { site } from "@/config/site";

export interface Project {
  name: string;
  description: string;
  stack: string[];
  repository?: string;
  /** Slug do artigo relacionado no blog. */
  article?: string;
  art: Motif;
}

export const PROJECTS: Project[] = [
  {
    name: "blog-devsecops",
    description:
      "Este blog: Next.js 16 com renderização estática, MDX validado por esquema, figuras interativas (simuladores, modelo 3D e execução de código em Web Workers), arte generativa, CSP restritiva e testes E2E.",
    stack: ["Next.js", "TypeScript", "MDX", "three.js", "Playwright"],
    repository: site.repository,
    article: "bastidores-do-blog",
    art: "circuit",
  },
  {
    name: "zabbix-docker",
    description:
      "Deploy do Zabbix com Docker Compose em um único comando, com volumes persistentes e configuração por variáveis de ambiente.",
    stack: ["Zabbix", "Docker Compose", "Bash", "SNMP"],
    repository: "https://github.com/leonardoSaaads/zabbix-docker",
    article: "deploy-zabbix-em-minutos",
    art: "radar",
  },
  {
    name: "homeserver-stack",
    description:
      "Stack de observabilidade para homelab: Node Exporter, Prometheus e Grafana provisionados como código e publicados com Cloudflare Tunnel.",
    stack: ["Prometheus", "Grafana", "Node Exporter", "Cloudflare Tunnel"],
    article: "monitoramento-homeserver",
    art: "ridgeline",
  },
];
