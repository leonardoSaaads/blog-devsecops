import { parseFrontmatter } from "@/lib/content/frontmatter";
import { estimateReadingMinutes } from "@/lib/content/reading-time";
import { buildRssFeed, escapeXml } from "@/lib/feed";
import { cn, formatCurrency, formatDate, formatShortDate } from "@/lib/format";
import { normalize, searchEntries, type SearchEntry } from "@/lib/search";
import { serializeJsonLd } from "@/lib/structured-data";
import { nextPreference, resolveTheme, themeInitScript } from "@/lib/theme";

describe("frontmatter", () => {
  it("separa YAML e corpo sem converter datas", () => {
    const { data, body } = parseFrontmatter('---\ntitle: "Oi"\ndate: 2025-10-03\n---\n# Corpo');
    expect(data).toEqual({ title: "Oi", date: "2025-10-03" });
    expect(body).toBe("# Corpo");
  });

  it("rejeita chaves duplicadas", () => {
    expect(() => parseFrontmatter("---\na: 1\na: 2\n---\n")).toThrow();
  });

  it("documento sem frontmatter", () => {
    expect(parseFrontmatter("texto")).toEqual({ data: {}, body: "texto" });
  });
});

describe("tempo de leitura", () => {
  it("considera prosa e código separadamente", () => {
    expect(estimateReadingMinutes("palavra ".repeat(440))).toBe(2);
    const code = "```bash\n" + "echo oi\n".repeat(80) + "```";
    expect(estimateReadingMinutes(code)).toBe(2);
    expect(estimateReadingMinutes("")).toBe(1);
  });
});

describe("formatação", () => {
  it("datas ISO não sofrem deslocamento de fuso (bug da versão anterior)", () => {
    expect(formatDate("2025-10-03")).toBe("3 de outubro de 2025");
    expect(formatShortDate("2026-02-01")).toMatch(/^01 de fev/);
  });

  it("moeda em reais", () => {
    expect(formatCurrency(2490).replace(/\s/g, " ")).toBe("R$ 24,90");
  });

  it("cn ignora valores falsos", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("busca", () => {
  const entries: SearchEntry[] = [
    {
      kind: "post",
      title: "Aprendendo Kubernetes",
      description: "Pods e Services",
      href: "/blog/k8s",
      keywords: ["kubernetes"],
    },
    {
      kind: "post",
      title: "DWDM coerente",
      description: "Transmissão óptica",
      href: "/blog/dwdm",
      keywords: ["optica"],
    },
    {
      kind: "product",
      title: "Case Raspberry Pi",
      description: "Homelab",
      href: "/shop/case",
      keywords: ["homelab"],
    },
  ];

  it("normaliza acentos e caixa", () => {
    expect(normalize("Óptica ÇÃO")).toBe("optica cao");
  });

  it("exige todos os termos e prioriza o título", () => {
    expect(searchEntries(entries, "optica").map((e) => e.href)).toEqual(["/blog/dwdm"]);
    expect(searchEntries(entries, "kubernetes pods")[0]?.href).toBe("/blog/k8s");
    expect(searchEntries(entries, "kubernetes inexistente")).toHaveLength(0);
    expect(searchEntries(entries, "  ")).toHaveLength(3);
  });
});

describe("tema", () => {
  it("resolve preferências e alterna em ciclo", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
    expect(nextPreference("system")).toBe("light");
    expect(nextPreference("dark")).toBe("system");
  });

  it("script inicial aplica o tema antes da pintura", () => {
    const documentElement = { dataset: {} as Record<string, string> };
    const sandbox = {
      localStorage: { getItem: () => "dark" },
      window: { matchMedia: () => ({ matches: false }) },
      document: { documentElement },
    };
    new Function("localStorage", "window", "document", themeInitScript)(
      sandbox.localStorage,
      sandbox.window,
      sandbox.document,
    );
    expect(documentElement.dataset).toEqual({ theme: "dark", themePreference: "dark" });
  });
});

describe("RSS e JSON-LD", () => {
  it("escapa XML", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;",
    );
  });

  it("gera feed válido", () => {
    const xml = buildRssFeed({
      title: "Blog",
      description: "D",
      siteUrl: "https://ex.com",
      feedUrl: "https://ex.com/feed.xml",
      items: [
        {
          title: "A & B",
          description: "x",
          url: "https://ex.com/blog/a",
          date: "2026-01-02",
          tags: ["t"],
        },
      ],
    });
    expect(xml).toContain("<title>A &amp; B</title>");
    expect(xml).toContain("<pubDate>Fri, 02 Jan 2026 12:00:00 GMT</pubDate>");
    expect(xml).toContain("<category>t</category>");
  });

  it("JSON-LD não permite fechar a tag <script>", () => {
    expect(serializeJsonLd({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
