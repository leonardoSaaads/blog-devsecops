import type { ShikiTransformer } from "shiki";

/** Extrai `title="arquivo.yml"` da meta string do bloco de código. */
export function parseCodeMeta(meta: string): { title?: string } {
  const title = /title="([^"]+)"/.exec(meta)?.[1];
  return title ? { title } : {};
}

/** Expõe linguagem e título como atributos `data-*` no `<pre>`. */
export const codeMetaTransformer: ShikiTransformer = {
  name: "blog:code-meta",
  pre(node) {
    node.properties["data-language"] = this.options.lang;
    const meta = this.options.meta as { title?: string } | undefined;
    if (meta?.title) node.properties["data-title"] = meta.title;
  },
};
