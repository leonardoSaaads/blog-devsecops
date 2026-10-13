import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GithubIcon } from "@/components/icons/brand-icons";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Projetos open source de infraestrutura, observabilidade e automação.",
  alternates: { canonical: "/projects" },
};

interface Project {
  name: string;
  description: string;
  stack: string[];
  repository?: string;
  /** Slug do artigo relacionado no blog. */
  article?: string;
}

const PROJECTS: Project[] = [
  {
    name: "blog-devsecops",
    description:
      "Este blog: Next.js 16 com renderização estática, MDX validado por esquema, laboratórios interativos (simuladores e execução de código em Web Workers), loja 3D com three.js, CSP restritiva e testes E2E.",
    stack: ["Next.js", "TypeScript", "MDX", "three.js", "Playwright"],
    repository: site.repository,
    article: "bastidores-do-blog",
  },
  {
    name: "zabbix-docker",
    description:
      "Deploy do Zabbix com Docker Compose em um único comando, com volumes persistentes e configuração por variáveis de ambiente.",
    stack: ["Zabbix", "Docker Compose", "Bash", "SNMP"],
    repository: "https://github.com/leonardoSaaads/zabbix-docker",
    article: "deploy-zabbix-em-minutos",
  },
  {
    name: "homeserver-stack",
    description:
      "Stack de observabilidade para homelab: Node Exporter, Prometheus e Grafana provisionados como código e publicados com Cloudflare Tunnel.",
    stack: ["Prometheus", "Grafana", "Node Exporter", "Cloudflare Tunnel"],
    article: "monitoramento-homeserver",
  },
];

export default function ProjectsPage() {
  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Open source"
        title="Projetos"
        description="Ferramentas e stacks que uso — e documento — no dia a dia."
      />
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <li
            key={project.name}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-accent"
          >
            <h2 className="font-mono text-lg font-semibold">{project.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{project.description}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tecnologias">
              {project.stack.map((item) => (
                <li key={item} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
              {project.repository && (
                <a
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent-strong hover:underline"
                >
                  <GithubIcon className="size-4" /> Código{" "}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
              {project.article && (
                <Link
                  href={`/blog/${project.article}`}
                  className="inline-flex items-center gap-1.5 text-accent-strong hover:underline"
                >
                  <BookOpen className="size-4" aria-hidden="true" /> Artigo
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
