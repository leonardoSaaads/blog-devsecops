import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import { FiArrowRight, FiCode, FiShield, FiZap } from 'react-icons/fi'

export default function Home() {
  const posts = getAllPosts().slice(0, 3) // Últimos 3 posts

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Latest
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Blog pessoal sobre DevSecOps, Segurança da Informação, Desenvolvimento e Tecnologia.
        </p>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Segurança</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Práticas e ferramentas de segurança aplicadas ao desenvolvimento
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiCode className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">DevOps</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automação, CI/CD e melhores práticas de infraestrutura
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiZap className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cloud</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Arquiteturas escaláveis e soluções em nuvem
            </p>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Posts Recentes
          </h2>
          <Link
            href="/blog"
            className="flex items-center space-x-2 text-cyan-500 dark:text-cyan-400 hover:underline font-medium"
          >
            <span>Ver todos</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}