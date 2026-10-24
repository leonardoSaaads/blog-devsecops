/**
 * Arquivos de configuração da Cloudflare (Workers Static Assets) gerados no build.
 *
 * A exportação estática não tem servidor para aplicar `headers()`/`redirects()` do
 * Next nem os cabeçalhos devolvidos pelas rotas. A Cloudflare lê `_headers` e
 * `_redirects` da raiz dos assets (não são servidos publicamente).
 */
import { ART_CACHE_CONTROL } from "@/lib/art/url";
import { FEED_HEADERS } from "@/lib/seo/feed";
import { VARIANTS_DIR } from "@/lib/images/variants.mts";
import { buildSecurityHeaders, type HeaderRule } from "@/lib/security/headers";
import { buildRedirects, type RedirectRule } from "./redirects";

/** Limites da plataforma: o build falha em vez de publicar regras ignoradas. */
export const CLOUDFLARE_LIMITS = {
  headerRules: 100,
  redirectRules: 2000,
  lineLength: 2000,
} as const;

const IMMUTABLE = "public, max-age=31536000, immutable";
const OG_IMAGE = [{ key: "Content-Type", value: "image/png" }];

/** Tipo e cache de arquivos cujo cabeçalho a exportação estática não preserva. */
export function buildAssetHeaders(): HeaderRule[] {
  return [
    // Nomes com hash de conteúdo: podem ficar em cache indefinidamente.
    { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: IMMUTABLE }] },
    { source: "/art/:path*", headers: [{ key: "Cache-Control", value: ART_CACHE_CONTROL }] },
    // Variantes de imagem: sem hash no nome, mas mudam raramente (revalidam por ETag).
    {
      source: `/${VARIANTS_DIR}/:path*`,
      headers: [{ key: "Cache-Control", value: ART_CACHE_CONTROL }],
    },
    {
      source: "/feed.xml",
      headers: Object.entries(FEED_HEADERS).map(([key, value]) => ({ key, value })),
    },
    // Imagens Open Graph são exportadas sem extensão (o tipo não seria inferido).
    { source: "/opengraph-image", headers: OG_IMAGE },
    { source: "/blog/:slug/opengraph-image", headers: OG_IMAGE },
  ];
}

/** Converte o padrão de rota do Next (`/:path*`) para a sintaxe da Cloudflare (`/*`). */
export function toCloudflarePath(source: string): string {
  const path = source.replace(/\/:\w+\*$/, "/*");
  if (!path.startsWith("/") || /[()+?\s]|\*(?!$)|:\w+\*/.test(path)) {
    throw new Error(`Padrão de rota sem equivalente na Cloudflare: ${source}`);
  }
  return path;
}

function assertSafe(value: string, context: string): void {
  // Quebras de linha permitiriam injetar regras no arquivo.
  if (/[\r\n]/.test(value)) throw new Error(`Quebra de linha não permitida em ${context}`);
}

function assertLimits(lines: readonly string[], rules: number, maxRules: number, file: string) {
  if (rules > maxRules) throw new Error(`${file}: ${rules} regras excedem o limite de ${maxRules}`);
  const long = lines.find((line) => line.length > CLOUDFLARE_LIMITS.lineLength);
  if (long) throw new Error(`${file}: linha excede ${CLOUDFLARE_LIMITS.lineLength} caracteres`);
}

/**
 * No Next, uma regra posterior sobrescreve o cabeçalho de mesmo nome; na Cloudflare
 * os valores seriam concatenados com vírgula (duas CSPs = interseção das políticas).
 * `! Nome` desanexa o valor herdado antes de definir o novo.
 */
export function serializeHeadersFile(rules: readonly HeaderRule[]): string {
  const defined = new Set<string>();
  const blocks = rules.map(({ source, headers }) => {
    const lines = headers.flatMap(({ key, value }) => {
      assertSafe(`${key}: ${value}`, `cabeçalho de ${source}`);
      return defined.has(key.toLowerCase())
        ? [`! ${key}`, `${key}: ${value}`]
        : [`${key}: ${value}`];
    });
    headers.forEach(({ key }) => defined.add(key.toLowerCase()));
    return [toCloudflarePath(source), ...lines.map((line) => `  ${line}`)];
  });
  assertLimits(blocks.flat(), rules.length, CLOUDFLARE_LIMITS.headerRules, "_headers");
  return `${blocks.map((block) => block.join("\n")).join("\n\n")}\n`;
}

export function serializeRedirectsFile(rules: readonly RedirectRule[]): string {
  const lines = rules.map(({ source, destination }) => {
    if (!source.startsWith("/") || /\s/.test(source) || /\s/.test(destination)) {
      throw new Error(`Redirecionamento inválido: ${source} -> ${destination}`);
    }
    return `${source} ${destination} 308`;
  });
  assertLimits(lines, rules.length, CLOUDFLARE_LIMITS.redirectRules, "_redirects");
  return `${lines.join("\n")}\n`;
}

/** Conteúdo de `_headers`: segurança (mesma fonte do `next dev`) + tipo/cache dos assets. */
export function cloudflareHeadersFile(): string {
  return serializeHeadersFile([...buildSecurityHeaders({ isDev: false }), ...buildAssetHeaders()]);
}

/** Conteúdo de `_redirects`: links legados e tags antigas em caixa alta. */
export function cloudflareRedirectsFile(tags: readonly string[]): string {
  return serializeRedirectsFile(buildRedirects(tags));
}
