import fs from "node:fs";
import path from "node:path";
import { productJsonLd } from "@/lib/structured-data";
import { getAllProducts, getProductBySlug } from "./products";
import { catalogSchema } from "./schema";

describe("catálogo da loja 3D", () => {
  const products = getAllProducts();

  it("tem produtos válidos com modelos e pôsteres existentes", () => {
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(
        fs.existsSync(path.join(process.cwd(), "public", product.model.src)),
        product.model.src,
      ).toBe(true);
      if (product.poster)
        expect(
          fs.existsSync(path.join(process.cwd(), "public", product.poster)),
          product.poster,
        ).toBe(true);
    }
  });

  it("STL binário tem tamanho coerente com o número de triângulos", () => {
    for (const product of products.filter((item) => item.model.format === "stl")) {
      const buffer = fs.readFileSync(path.join(process.cwd(), "public", product.model.src));
      const triangles = buffer.readUInt32LE(80);
      expect(buffer.length).toBe(84 + triangles * 50);
      expect(triangles).toBeGreaterThan(10);
    }
  });

  it("rejeita slugs duplicados, checkout sem HTTPS e preços inválidos", () => {
    const base = products[0]!;
    expect(() => catalogSchema.parse([base, base])).toThrow(/duplicado/);
    expect(() => catalogSchema.parse([{ ...base, checkoutUrl: "http://pagamento.com" }])).toThrow();
    expect(() =>
      catalogSchema.parse([{ ...base, price: { amount: -1, currency: "BRL" } }]),
    ).toThrow();
  });

  it("gera dados estruturados de produto", () => {
    const product = getProductBySlug("vaso-parametrico-onda")!;
    const data = productJsonLd(product);
    expect(data.offers).toMatchObject({
      price: "19.90",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    });
    expect(getProductBySlug("inexistente")).toBeUndefined();
  });
});
