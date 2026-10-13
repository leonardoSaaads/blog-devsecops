import { ArrowLeft, ExternalLink, FileBox, Mail, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ModelViewer } from "@/components/shop/model-viewer";
import { StatusBadge } from "@/components/shop/status-badge";
import { formatCurrency } from "@/lib/format";
import { getAllProducts, getProductBySlug } from "@/lib/shop/products";
import { statusLabels } from "@/lib/shop/schema";
import { site } from "@/lib/site";
import { productJsonLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.summary,
      images: product.poster ? [product.poster] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const orderMail = `mailto:${site.author.email}?subject=${encodeURIComponent(`Encomenda: ${product.name}`)}&body=${encodeURIComponent(
    `Olá! Tenho interesse no modelo "${product.name}".\n\nCor do filamento:\nQuantidade:\nCEP para frete:\n`,
  )}`;

  const specs = [
    { label: "Materiais", value: product.print.materials.join(", ") },
    { label: "Altura de camada", value: product.print.layerHeight },
    { label: "Preenchimento", value: product.print.infill },
    { label: "Suportes", value: product.print.supports ? "Necessários" : "Não necessários" },
    { label: "Tempo estimado", value: product.print.estimatedTime },
    { label: "Formato", value: product.model.format.toUpperCase() },
  ];

  return (
    <div className="container-page py-10">
      <JsonLd data={productJsonLd(product)} />
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Voltar à loja
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ModelViewer
            src={product.model.src}
            format={product.model.format}
            defaultColor={product.model.defaultColor}
            name={product.name}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-3xl font-semibold" data-testid="product-price">
              {formatCurrency(product.price.amount)}
            </span>
            <StatusBadge status={product.status} label={statusLabels[product.status]} />
          </div>
          <p className="mt-4 text-lg text-muted-foreground">{product.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {product.checkoutUrl ? (
              <a
                href={product.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
                data-testid="buy-button"
              >
                Comprar <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            ) : (
              <a
                href={orderMail}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
                data-testid="buy-button"
              >
                <Mail className="size-4" aria-hidden="true" /> Encomendar por e-mail
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {product.checkoutUrl
              ? "O pagamento é processado em ambiente externo e seguro; este site não coleta dados de pagamento."
              : "Responderemos com prazo, frete e link de pagamento seguro."}
          </p>

          <div className="mt-8 space-y-3 text-muted-foreground">
            {product.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold">Parâmetros de impressão</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">{spec.label}</dt>
                <dd className="mt-0.5 text-sm font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <FileBox className="size-4 text-accent" aria-hidden="true" /> Arquivos incluídos
              </h2>
              <ul className="mt-2 space-y-1 font-mono text-sm text-muted-foreground">
                {product.files.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Scale className="size-4 text-accent" aria-hidden="true" /> Licença
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{product.license}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
