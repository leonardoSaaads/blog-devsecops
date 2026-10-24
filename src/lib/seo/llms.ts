/** Plain-text site index for language models (https://llmstxt.org). */
export interface LlmsLink {
  title: string;
  url: string;
  description?: string;
}

export interface LlmsTxtInput {
  title: string;
  summary: string;
  details: string;
  sections: readonly { heading: string; links: readonly LlmsLink[] }[];
}

/** Markdown links cannot contain line breaks or unbalanced brackets. */
function inline(text: string): string {
  return text.replace(/\s+/g, " ").replace(/[[\]]/g, "").trim();
}

export function buildLlmsTxt({ title, summary, details, sections }: LlmsTxtInput): string {
  const body = sections.map(({ heading, links }) => {
    const items = links.map(
      ({ title: label, url, description }) =>
        `- [${inline(label)}](${url})${description ? `: ${inline(description)}` : ""}`,
    );
    return `## ${heading}\n\n${items.join("\n")}`;
  });
  return `# ${inline(title)}\n\n> ${inline(summary)}\n\n${details.trim()}\n\n${body.join("\n\n")}\n`;
}
