import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand-icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Sobre ${site.author.name}: engenharia de telecomunicações, DevOps e observabilidade.`,
  alternates: { canonical: "/about" },
};

const SKILLS = [
  "Docker",
  "Kubernetes (k3s)",
  "Prometheus",
  "Grafana",
  "Zabbix",
  "Linux",
  "Python",
  "DWDM/OTN",
  "Processamento de sinais",
  "Machine learning",
];

export default function AboutPage() {
  const links = [
    { label: "E-mail", href: `mailto:${site.author.email}`, icon: Mail },
    { label: "GitHub", href: site.author.github, icon: GithubIcon },
    { label: "LinkedIn", href: site.author.linkedin, icon: LinkedinIcon },
  ];

  return (
    <div className="container-page py-12">
      <div className="grid gap-12 md:grid-cols-[18rem_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="relative mx-auto size-48 overflow-hidden rounded-full border-4 border-accent/60 md:mx-0">
            <Image
              src="/profile-image.jpg"
              alt={`Foto de ${site.author.name}`}
              fill
              sizes="12rem"
              className="object-cover"
              preload
            />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">
            {site.author.name}
          </h1>
          <p className="mt-1 text-muted-foreground">{site.author.role}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Universidade Federal do Rio Grande do Norte (UFRN)
          </p>
          <ul className="mt-5 flex gap-2">
            {links.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer me" }
                    : {})}
                  className="grid size-10 place-items-center rounded-xl border border-border transition hover:border-accent hover:text-accent"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="prose prose-lg max-w-none font-serif dark:prose-invert prose-headings:font-serif prose-headings:font-semibold">
          <h2>Quem escreve</h2>
          <p>
            Leonardo Saads Pinto é engenheiro de telecomunicações e desenvolvedor de pesquisa, com
            foco em sistemas de observabilidade, engenharia de RF e automação de processos.
          </p>
          <p>
            Contribui com iniciativas de monitoramento do espectro em âmbito nacional na ANATEL,
            lidera operações de DevOps e NOC na MW Solutions e conduz pesquisa aplicada em machine
            learning para sistemas ópticos coerentes.
          </p>
          <p>
            Seu repertório técnico inclui infraestrutura baseada em Docker, processamento de sinais
            e observabilidade de ponta a ponta com Grafana, Zabbix e Prometheus. Nas horas vagas,
            depura scripts em Python e ajuda colegas com equações diferenciais.
          </p>
          <h2>Sobre este blog</h2>
          <p>
            Os textos seguem as convenções de uma publicação técnica — resumo, figuras e equações
            numeradas, notas de margem e referências no padrão ABNT — com uma diferença: as figuras
            são interativas. Você pode simular, executar e quebrar o que está lendo sem sair do
            artigo. Comece pelos <Link href="/blog">artigos</Link> ou pelos{" "}
            <Link href="/tags">tópicos</Link>.
          </p>
          <h2>Competências</h2>
          <ul className="not-prose flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
