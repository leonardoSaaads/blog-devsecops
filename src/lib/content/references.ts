import type { Reference } from "./schema";

/** Trecho de uma referência formatada; `strong` marca o elemento em destaque (ABNT). */
export interface ReferencePart {
  text: string;
  strong?: boolean;
  href?: string;
}

const MONTHS_ABNT = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "maio",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
] as const;

/** Formata data ISO (AAAA-MM-DD) conforme ABNT: "13 out. 2026". */
export function formatAbntDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) {
    throw new Error(`Data inválida: ${isoDate}`);
  }
  return `${day} ${MONTHS_ABNT[month - 1]} ${year}`;
}

/**
 * Pessoa ("Knuth, Donald E.") → "KNUTH, Donald E.".
 * Entidade ("International Telecommunication Union") → caixa alta integral.
 */
export function formatAuthorName(author: string): string {
  const commaIndex = author.indexOf(",");
  if (commaIndex === -1) return author.toLocaleUpperCase("pt-BR");
  const family = author.slice(0, commaIndex).trim().toLocaleUpperCase("pt-BR");
  const given = author.slice(commaIndex + 1).trim();
  return given ? `${family}, ${given}` : family;
}

export function formatAuthors(authors: readonly string[]): string {
  if (authors.length === 0) return "";
  // NBR 6023:2018 permite indicar o primeiro autor seguido de "et al." quando há mais de três.
  if (authors.length > 3) return `${formatAuthorName(authors[0]!)} et al.`;
  return authors.map(formatAuthorName).join("; ");
}

function title(ref: Reference): string {
  return ref.subtitle ? `${ref.title}: ${ref.subtitle}` : ref.title;
}

function imprint(ref: Reference): string {
  const place = ref.place ?? "[S. l.]";
  return ref.publisher ? `${place}: ${ref.publisher}, ${ref.year}.` : `${place}, ${ref.year}.`;
}

function periodicalDetails(ref: Reference): string {
  const parts = [
    ref.volume && `v. ${ref.volume}`,
    ref.issue && `n. ${ref.issue}`,
    ref.pages && `p. ${ref.pages}`,
    String(ref.year),
  ].filter(Boolean);
  return `${parts.join(", ")}.`;
}

function onlineParts(ref: Reference): ReferencePart[] {
  const parts: ReferencePart[] = [];
  if (ref.doi) {
    parts.push({ text: " DOI: " }, { text: ref.doi, href: `https://doi.org/${ref.doi}` }, { text: "." });
  }
  if (ref.url) {
    parts.push({ text: " Disponível em: " }, { text: ref.url, href: ref.url }, { text: "." });
    if (ref.accessed) parts.push({ text: ` Acesso em: ${formatAbntDate(ref.accessed)}.` });
  }
  return parts;
}

/** Formata uma referência segundo a ABNT NBR 6023:2018 (forma simplificada). */
export function formatReference(ref: Reference): ReferencePart[] {
  const authors = formatAuthors(ref.authors);
  // Evita ponto duplo quando o nome já termina com abreviação ("Govind P.", "Docker Inc.").
  const lead: ReferencePart[] = authors ? [{ text: `${authors}${authors.endsWith(".") ? "" : "."} ` }] : [];
  const edition = ref.edition ? ` ${ref.edition}. ed.` : "";
  const note = ref.note ? [{ text: ` ${ref.note}.` }] : [];

  let body: ReferencePart[];
  switch (ref.type) {
    case "article":
      body = [
        { text: `${title(ref)}. ` },
        { text: ref.container ?? "", strong: true },
        { text: `, ${periodicalDetails(ref)}` },
      ];
      break;
    case "conference":
      body = [
        { text: `${title(ref)}. In: ` },
        { text: ref.container ?? "", strong: true },
        { text: `. ${imprint(ref)}` },
        ...(ref.pages ? [{ text: ` p. ${ref.pages}.` }] : []),
      ];
      break;
    case "web":
    case "software":
      body = [
        { text: ref.title, strong: true },
        { text: ref.subtitle ? `: ${ref.subtitle}.` : "." },
        { text: ref.container ? ` ${ref.container}, ${ref.year}.` : ` ${ref.year}.` },
      ];
      break;
    case "book":
    case "report":
    case "standard":
    default:
      body = [
        { text: ref.title, strong: true },
        { text: `${ref.subtitle ? `: ${ref.subtitle}` : ""}.${edition} ${imprint(ref)}` },
      ];
  }

  return mergeAdjacent([...lead, ...body, ...note, ...onlineParts(ref)]);
}

function mergeAdjacent(parts: ReferencePart[]): ReferencePart[] {
  const merged: ReferencePart[] = [];
  for (const part of parts) {
    if (!part.text) continue;
    const last = merged.at(-1);
    if (last && !last.strong && !last.href && !part.strong && !part.href) {
      last.text += part.text;
    } else {
      merged.push({ ...part });
    }
  }
  return merged;
}

export function referenceToPlainText(ref: Reference): string {
  return formatReference(ref)
    .map((part) => part.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
