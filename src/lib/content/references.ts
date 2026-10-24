import type { Reference } from "./schema";

/** Piece of a formatted reference; `emphasis` marks titles set in italics (IEEE). */
export interface ReferencePart {
  text: string;
  emphasis?: boolean;
  href?: string;
}

/** Month abbreviations from the IEEE Editorial Style Manual. */
const MONTHS_IEEE = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
] as const;

/** ISO date (YYYY-MM-DD) in IEEE style: "Oct. 13, 2026". */
export function formatIeeeDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) {
    throw new Error(`Invalid date: ${isoDate}`);
  }
  return `${MONTHS_IEEE[month - 1]} ${day}, ${year}`;
}

/**
 * Person ("Agrawal, Govind P.") → "G. P. Agrawal".
 * Organization ("International Telecommunication Union") → unchanged.
 */
export function formatAuthorName(author: string): string {
  const commaIndex = author.indexOf(",");
  if (commaIndex === -1) return author.trim();
  const family = author.slice(0, commaIndex).trim();
  const given = author.slice(commaIndex + 1).trim();
  if (!given) return family;
  const initials = given
    .split(/\s+/)
    .map((name) =>
      name
        .split("-")
        .map((part) => `${part.charAt(0).toUpperCase()}.`)
        .join("-"),
    )
    .join(" ");
  return `${initials} ${family}`;
}

/** IEEE: "A", "A and B", "A, B, and C"; more than six authors → "A et al.". */
export function formatAuthors(authors: readonly string[]): string {
  const names = authors.map(formatAuthorName);
  if (names.length === 0) return "";
  if (names.length > 6) return `${names[0]} et al.`;
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

function fullTitle(ref: Reference): string {
  return ref.subtitle ? `${ref.title}: ${ref.subtitle}` : ref.title;
}

function ordinal(value: number): string {
  const suffix =
    value % 100 >= 11 && value % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[value % 10] ?? "th";
  return `${value}${suffix}`;
}

function edition(ref: Reference): string {
  if (!ref.edition) return "";
  return /^\d+$/.test(ref.edition) ? `, ${ordinal(Number(ref.edition))} ed.` : `, ${ref.edition}`;
}

/** "261-301" → "pp. 261–301"; "42" → "p. 42". */
function pages(value: string): string {
  return /[-–]/.test(value) ? `pp. ${value.replace(/\s*[-–]\s*/, "–")}` : `p. ${value}`;
}

function imprint(ref: Reference): string {
  const source = [ref.place, ref.publisher].filter(Boolean).join(": ");
  return source ? `${source}, ${ref.year}` : String(ref.year);
}

function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function onlineParts(ref: Reference, withDoi: boolean): ReferencePart[] {
  const parts: ReferencePart[] = [];
  if (withDoi && ref.doi) {
    parts.push({ text: " doi: " }, { text: ref.doi, href: `https://doi.org/${ref.doi}` }, { text: "." });
  }
  if (ref.url) {
    if (ref.accessed) parts.push({ text: ` Accessed: ${formatIeeeDate(ref.accessed)}.` });
    parts.push({ text: " [Online]. Available: " }, { text: ref.url, href: ref.url });
  }
  return parts;
}

/** Formats a reference in IEEE style (simplified, numbered list). */
export function formatReference(ref: Reference): ReferencePart[] {
  const authors = formatAuthors(ref.authors);
  const lead: ReferencePart[] = authors ? [{ text: `${authors}, ` }] : [];
  const note: ReferencePart[] = ref.note ? [{ text: ` ${sentence(ref.note)}` }] : [];

  let body: ReferencePart[];
  let doiInline = false;
  switch (ref.type) {
    case "article": {
      const details = [
        ref.volume && `vol. ${ref.volume}`,
        ref.issue && `no. ${ref.issue}`,
        ref.pages && pages(ref.pages),
        String(ref.year),
      ].filter(Boolean);
      body = [
        { text: `“${fullTitle(ref)},” ` },
        { text: ref.container ?? "", emphasis: true },
        { text: `, ${details.join(", ")}` },
        ...(ref.doi
          ? [
              { text: ", doi: " },
              { text: ref.doi, href: `https://doi.org/${ref.doi}` },
              { text: "." },
            ]
          : [{ text: "." }]),
      ];
      doiInline = true;
      break;
    }
    case "conference":
      body = [
        { text: `“${fullTitle(ref)},” in ` },
        { text: ref.container ?? "", emphasis: true },
        { text: `, ${[ref.place, String(ref.year), ref.pages && pages(ref.pages)].filter(Boolean).join(", ")}.` },
      ];
      break;
    case "web":
      body = [
        { text: `“${fullTitle(ref)},” ` },
        ...(ref.container ? [{ text: ref.container, emphasis: true }, { text: ", " }] : []),
        { text: `${ref.year}.` },
      ];
      break;
    case "software":
      body = [{ text: fullTitle(ref), emphasis: true }, { text: `, ${ref.year}.` }];
      break;
    case "book":
    case "report":
    case "standard":
    default:
      body = [
        { text: fullTitle(ref), emphasis: true },
        { text: `${sentence(edition(ref))} ${imprint(ref)}.` },
      ];
  }

  return mergeAdjacent([...lead, ...body, ...note, ...onlineParts(ref, !doiInline)]);
}

function mergeAdjacent(parts: ReferencePart[]): ReferencePart[] {
  const merged: ReferencePart[] = [];
  for (const part of parts) {
    if (!part.text) continue;
    const last = merged.at(-1);
    if (last && !last.emphasis && !last.href && !part.emphasis && !part.href) {
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
