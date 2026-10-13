import { parse } from "yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export interface ParsedDocument {
  data: unknown;
  body: string;
}

/** Separa o bloco YAML inicial (`---`) do corpo do documento. */
export function parseFrontmatter(source: string): ParsedDocument {
  const match = FRONTMATTER.exec(source);
  if (!match) {
    return { data: {}, body: source };
  }
  // `yaml` (YAML 1.2) não converte datas implicitamente: permanecem strings ISO.
  const data: unknown = parse(match[1] ?? "", { strict: true, uniqueKeys: true }) ?? {};
  return { data, body: source.slice(match[0].length) };
}
