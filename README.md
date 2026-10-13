# Leonardo Saads — Blog DevSecOps

Blog técnico **interativo** sobre DevSecOps, observabilidade, Linux, Kubernetes e telecomunicações ópticas, com laboratórios executáveis no navegador e loja de modelos 3D.

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
- [Laboratórios interativos](#laboratórios-interativos)
- [Loja 3D](#loja-3d)
- [Segurança](#segurança)
- [Testes e CI](#testes-e-ci)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Visão geral

| Recurso           | Descrição                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Artigos revisados | MDX validado por esquema (Zod); build falha com frontmatter inválido                                                               |
| Referências ABNT  | Toda publicação exige referências; `<Cite id>` gera citações numeradas e a lista NBR 6023                                          |
| Laboratórios      | Simulador de Kubernetes, calculadoras ópticas (grid DWDM, OSNR, Q/BER, constelações), permissões Unix, diagramas animados, quizzes |
| Código executável | JavaScript e Python (Pyodide/WebAssembly) em Web Workers isolados, com CSP própria e timeout                                       |
| Loja 3D           | Visualizador three.js (STL/GLB), cor do filamento, malha, tela cheia; pedido por e-mail ou checkout externo                        |
| Leitura           | Sumário com scroll-spy, progresso de leitura (CSS), busca Ctrl+K, tema claro/escuro/sistema, "Como citar"                          |
| SEO               | Metadados, Open Graph gerado, JSON-LD (`BlogPosting` com `citation`, `Product`), sitemap, robots, RSS                              |
| Qualidade         | TypeScript estrito, ESLint, Vitest, Playwright + axe (WCAG 2.2 AA) e CI no GitHub Actions                                          |

## Stack

- **Next.js 16** (App Router, Turbopack, SSG) + **React 19**
- **TypeScript 6** (estrito; o TypeScript 7 nativo ainda não expõe a API usada pelo `typescript-eslint`)
- **Tailwind CSS 4** + `@tailwindcss/typography`
- **MDX 3** (`@mdx-js/mdx`) com remark-gfm, remark-math/rehype-katex, rehype-slug, Shiki
- **Zod 4** (validação de conteúdo e catálogo)
- **three.js** (visualizador 3D, carregado sob demanda)
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
| `npm run models:generate`            | Regenera os modelos STL de exemplo em `public/models/`    |
| `npm run check`                      | lint + typecheck + testes + build                         |

> Em ambientes com Chromium pré-instalado, aponte o executável com `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/caminho/do/chrome npm run test:e2e`.

## Estrutura de pastas

```text
blog-devsecops/
├── .github/
│   ├── workflows/ci.yml            # lint, typecheck, testes, auditoria, build e E2E
│   └── dependabot.yml              # atualizações semanais (npm e Actions)
├── content/
│   ├── posts/*.mdx                 # artigos (frontmatter YAML + MDX)
│   └── products.json               # catálogo da loja 3D (validado por Zod)
├── e2e/                            # Playwright: jornadas de usuário, labs, loja, SEO/segurança, a11y, mobile
├── public/
│   ├── images/                     # imagens dos artigos
│   ├── models/                     # modelos STL e pôsteres (posters/*.png)
│   ├── videos/                     # vídeos dos artigos
│   ├── workers/
│   │   ├── js-runner.js            # executor JavaScript (worker clássico, sem rede)
│   │   └── py-runner.mjs           # executor Python (Pyodide sob demanda)
│   └── icon.svg, easter-egg.png, profile-image.jpg
├── scripts/
│   └── generate-models.mjs         # gera os STL de exemplo com three.js
├── src/
│   ├── app/                        # rotas (App Router)
│   │   ├── layout.tsx              # HTML raiz, fontes, tema, cabeçalho/rodapé
│   │   ├── page.tsx                # home
│   │   ├── blog/page.tsx           # listagem com busca e filtros (?q=&tag=)
│   │   ├── blog/[slug]/            # artigo + imagem Open Graph por artigo
│   │   ├── tags/, shop/, projects/, about/
│   │   ├── feed.xml/route.ts       # RSS
│   │   ├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
│   │   ├── not-found.tsx, error.tsx
│   │   └── globals.css             # tokens de design (claro/escuro) e estilos de artigo
│   ├── components/
│   │   ├── layout/                 # cabeçalho, navegação, busca (Ctrl+K), tema, rodapé
│   │   ├── blog/                   # cards, filtros, sumário, referências, citação, comentários
│   │   ├── mdx/                    # mapa de componentes MDX, código, callouts, figuras, abas, quiz, Cite
│   │   ├── labs/                   # laboratórios interativos e playground de código
│   │   ├── shop/                   # visualizador 3D e cards de produto
│   │   └── home/                   # terminal animado do hero
│   ├── hooks/                      # tema, media queries, visibilidade, valores só-cliente
│   ├── lib/
│   │   ├── content/                # carregamento, esquema, MDX, ABNT, tempo de leitura, plugins
│   │   ├── labs/                   # lógica pura dos laboratórios (óptica, k8s, permissões, playground)
│   │   ├── shop/                   # esquema e catálogo
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
labs: ["Simulador de Deployment"] # opcional: laboratórios do artigo
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

<Callout type="security">Nunca versione segredos.</Callout>

```python runnable title="Execute no navegador"
print("olá")
```
````

Regras verificadas automaticamente (build e testes):

- frontmatter válido, com **pelo menos uma referência**;
- todo `<Cite id>` aponta para uma referência existente e toda referência é citada;
- imagens locais existem; links internos `/blog/...` apontam para artigos existentes;
- todos os artigos compilam e renderizam.

Componentes disponíveis no MDX: `Cite`, `Callout`, `Figure`, `Video`, `Tabs`/`Tab`, `Quiz`, `FlowDiagram`, `CodePlayground` (ou blocos `runnable`), `PermissionLab`, `K8sSimulator`, `DwdmGridCalculator`, `OsnrCalculator`, `QBerCalculator`, `ConstellationViewer`, `FiberBandsChart`, `OtnHierarchy`. Fórmulas: `$$ … $$` (KaTeX).

## Laboratórios interativos

A lógica de cada laboratório fica em `src/lib/labs/` como funções puras com testes; os componentes em `src/components/labs/` apenas desenham o estado. Os playgrounds executam código em **Web Workers**:

| Executor        | Isolamento                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `js-runner.js`  | Worker novo por execução; CSP `default-src 'none'; script-src 'unsafe-eval'` (sem rede); timeout de 5 s; saída limitada   |
| `py-runner.mjs` | Pyodide 314.0.7 baixado sob demanda de `cdn.jsdelivr.net` (única origem permitida); namespace limpo por execução; timeout |

## Loja 3D

Edite `content/products.json`. Campos principais: `slug`, `name`, `price.amount` (centavos), `status` (`available`, `made-to-order`, `coming-soon`), `model.src` (`/models/*.stl|glb`), `poster` e, opcionalmente, `checkoutUrl` (HTTPS — ex.: Stripe Payment Link, Mercado Pago, Gumroad). Sem `checkoutUrl`, o botão abre um pedido por e-mail.

> Os três produtos atuais são **exemplos** gerados por `scripts/generate-models.mjs`; substitua pelos seus modelos, preços e links de pagamento.

## Segurança

- **CSP** restritiva (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`); iframes apenas do Giscus. `script-src` permite `'unsafe-inline'` por ser um site estático (nonces exigiriam renderização por requisição).
- **HSTS** com preload, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, sem `X-Powered-By`.
- Workers com CSP própria; JSON-LD serializado com escape; slugs resolvidos somente a partir da lista carregada (sem path traversal).
- Fontes auto-hospedadas; comentários e three.js carregados sob demanda.
- Auditoria de dependências de produção no CI e Dependabot semanal.

## Testes e CI

| Camada         | Ferramenta                       | Cobertura                                                                                                      |
| -------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Unitários      | Vitest                           | conteúdo (todos os artigos), ABNT, óptica, k8s, permissões, playground/worker, catálogo, CSP, RSS, busca, tema |
| Componentes    | Vitest + Testing Library (jsdom) | laboratórios, playground, tema, busca, filtros, abas, quiz, easter egg                                         |
| E2E            | Playwright                       | jornada do leitor, navegação, busca, tema, laboratórios, loja 3D (WebGL), cabeçalhos, SEO, mobile              |
| Acessibilidade | axe-core                         | WCAG 2.2 AA nos temas claro e escuro                                                                           |

O workflow `.github/workflows/ci.yml` roda em cada push/PR com permissões mínimas (`contents: read`).

## Deploy

Compatível com Vercel ou qualquer plataforma que execute `next start`. Na Vercel, importe o repositório; o build é detectado automaticamente. Defina `NEXT_PUBLIC_SITE_URL` se o domínio mudar. Os cabeçalhos de segurança são aplicados pelo próprio Next (`next.config.ts`).

Links antigos continuam válidos: `/blog/hello-world` → `/blog/bastidores-do-blog` e `/tags/MAIUSCULA` → `/tags/minuscula` (308). Os slugs dos artigos foram preservados para manter a associação com as discussões do Giscus.

## Licença

Código sob licença [MIT](LICENSE). O conteúdo dos artigos pertence ao autor.

**Contato:** [GitHub](https://github.com/leonardoSaaads) · [LinkedIn](https://www.linkedin.com/in/leonardo-saads-pinto-5a61731b4/)
