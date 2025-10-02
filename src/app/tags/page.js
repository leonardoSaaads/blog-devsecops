import { getAllTags, getPostsByTag } from '@/lib/posts'
import Link from 'next/link'

export const metadata = {
  title: 'Tags - Leonardo Saads',
  description: 'Explore posts por tags',
}

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Tags
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Navegue por tópicos de interesse
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => {
          const postsCount = getPostsByTag(tag).length
          return (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="group px-6 py-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                  #{tag}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400">
                  {postsCount}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}