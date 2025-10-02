import { getAllTags, getPostsByTag } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: tag,
  }))
}

export async function generateMetadata({ params }) {
  const { tag } = await params
  
  return {
    title: `Posts sobre ${tag} - Leonardo Saads`,
    description: `Todos os posts sobre ${tag}`,
  }
}

export default async function TagPage({ params }) {
  const { tag } = await params
  const posts = getPostsByTag(tag)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/tags"
        className="inline-flex items-center space-x-2 text-cyan-500 dark:text-cyan-400 hover:underline mb-8"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Todas as tags</span>
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          #{tag}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {posts.length} {posts.length === 1 ? 'post encontrado' : 'posts encontrados'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}