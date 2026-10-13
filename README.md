# Leonardo Saads — Engenharia, Telecomunicações e Software

Blog técnico com projeto editorial de **publicação acadêmica** — resumo, figuras e equações numeradas, notas de margem e referências ABNT — e **figuras interativas no próprio texto**: simuladores, calculadoras, um modelo 3D de fibra óptica e código executável no navegador. Cada artigo tem uma ilustração gerada por código a partir do seu tema.

**Produção:** [blog.leonardosaads.com.br](https://blog.leonardosaads.com.br)

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Requisitos](#requisitos)
- [Início rápido](#início-rápido)
- [Scripts](#scripts)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Escrevendo artigos](#escrevendo-artigos)
- [Projeto editorial](#projeto-editorial)
- [Figuras interativas](#figuras-interativas)
- [Arte generativa](#arte-generativa)
- [Desempenho](#desempenho)
- [Segurança](#segurança)
- [Testes e CI](#testes-e-ci)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Visão geral

| Recurso           | Descrição                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Artigos revisados | MDX validado por esquema (Zod); build falha com frontmatter inválido                                                              |
| Referências ABNT  | Toda publicação exige referências; `<Cite id>` gera citações numeradas e a lista NBR 6023                                         |
| Projeto editorial | Resumo, palavras-chave e pontos-chave por artigo; figuras, listagens, definições e equações numeradas; notas de margem; glossário |
| Figuras no texto  | Fibra óptica 3D, sinais/PID 1, FHS, exposição de portas, PromQL `rate()`, OIDs SNMP, complexidade, Kubernetes, DWDM/OSNR/Q/OTN    |
| Código executável | JavaScript e Python (Pyodide/WebAssembly) em Web Workers isolados, com CSP própria e timeout                                      |
| Arte generativa   | SVG determinístico por artigo (semente = slug) na capa, nos cards e na imagem Open Graph                                          |
| Leitura           | Sumário com scroll-spy, progresso de leitura (CSS), busca Ctrl+K, filtros por área/tag, tema claro/escuro/sistema, "Como citar"   |
| SEO               | Metadados, Open Graph gerado, JSON-LD (`BlogPosting` com `abstract`, `articleSection` e `citation`), sitemap, robots, RSS         |
| Qualidade         | TypeScript estrito, ESLint, Vitest, Playwright + axe (WCAG 2.2 AA) e CI no GitHub Actions                                         |

## Stack

- **Next.js 16** (App Router, Turbopack, SSG) + **React 19**
- **TypeScript 6** (estrito; o TypeScript 7 nativo ainda não expõe a API usada pelo `typescript-eslint`)
- **Tailwind CSS 4** + `@tailwindcss/typography`
- **MDX 3** (`@mdx-js/mdx`) com remark-gfm, remark-math/rehype-katex, rehype-slug, Shiki
- **Zod 4** (validação do frontmatter)
- **three.js** (modelo 3D da fibra, carregado sob demanda)
- **Source Serif 4** (leitura) e **Geist** (interface), auto-hospedadas
- **Vitest 5** + Testing Library · **Playwright** + **axe-core**
- **Giscus** (comentários via GitHub Discussions, carregados sob demanda)

## Requisitos

- Node.js **22.12+** (CI usa a versão de `.nvmrc`, Node 24 LTS)
- npm 10+

## Início rápido

```bash
git clone https://github.com/leonardoSaaads/blog-devsecops.git
cd blog-devsecops
npm ci
npm run dev            # http://localhost:3000
```

Variável opcional:

| Variável               | Padrão                              | Uso                                       |
| ---------------------- | ----------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://blog.leonardosaads.com.br` | URLs canônicas, sitemap, RSS e Open Graph |

## Scripts

| Comando                              | Descrição                                                 |
| ------------------------------------ | --------------------------------------------------------- |
| `npm run dev`                        | Servidor de desenvolvimento                               |
| `npm run build` / `npm start`        | Build de produção (estático) e servidor                   |
| `npm run lint`                       | ESLint (regras do Next, React Hooks, a11y, TypeScript)    |
| `npm run typecheck`                  | Gera os tipos de rota e executa `tsc --noEmit`            |
| `npm test` / `npm run test:coverage` | Testes unitários e de componentes (Vitest)                |
| `npm run test:e2e`                   | Testes ponta a ponta (Playwright; requer `npm run build`) |
| `npm run check`                      | lint + typecheck + testes + build                         |

> Em ambientes com Chromium pré-instalado, aponte o executável com `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/caminho/do/chrome npm run test:e2e`.

## Estrutura de pastas

```text
blog-devsecops/
├── .github/
│   ├── workflows/ci.yml            # lint, typecheck, testes, auditoria, build e E2E
│   └── dependabot.yml              # um único PR semestral (npm + Actions)
├── content/
│   └── posts/*.mdx                 # artigos (frontmatter YAML + MDX)
├── e2e/                            # Playwright: jornada do leitor, figuras, SEO/segurança, a11y, mobile
├── public/
│   ├── images/                     # imagens dos artigos
│   ├── videos/                     # vídeos dos artigos
│   ├── workers/
│   │   ├── js-runner.js            # executor JavaScript (worker clássico, sem rede)
│   │   └── py-runner.mjs           # executor Python (Pyodide sob demanda)
│   └── icon.svg, easter-egg.png, profile-image.jpg
├── src/
│   ├── app/                        # rotas (App Router)
│   │   ├── layout.tsx              # HTML raiz, fontes, tema, cabeçalho/rodapé
│   │   ├── page.tsx                # home (capa, destaque, áreas, recentes, guia de leitura)
│   │   ├── blog/page.tsx           # listagem com busca e filtros (?q=&area=&tag=)
│   │   ├── blog/[slug]/            # artigo (capa, resumo, pontos-chave) + Open Graph por artigo
│   │   ├── tags/                   # tópicos: áreas e palavras-chave
│   │   ├── projects/, about/
│   │   ├── feed.xml/route.ts       # RSS
│   │   ├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
│   │   ├── not-found.tsx, error.tsx
│   │   └── globals.css             # tokens de design (claro/escuro) e estilos de artigo
│   ├── components/
│   │   ├── art/                    # CoverArt (<img> do SVG estático) e ArtSvg (SVG interativo)
│   │   ├── layout/                 # cabeçalho, navegação, busca (Ctrl+K), tema, rodapé
│   │   ├── blog/                   # cards, filtros, sumário, referências, citação, comentários
│   │   ├── mdx/                    # mapa MDX, Cite, callouts, figuras, cards, notas de margem, termos, definições
│   │   └── figures/                # figuras interativas numeradas e playground de código
│   ├── hooks/                      # tema, media queries, visibilidade, valores só-cliente
│   ├── lib/
│   │   ├── art/                    # motivos generativos determinísticos e exportação SVG/OG
│   │   ├── content/                # carregamento, esquema, áreas, MDX, ABNT, tempo de leitura, plugins
│   │   ├── simulations/            # lógica pura das figuras (óptica, fibra, k8s, sinais, PromQL, SNMP…)
│   │   ├── security/headers.ts     # CSP e cabeçalhos de segurança
│   │   └── site.ts, search.ts, feed.ts, structured-data.ts, og.tsx, format.ts, theme.ts
│   └── test/                       # setup do Vitest e substitutos de módulos do Next
├── next.config.ts                  # cabeçalhos, redirecionamentos, rotas tipadas
├── playwright.config.ts
├── vitest.config.mts
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```

## Escrevendo artigos

Crie `content/posts/meu-artigo.mdx` (o nome do arquivo é o slug):

````mdx
---
title: "Título do artigo"
description: "Resumo de 20 a 300 caracteres exibido nos cards e no SEO."
date: "2026-10-13"
updated: "2026-10-20" # opcional
tags: ["kubernetes", "devsecops"] # kebab-case minúsculo
category: infraestrutura # telecomunicacoes | infraestrutura | seguranca | software
art: lattice # spectrum | lattice | bits | network | ridgeline | radar | flamegraph | circuit | eye
abstract: "Resumo acadêmico de 120 a 900 caracteres, exibido no topo do artigo."
keyPoints: # de 3 a 4 conclusões principais
  - "O controlador compara o estado desejado ao atual."
  - "O Service oferece um endereço estável."
  - "Secrets são apenas codificados em base64."
references:
  - id: k8s-docs
    type: web # book | article | conference | standard | report | web | software
    authors: ["The Kubernetes Authors"] # pessoas: "Sobrenome, Prenome"
    title: "Deployments"
    container: "Kubernetes Documentation"
    year: 2026
    url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
    accessed: "2026-10-13"
---

O Deployment mantém o número desejado de réplicas<Cite id="k8s-docs" />.

<Definition term="Reconciliação">
  Ciclo em que o controlador aproxima o estado atual do desejado.
</Definition>

Texto com nota<Sidenote>Comentário na margem.</Sidenote> e <Term def="Definição em balão.">termo</Term>.

<CardGrid>
  <Card title="Pod" icon="box">
    Menor unidade implantável.
  </Card>
  <Card title="Service" icon="network" tone="signal">
    Endereço estável.
  </Card>
</CardGrid>

<K8sSimulator />

```python runnable title="Execute no navegador"
print("olá")
```
````

Regras verificadas automaticamente (build e testes):

- frontmatter válido, com **pelo menos uma referência**;
- todo `<Cite id>` aponta para uma referência existente e toda referência é citada;
- imagens locais existem; links internos `/blog/...` apontam para artigos existentes;
- todos os artigos compilam e renderizam.

Componentes de texto: `Cite`, `Callout`, `Figure`, `Video`, `Tabs`/`Tab`, `Quiz`, `Sidenote`, `Term`, `Definition`, `PullQuote`, `Card`/`CardGrid` (ícones de uma lista fechada). Fórmulas: `$$ … $$` (KaTeX, numeradas automaticamente).

## Projeto editorial

- **Capa** com a arte do artigo, área, título em serifa, linha fina e autor; em seguida o **Resumo** com palavras-chave e metadados, e os **Pontos-chave** em cards.
- **Numeração automática** por contadores CSS: `Figura n.`, `Listagem n.` (código executável), `Definição n.` e equações `(n)`, na ordem em que aparecem — sem JavaScript.
- **Notas de margem** (`<Sidenote>`): flutuam na coluna direita a partir de 80rem; em telas menores aparecem em linha.
- **Glossário em linha** (`<Term def>`): abre no hover, foco ou toque e fecha com Esc (WCAG 1.4.13).
- Layout em três colunas em telas largas: sumário à esquerda, texto (≈42rem) e margem para notas; figuras interativas avançam sobre a margem.

## Figuras interativas

Cada figura é um componente MDX numerado (`InteractiveFigure`) inserido no fluxo do texto. A lógica fica em `src/lib/simulations/` como funções puras com testes; os componentes em `src/components/figures/` apenas desenham o estado.

| Figura                                                                                                                        | Artigo                  |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `Fiber3D`, `DwdmGridCalculator`, `FiberBandsChart`, `OsnrCalculator`, `QBerCalculator`, `ConstellationViewer`, `OtnHierarchy` | DWDM                    |
| `PermissionLab`, `SignalSimulator`, `FilesystemExplorer`                                                                      | Linux                   |
| `PortExposure`                                                                                                                | Cloudflare Tunnel       |
| `RateExplainer`                                                                                                               | Monitoramento           |
| `MibExplorer`                                                                                                                 | Zabbix/SNMP             |
| `K8sSimulator`                                                                                                                | Kubernetes              |
| `ComplexityChart`, `CodePlayground`                                                                                           | Velocidade de linguagem |
| `ArtExplorer`, `CodePlayground`                                                                                               | Bastidores              |

O modelo 3D usa three.js importado dinamicamente quando a figura entra na tela, pausa fora dela, não captura o zoom da página e tem corte transversal em SVG como alternativa sem WebGL. Os playgrounds executam código em **Web Workers**:

| Executor        | Isolamento                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `js-runner.js`  | Worker novo por execução; CSP `default-src 'none'; script-src 'unsafe-eval'` (sem rede); timeout de 5 s; saída limitada   |
| `py-runner.mjs` | Pyodide 314.0.7 baixado sob demanda de `cdn.jsdelivr.net` (única origem permitida); namespace limpo por execução; timeout |

## Arte generativa

`src/lib/art/motifs.ts` define nove motivos ligados aos temas (espectro DWDM, malha de nós, matriz de bits, rede e túneis, séries temporais, radar, flame graph, circuito e diagrama de olho). A semente é o hash FNV-1a do slug e o PRNG é o mulberry32: a mesma entrada gera sempre o mesmo SVG.

- **Arquivo estático, não HTML:** a rota `src/app/art/[motif]/[file]/route.ts` pré-gera no build um SVG por arte usada (`/art/<motivo>/<semente>.svg`, catálogo em `src/lib/art/catalog.ts`). Capas e cards usam `CoverArt`, um `<img>` com `loading="lazy"` (a capa do artigo usa `fetchpriority="high"`). Antes, os SVGs iam embutidos no HTML e no payload do React: a home tinha 1,9 MB e milhares de nós para hidratar.
- **SVG enxuto:** polilinhas com coordenadas relativas, curvas de Bézier e formas de mesma pintura agrupadas em um só `<path>` (todos os arquivos < 70 KB, verificado em teste).
- **Estáticas por desempenho:** animar elementos internos de um SVG de tela cheia força a re-rasterização a cada quadro e, medido sem GPU, ocupava dois núcleos de CPU com a página parada; o E2E garante que a capa não tenha animações infinitas. Só o explorador do artigo de bastidores (`ArtSvg`) desenha a arte em linha, com animação opcional.
- As imagens Open Graph usam o mesmo SVG como data URI.

## Desempenho

Medido simulando um visitante novo (cache vazio, CPU 4× mais lenta, rede 4G) que navega pela home, um artigo com figura 3D, a busca, o simulador e as listagens:

| Métrica                                 | Antes                                                  | Depois       |
| --------------------------------------- | ------------------------------------------------------ | ------------ |
| HTML da home (transferido)              | 348 KB                                                 | 19 KB        |
| Prefetch de rotas (dados RSC) na sessão | 2,85 MB                                                | 0,67 MB      |
| Nós de DOM na home                      | 2 767                                                  | 476          |
| Fontes pré-carregadas em toda página    | 4 (≈ 393 KB)                                           | 3 (≈ 173 KB) |
| Avisos/erros no console                 | API obsoleta (`THREE.Clock`), preload de CSS não usado | nenhum       |

Outras medidas: código de cada figura interativa carregado só nos artigos que a usam (`next/dynamic`), Giscus baixado só ao chegar aos comentários, three.js só quando a fibra entra na tela, CSS do KaTeX global (evita preload desperdiçado no prefetch) e altura reservada no simulador de Kubernetes (CLS de 0,043 para 0,007).

## Segurança

- **CSP** restritiva (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`); iframes apenas do Giscus. `script-src` permite `'unsafe-inline'` por ser um site estático (nonces exigiriam renderização por requisição).
- **HSTS** com preload, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, sem `X-Powered-By`.
- Workers com CSP própria; JSON-LD serializado com escape; slugs resolvidos somente a partir da lista carregada (sem path traversal).
- Fontes auto-hospedadas; comentários e three.js carregados sob demanda; nenhuma imagem de capa externa.
- Auditoria de dependências de produção no CI. Dependabot em um único PR semestral (npm + GitHub Actions); alertas de segurança continuam imediatos. Exceções documentadas em `.github/dependabot.yml`: TypeScript 7 (sem suporte do typescript-eslint) e majors de `@types/node` (acompanham o `.nvmrc`).

## Testes e CI

| Camada         | Ferramenta                       | Cobertura                                                                                                                |
| -------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Unitários      | Vitest                           | conteúdo (todos os artigos), ABNT, arte, óptica, fibra, k8s, sinais, exposição, PromQL, SNMP, complexidade, CSP          |
| Componentes    | Vitest + Testing Library (jsdom) | figuras interativas, glossário, notas, cards, playground, tema, busca, filtros, abas, quiz                               |
| E2E            | Playwright                       | jornada do leitor, layout acadêmico, figuras (inclusive WebGL), busca, tema, cabeçalhos, SEO, mobile sem rolagem lateral |
| Acessibilidade | axe-core                         | WCAG 2.2 AA nos temas claro e escuro                                                                                     |

O workflow `.github/workflows/ci.yml` roda em cada push/PR com permissões mínimas (`contents: read`).

## Deploy

Compatível com Vercel ou qualquer plataforma que execute `next start`. Na Vercel, importe o repositório; o build é detectado automaticamente. Defina `NEXT_PUBLIC_SITE_URL` se o domínio mudar. Os cabeçalhos de segurança são aplicados pelo próprio Next (`next.config.ts`).

Links antigos continuam válidos: `/blog/hello-world` → `/blog/bastidores-do-blog` e `/tags/MAIUSCULA` → `/tags/minuscula` (308). Os slugs dos artigos foram preservados para manter a associação com as discussões do Giscus.

## Licença

Código sob licença [MIT](LICENSE). O conteúdo dos artigos pertence ao autor.

**Contato:** [GitHub](https://github.com/leonardoSaaads) · [LinkedIn](https://www.linkedin.com/in/leonardo-saads-pinto-5a61731b4/)
