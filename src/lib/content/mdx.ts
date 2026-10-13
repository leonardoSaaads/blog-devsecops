import "server-only";
import { evaluate } from "@mdx-js/mdx";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { MDXContent } from "mdx/types";
import { cache } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { createHighlighter, type BundledLanguage, type Highlighter } from "shiki";
import { rehypeCollectHeadings, type TocItem } from "./plugins/rehype-collect-headings";
import { remarkRunnableCode } from "./plugins/remark-runnable-code";
import { codeMetaTransformer, parseCodeMeta } from "./plugins/shiki-meta";

export const CODE_THEMES = { light: "github-light", dark: "github-dark-dimmed" } as const;

const LANGUAGES: BundledLanguage[] = [
  "bash",
  "shellsession",
  "yaml",
  "json",
  "python",
  "javascript",
  "typescript",
  "tsx",
  "c",
  "rust",
  "go",
  "docker",
  "ini",
  "toml",
  "sql",
  "markdown",
  "asm",
  "diff",
  "nginx",
  "html",
  "css",
];

let highlighter: Promise<Highlighter> | undefined;
function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: Object.values(CODE_THEMES), langs: LANGUAGES });
  return highlighter;
}

export interface RenderedMdx {
  Content: MDXContent;
  toc: TocItem[];
}

/**
 * Compila MDX no servidor (build time). O conteúdo é confiável (versionado no
 * repositório); `import`/`export` dentro dos artigos não são utilizados.
 */
export const renderMdx = cache(async (source: string): Promise<RenderedMdx> => {
  const toc: TocItem[] = [];
  const shiki = await getHighlighter();

  const { default: Content } = await evaluate(source, {
    ...runtime,
    development: false,
    remarkPlugins: [remarkGfm, [remarkMath, { singleDollarTextMath: false }], remarkRunnableCode],
    rehypePlugins: [
      rehypeSlug,
      [rehypeCollectHeadings, { toc }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { className: ["heading-anchor"], ariaLabel: "Link direto para esta seção" },
          content: { type: "text", value: "#" },
        },
      ],
      [rehypeKatex, { strict: "warn", trust: false, output: "htmlAndMathml" }],
      [
        rehypeShikiFromHighlighter,
        shiki,
        {
          themes: CODE_THEMES,
          defaultColor: false,
          fallbackLanguage: "text",
          defaultLanguage: "text",
          parseMetaString: parseCodeMeta,
          transformers: [codeMetaTransformer],
        },
      ],
    ],
  });

  return { Content, toc };
});
