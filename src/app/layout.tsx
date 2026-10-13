import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { EasterEgg } from "@/components/layout/easter-egg";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.linkedin }],
  creator: site.author.name,
  keywords: [
    "DevSecOps",
    "Observabilidade",
    "Kubernetes",
    "Linux",
    "DWDM",
    "Telecom",
    "Docker",
    "Impressão 3D",
  ],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} — RSS` }] },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
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
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="light"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-lg bg-accent px-4 py-2 text-accent-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <EasterEgg />
      </body>
    </html>
  );
}
