import { z } from "zod";

export const productStatuses = ["available", "made-to-order", "coming-soon"] as const;

export const productSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(3).max(80),
    summary: z.string().min(10).max(160),
    description: z.array(z.string().min(10)).min(1),
    category: z.string().min(3),
    tags: z.array(z.string()).default([]),
    price: z.object({
      amount: z.number().int().positive(),
      currency: z.literal("BRL"),
    }),
    status: z.enum(productStatuses),
    model: z.object({
      src: z.string().regex(/^\/models\/[a-z0-9-]+\.(stl|glb)$/),
      format: z.enum(["stl", "glb"]),
      defaultColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    }),
    poster: z.string().startsWith("/models/").optional(),
    license: z.string().min(3),
    files: z.array(z.string()).min(1),
    print: z.object({
      materials: z.array(z.string()).min(1),
      layerHeight: z.string(),
      infill: z.string(),
      supports: z.boolean(),
      estimatedTime: z.string(),
    }),
    /** Link de checkout externo (ex.: Stripe Payment Link, Mercado Pago, Gumroad). */
    checkoutUrl: z.url({ protocol: /^https$/ }).optional(),
  })
  .strict();

export const catalogSchema = z.array(productSchema).superRefine((products, ctx) => {
  const slugs = new Set<string>();
  for (const product of products) {
    if (slugs.has(product.slug)) {
      ctx.addIssue({ code: "custom", message: `slug duplicado: ${product.slug}` });
    }
    slugs.add(product.slug);
  }
});

export type Product = z.infer<typeof productSchema>;
export type ProductStatus = Product["status"];

export const statusLabels: Record<ProductStatus, string> = {
  available: "Disponível",
  "made-to-order": "Sob encomenda",
  "coming-soon": "Em breve",
};
