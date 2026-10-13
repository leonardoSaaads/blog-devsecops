import "server-only";
import catalog from "../../../content/products.json";
import { catalogSchema, type Product } from "./schema";

// Validação no carregamento do módulo: um catálogo inválido quebra o build.
const products: Product[] = catalogSchema.parse(catalog);

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
