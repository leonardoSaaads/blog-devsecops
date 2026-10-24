import { ArrowRight, BookMarked, MousePointerClick, NotebookPen, Sigma } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CoverArt } from "@/components/art/cover-art";
import { SITE_ARTWORKS, areaArtwork } from "@/lib/art/catalog";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORIES, categoriesInUse } from "@/lib/content/categories";
import { getAllPosts } from "@/lib/content/posts";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { websiteJsonLd } from "@/lib/seo/structured-data";

const READING_GUIDE = [
  {
    icon: MousePointerClick,
    title: "Interactive figures",
    text: "Simulators and calculators sit right inside the text, numbered like the figures of a scientific paper.",
  },
  {
    icon: NotebookPen,
    title: "Margin notes and glossary",
    text: "Side comments and terms with pop-up definitions — going deeper is one hover away.",
  },
  {
    icon: Sigma,
    title: "Numbered equations",
    text: "Formulas typeset with KaTeX and referenced in the text, as in a technical publication.",
  },
  {
    icon: BookMarked,
    title: "IEEE-style references",
    text: "Every relevant claim points to its source. Each article includes a ready-made citation for your own work.",
  },
];

export default function HomePage() {
  const posts = getAllPosts();
  const areas = categoriesInUse(posts);
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const recent = posts.filter((post) => post.slug !== featured?.slug).slice(0, 6);
  const references = posts.reduce((sum, post) => sum + post.references.length, 0);
  const figures = posts.reduce((sum, post) => sum + post.figures, 0);

  const stats = [
    { label: "reviewed articles", value: posts.length },
    { label: "interactive figures", value: figures },
    { label: "cited references", value: references },
  ];

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <section
        className="relative isolate overflow-hidden bg-plate text-slate-100"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <CoverArt {...SITE_ARTWORKS.home} priority className="art-reveal opacity-80" />
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
            Technical essays to read, explore and cite.
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-slate-300">
            Articles on optical transmission, infrastructure, security and software — with
            interactive figures right in the text, equations, margin notes and cited sources.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-black/30 transition hover:bg-sky-100"
              data-testid="cta-blog"
            >
              Read the articles <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
            >
              About the author
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
            In the background: the eye diagram of a digital signal — thousands of overlapping bits
            reveal noise and jitter.
          </p>
        </div>
      </section>

      {featured && (
        <section className="container-page mt-20" aria-labelledby="featured">
          <h2 id="featured" className="smallcaps mb-5 text-sm font-semibold text-accent-strong">
            Featured
          </h2>
          <PostCard post={featured} variant="featured" />
        </section>
      )}

      <section className="container-page mt-24" aria-labelledby="areas">
        <div className="max-w-2xl">
          <h2 id="areas" className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Areas of study
          </h2>
          <p className="mt-3 font-serif text-lg text-muted-foreground">
            Where the photon meets the packet and the kernel meets the algorithm.
          </p>
        </div>
        <ul
          className={cn(
            "mt-8 grid gap-5 sm:grid-cols-2",
            areas.length >= 4 && "lg:grid-cols-4",
            areas.length === 3 && "lg:grid-cols-3",
          )}
        >
          {areas.map((id) => {
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
                      {...areaArtwork(id)}
                      className="transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-[#050812]/75 to-transparent" />
                  </div>
                  <div className="relative">
                    <p className="text-xs text-slate-300">
                      {count} {count === 1 ? "article" : "articles"}
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

      <section className="container-page mt-24" aria-labelledby="recent">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2
              id="recent"
              className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Recent articles
            </h2>
            <p className="mt-3 font-serif text-lg text-muted-foreground">
              Reviewed in 2026, each with its own code-generated illustration.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-medium text-accent-strong hover:underline sm:inline-flex"
          >
            All articles <ArrowRight className="size-4" aria-hidden="true" />
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

      <section className="container-page mt-24" aria-labelledby="how-to-read">
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-10">
          <h2 id="how-to-read" className="font-serif text-3xl font-semibold tracking-tight">
            How to read this blog
          </h2>
          <p className="mt-2 max-w-2xl font-serif text-lg text-muted-foreground">
            The articles follow the conventions of technical publications — with the bonus that you
            can play with the figures.
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

      <section className="container-page mt-24" aria-labelledby="author">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Image
            src="/profile-image.jpg"
            alt={`Photo of ${site.author.name}`}
            width={96}
            height={96}
            className="size-24 rounded-full border-2 border-accent/50 object-cover"
          />
          <div className="max-w-2xl">
            <h2 id="author" className="font-serif text-2xl font-semibold">
              {site.author.name}
            </h2>
            <p className="mt-1 font-serif text-lg leading-relaxed text-muted-foreground">
              Telecommunications engineer (UFRN), writing from hands-on practice: optical networks,
              observability, Linux and software engineering.{" "}
              <Link href="/about" className="text-accent-strong underline underline-offset-4">
                Meet the author
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
