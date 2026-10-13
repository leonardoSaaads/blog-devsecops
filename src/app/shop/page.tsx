import { PackageCheck, Rotate3d, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/shop/product-card";
import { getAllProducts } from "@/lib/shop/products";

export const metadata: Metadata = {
  title: "Loja 3D",
  description:
    "Modelos 3D para impressão: homelab, telecom e decoração. Visualize em 3D interativo antes de encomendar.",
  alternates: { canonical: "/shop" },
};

const HIGHLIGHTS = [
  {
    icon: Rotate3d,
    title: "Inspecione em 3D",
    text: "Gire, aproxime e troque a cor do filamento direto no navegador.",
  },
  {
    icon: PackageCheck,
    title: "Pronto para imprimir",
    text: "Arquivos testados com parâmetros de impressão recomendados.",
  },
  {
    icon: ShieldCheck,
    title: "Pagamento externo seguro",
    text: "Nenhum dado de pagamento passa por este site.",
  },
];

export default function ShopPage() {
  const products = getAllProducts();
  return (
    <div className="container-page py-12">
      <PageHeader
        eyebrow="Loja"
        title="Modelos 3D"
        description="Peças funcionais para homelab e NOC, além de objetos paramétricos — desenhados por um engenheiro, para engenheiros."
      />
      <ul className="mb-12 grid gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
