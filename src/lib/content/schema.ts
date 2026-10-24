import { z } from "zod";
import { MOTIFS } from "@/lib/art/types";
import { CATEGORY_IDS } from "./categories";

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
    id: z.string().regex(slugLike, "reference id must be kebab-case"),
    type: z.enum(referenceTypes),
    /** People: "Family, Given". Organizations: full name without commas. */
    authors: z.array(z.string().min(2)).default([]),
    title: z.string().min(2),
    subtitle: z.string().optional(),
    /** Journal, conference, website or work that contains the item. */
    container: z.string().optional(),
    edition: z.string().optional(),
    place: z.string().optional(),
    publisher: z.string().optional(),
    year: z.number().int().min(1800).max(2100),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string().regex(/^10\.\d{4,9}\/\S+$/, "invalid DOI").optional(),
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
    tags: z.array(z.string().regex(slugLike, "tags must be lowercase kebab-case")).min(1),
    category: z.enum(CATEGORY_IDS),
    /** Generative cover art motif (tied to the article topic). */
    art: z.enum(MOTIFS),
    /** Academic abstract (shown at the top of the article). */
    abstract: z.string().min(120).max(900),
    /** Key takeaways shown as cards at the start of the article. */
    keyPoints: z.array(z.string().min(10).max(220)).min(3).max(4),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    references: z.array(referenceSchema).min(1, "every article needs references"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const ids = new Set<string>();
    for (const ref of data.references) {
      if (ids.has(ref.id)) {
        ctx.addIssue({ code: "custom", message: `duplicate reference: ${ref.id}` });
      }
      ids.add(ref.id);
    }
    if (data.updated && data.updated < data.date) {
      ctx.addIssue({ code: "custom", message: "`updated` cannot be earlier than `date`" });
    }
  });

export type Reference = z.infer<typeof referenceSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
