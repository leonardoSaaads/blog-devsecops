import { z } from "zod";

const slugLike = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const referenceTypes = [
  "book",
  "article",
  "conference",
  "standard",
  "report",
  "web",
  "software",
] as const;

export const referenceSchema = z
  .object({
    id: z.string().regex(slugLike, "id da referência deve ser kebab-case"),
    type: z.enum(referenceTypes),
    /** Pessoas: "Sobrenome, Prenome". Entidades: nome completo sem vírgula. */
    authors: z.array(z.string().min(2)).default([]),
    title: z.string().min(2),
    subtitle: z.string().optional(),
    /** Periódico, evento, site ou obra que contém o item. */
    container: z.string().optional(),
    edition: z.string().optional(),
    place: z.string().optional(),
    publisher: z.string().optional(),
    year: z.number().int().min(1800).max(2100),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string().regex(/^10\.\d{4,9}\/\S+$/, "DOI inválido").optional(),
    url: z.url({ protocol: /^https$/ }).optional(),
    accessed: z.iso.date().optional(),
    note: z.string().optional(),
  })
  .strict();

export const postFrontmatterSchema = z
  .object({
    title: z.string().min(5).max(120),
    description: z.string().min(20).max(300),
    date: z.iso.date(),
    updated: z.iso.date().optional(),
    tags: z.array(z.string().regex(slugLike, "tags devem ser kebab-case minúsculo")).min(1),
    cover: z.object({ src: z.string().startsWith("/"), alt: z.string().min(3) }).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    /** Laboratórios interativos presentes no artigo (exibidos na listagem). */
    labs: z.array(z.string().min(3)).default([]),
    references: z.array(referenceSchema).min(1, "todo artigo precisa de referências"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const ids = new Set<string>();
    for (const ref of data.references) {
      if (ids.has(ref.id)) {
        ctx.addIssue({ code: "custom", message: `referência duplicada: ${ref.id}` });
      }
      ids.add(ref.id);
    }
    if (data.updated && data.updated < data.date) {
      ctx.addIssue({ code: "custom", message: "`updated` não pode ser anterior a `date`" });
    }
  });

export type Reference = z.infer<typeof referenceSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
