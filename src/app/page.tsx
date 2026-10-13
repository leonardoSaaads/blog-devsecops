import { ArrowRight, BookOpen, Box, FlaskConical, Library } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { TagBadge } from "@/components/blog/tag-badge";
import { HeroTerminal } from "@/components/home/hero-terminal";
import { ProductCard } from "@/components/shop/product-card";
import { getAllPosts, getAllTags } from "@/lib/content/posts";
import { getAllProducts } from "@/lib/shop/products";

export default function HomePage() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 3);
  const labs = posts.flatMap((post) => post.labs.map((lab) => ({ lab, post })));
  const references = posts.reduce((sum, post) => sum + post.references.length, 0);
  const products = getAllProducts();
  const tags = getAllTags().slice(0, 14);

  const stats = [
    { label: "artigos", value: posts.length, icon: BookOpen },
    { label: "laboratórios executáveis", value: labs.length, icon: FlaskConical },
    { label: "referências citadas", value: references, icon: Library },
    { label: "modelos 3D", value: products.length, icon: Box },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
              <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden="true" />
              DevSecOps · Observabilidade · Telecom
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Infraestrutura que você{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-300 dark:to-blue-400">
                lê, executa e entende
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Artigos técnicos com laboratórios interativos no navegador — simuladores de
              Kubernetes, calculadoras ópticas, código executável em Python e JavaScript — e uma
              loja de modelos 3D para o seu homelab.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-lg shadow-cyan-500/20 transition hover:opacity-90"
                data-testid="cta-blog"
              >
                Explorar artigos <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-semibold transition hover:border-accent"
              >
                <Box className="size-4 text-accent" aria-hidden="true" /> Loja 3D
              </Link>
            </div>
          </div>
          <HeroTerminal />
        </div>
      </section>

      <section aria-label="Números do blog" className="container-page -mt-px">
        <dl className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-b-2xl border-x border-b border-border bg-card sm:grid-cols-4 sm:divide-y-0">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col-reverse gap-1 p-5">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-4 text-accent" aria-hidden="true" /> {label}
              </dt>
              <dd className="font-mono text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page mt-20" aria-labelledby="recentes">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="recentes" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Artigos recentes
            </h2>
            <p className="mt-1 text-muted-foreground">
              Revisados em 2026, com referências bibliográficas.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-medium text-accent-strong hover:underline sm:inline-flex"
          >
            Ver todos <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {latest.map((post, index) => (
            <li key={post.slug}>
              <PostCard post={post} featured={index === 0} />
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-20" aria-labelledby="labs">
        <h2 id="labs" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Laboratórios interativos
        </h2>
        <p className="mt-1 text-muted-foreground">
          Aprenda mexendo: cada laboratório roda inteiramente no seu navegador.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map(({ lab, post }) => (
            <li key={`${post.slug}-${lab}`}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-accent"
              >
                <FlaskConical className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  <span className="block font-medium group-hover:text-accent-strong">{lab}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{post.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-20" aria-labelledby="loja">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="loja" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Modelos 3D
            </h2>
            <p className="mt-1 text-muted-foreground">
              Gire, inspecione e escolha a cor do filamento antes de encomendar.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-accent-strong hover:underline sm:inline-flex"
          >
            Ir para a loja <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-20" aria-labelledby="temas">
        <h2 id="temas" className="text-2xl font-bold tracking-tight">
          Temas
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map(({ tag }) => (
            <TagBadge key={tag} tag={tag} className="px-3 py-1 text-sm" />
          ))}
        </div>
      </section>
    </>
  );
}
