import type { Route } from "next";

const DEFAULT_SITE_URL = "https://blog.leonardosaads.com.br";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const site = {
  name: "Leonardo Saads",
  title: "Leonardo Saads — Engenharia, Telecomunicações e Software",
  tagline: "Engenharia · Telecomunicações · Software",
  description:
    "Ensaios técnicos e interativos sobre telecomunicações ópticas, infraestrutura, segurança e software — com figuras interativas, código executável e referências bibliográficas.",
  url: resolveSiteUrl(),
  locale: "pt-BR",
  author: {
    name: "Leonardo Saads Pinto",
    /** Forma usada em referências ABNT ("SOBRENOME, Prenome"). */
    citationName: "Pinto, Leonardo Saads",
    shortName: "Leonardo Saads",
    role: "Engenheiro de Telecomunicações · DevOps · Observabilidade",
    email: "leonardospinto@hotmail.com",
    github: "https://github.com/leonardoSaaads",
    linkedin: "https://www.linkedin.com/in/leonardo-saads-pinto-5a61731b4/",
  },
  repository: "https://github.com/leonardoSaaads/blog-devsecops",
  giscus: {
    repo: "leonardoSaaads/blog-devsecops",
    repoId: "R_kgDOP7RkyQ",
    category: "General",
    categoryId: "DIC_kwDOP7Rkyc4CwLqY",
  },
} as const;

export interface NavItem {
  label: string;
  href: Route;
}

export const mainNav: NavItem[] = [
  { label: "Artigos", href: "/blog" },
  { label: "Tópicos", href: "/tags" },
  { label: "Projetos", href: "/projects" },
  { label: "Sobre", href: "/about" },
];

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}
