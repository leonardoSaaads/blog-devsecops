const WORDS_PER_MINUTE = 220;
const CODE_LINES_PER_MINUTE = 40;

/**
 * Estima o tempo de leitura em minutos. Blocos de código são contabilizados
 * por linha (leitura mais lenta que prosa); componentes JSX são ignorados.
 */
export function estimateReadingMinutes(markdown: string): number {
  let codeLines = 0;
  const prose = markdown
    .replace(/```[\s\S]*?```/g, (block) => {
      codeLines += Math.max(0, block.split("\n").length - 2);
      return " ";
    })
    .replace(/<[^>]+>/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/[#>*_`~[\]()|-]/g, " ");

  const words = prose.split(/\s+/).filter(Boolean).length;
  const minutes = words / WORDS_PER_MINUTE + codeLines / CODE_LINES_PER_MINUTE;
  return Math.max(1, Math.ceil(minutes));
}
