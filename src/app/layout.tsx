import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { EasterEgg } from "@/components/layout/easter-egg";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/config/site";
import { themeInitScript } from "@/lib/theme";
// Global KaTeX CSS (≈6 KB compressed): as CSS scoped to the article route, Next preloaded
// it on every prefetch and the browser warned that the resource went unused.
import "katex/dist/katex.min.css";
import "./globals.css";

// Self-hosted serif reading font. Weight axis (wght) only: the optical-size (opsz) variant
// cost 2.4× more (122 KB vs. 51 KB per style) and was preloaded on every page.
const serif = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  weight: "200 900",
  variable: "--font-serif-text",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

// The monospace font only appears in code and labels: loaded on demand, no preload.
const mono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.linkedin }],
  creator: site.author.name,
  keywords: [
    "DWDM",
    "Optical networks",
    "Telecommunications",
    "Linux",
    "DevSecOps",
    "Observability",
  ],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} — RSS` }] },
  },
  openGraph: {
    type: "website",
    locale: site.ogLocale,
    siteName: site.name,
    url: site.url,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1220" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={site.locale}
      data-theme="light"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${mono.variable} ${serif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#content"
          className="sr-only z-50 rounded-lg bg-accent px-4 py-2 text-accent-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <EasterEgg />
      </body>
    </html>
  );
}
