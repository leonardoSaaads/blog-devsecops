import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Leonardo Saads - DevSecOps Blog',
  description: 'Blog pessoal sobre DevSecOps, Segurança da Informação, Desenvolvimento e Tecnologia',
  keywords: ['DevSecOps', 'Segurança', 'Cloud', 'DevOps', 'Desenvolvimento'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 transition-colors`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>© {new Date().getFullYear()} Leonardo Saads. Todos os direitos reservados.</p>
              <p className="mt-2 text-sm">Construído com Next.js e Tailwind CSS</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}