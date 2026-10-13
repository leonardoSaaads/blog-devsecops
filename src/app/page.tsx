import { ArrowRight, BookMarked, MousePointerClick, NotebookPen, Sigma } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CoverArt } from "@/components/art/cover-art";
import { PostCard } from "@/components/blog/post-card";
import { CATEGORIES, CATEGORY_IDS } from "@/lib/content/categories";
import { getAllPosts } from "@/lib/content/posts";
import { site } from "@/lib/site";

const READING_GUIDE = [
  {
    icon: MousePointerClick,
    title: "Figuras interativas",
    text: "Simuladores, calculadoras e código executável aparecem no próprio texto, numerados como figuras de um artigo científico.",
  },
  {
    icon: NotebookPen,
    title: "Notas de margem e glossário",
    text: "Comentários laterais e termos com definição em balão — o aprofundamento fica a um passar de mouse.",
  },
  {
    icon: Sigma,
    title: "Equações numeradas",
    text: "Fórmulas tipografadas com KaTeX e referenciadas no texto, como em uma publicação técnica.",
  },
  {
    icon: BookMarked,
    title: "Referências em ABNT",
    text: "Toda afirmação relevante aponta para a fonte. Cada artigo traz a citação pronta para o seu trabalho.",
  },
];

export default function HomePage() {
  const posts = getAllPosts();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const recent = posts.filter((post) => post.slug !== featured?.slug).slice(0, 6);
  const references = posts.reduce((sum, post) => sum + post.references.length, 0);
  const figures = posts.reduce((sum, post) => sum + post.figures, 0);

  const stats = [
    { label: "artigos revisados", value: posts.length },
    { label: "figuras interativas", value: figures },
    { label: "referências citadas", value: references },
  ];

  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-plate text-slate-100"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <CoverArt motif="eye" seed="inicio" animated decorative className="opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050812] via-[#050812]/85 to-[#050812]/20" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050812]/80 to-transparent" />
        </div>
        <div className="container-page py-20 lg:py-28">
          <p className="smallcaps text-sm font-semibold tracking-[0.14em] text-sky-300">
            {site.tagline}
          </p>
          <h1
            id="hero-title"
            className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-balance text-white sm:text-6xl lg:text-7xl"
          >
            Ensaios técnicos para ler, experimentar e citar.
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-slate-300">
            Artigos sobre transmissão óptica, infraestrutura, segurança e software — com figuras
            interativas no próprio texto, equações, notas de margem e referências bibliográficas.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-black/30 transition hover:bg-sky-100"
              data-testid="cta-blog"
            >
              Ler os artigos <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
            >
              Sobre o autor
            </Link>
          </div>
          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
            {stats.map(({ label, value }) => (
              <div key={label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs text-slate-400 sm:text-sm">{label}</dt>
                <dd className="font-serif text-3xl font-semibold tabular-nums text-white sm:text-4xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-xs text-slate-400">
            Ao fundo: diagrama de olho de um sinal digital — a sobreposição de milhares de bits
            revela ruído e jitter.
          </p>
        </div>
      </section>

      {featured && (
        <section className="container-page mt-20" aria-labelledby="destaque">
          <h2 id="destaque" className="smallcaps mb-5 text-sm font-semibold text-accent-strong">
            Em destaque
          </h2>
          <PostCard post={featured} variant="featured" />
        </section>
      )}

      <section className="container-page mt-24" aria-labelledby="areas">
        <div className="max-w-2xl">
          <h2 id="areas" className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Áreas de estudo
          </h2>
          <p className="mt-3 font-serif text-lg text-muted-foreground">
            Quatro eixos que se cruzam: do fóton ao pacote, do kernel ao algoritmo.
          </p>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_IDS.map((id) => {
            const category = CATEGORIES[id];
            const count = posts.filter((post) => post.category === id).length;
            return (
              <li key={id}>
                <Link
                  href={`/blog?area=${id}`}
                  className="group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-plate p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  data-testid="area-card"
                >
                  <div className="absolute inset-0" aria-hidden="true">
                    <CoverArt
                      motif={category.motif}
                      seed={`area-${id}`}
                      decorative
                      className="transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-[#050812]/75 to-transparent" />
                  </div>
                  <div className="relative">
                    <p className="text-xs text-slate-300">
                      {count} {count === 1 ? "artigo" : "artigos"}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-semibold">{category.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container-page mt-24" aria-labelledby="recentes">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2
              id="recentes"
              className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Artigos recentes
            </h2>
            <p className="mt-3 font-serif text-lg text-muted-foreground">
              Revisados em 2026, cada um com a sua própria ilustração gerada por código.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-medium text-accent-strong hover:underline sm:inline-flex"
          >
            Todos os artigos <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-24" aria-labelledby="como-ler">
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-10">
          <h2 id="como-ler" className="font-serif text-3xl font-semibold tracking-tight">
            Como ler este blog
          </h2>
          <p className="mt-2 max-w-2xl font-serif text-lg text-muted-foreground">
            Os textos seguem convenções de publicações técnicas — com a vantagem de que você pode
            mexer nas figuras.
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {READING_GUIDE.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page mt-24" aria-labelledby="autor">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Image
            src="/profile-image.jpg"
            alt={`Foto de ${site.author.name}`}
            width={96}
            height={96}
            className="size-24 rounded-full border-2 border-accent/50 object-cover"
          />
          <div className="max-w-2xl">
            <h2 id="autor" className="font-serif text-2xl font-semibold">
              {site.author.name}
            </h2>
            <p className="mt-1 font-serif text-lg leading-relaxed text-muted-foreground">
              Engenheiro de telecomunicações (UFRN). Escreve sobre o que pratica: redes ópticas,
              observabilidade, Linux e engenharia de software.{" "}
              <Link href="/about" className="text-accent-strong underline underline-offset-4">
                Conheça o autor
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
