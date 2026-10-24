import type { Motif } from "@/lib/art/types";
import { site } from "@/config/site";

export interface Project {
  name: string;
  description: string;
  stack: string[];
  repository?: string;
  /** Slug of the related blog article. */
  article?: string;
  art: Motif;
}

export const PROJECTS: Project[] = [
  {
    name: "blog-devsecops",
    description:
      "This blog: a statically exported Next.js 16 site with schema-validated MDX, interactive figures (simulators and a 3D fiber model), generative art, a strict CSP and end-to-end tests.",
    stack: ["Next.js", "TypeScript", "MDX", "three.js", "Playwright"],
    repository: site.repository,
    art: "circuit",
  },
  {
    name: "zabbix-docker",
    description:
      "One-command Zabbix deployment with Docker Compose, persistent volumes and configuration through environment variables.",
    stack: ["Zabbix", "Docker Compose", "Bash", "SNMP"],
    repository: "https://github.com/leonardoSaaads/zabbix-docker",
    art: "radar",
  },
];
