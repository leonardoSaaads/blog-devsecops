import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi'

export default function PostCard({ post }) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300">
      {post.image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <FiCalendar className="w-4 h-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
            {post.readingTime && (
              <span className="flex items-center space-x-1">
                <FiClock className="w-4 h-4" />
                <span>{post.readingTime}</span>
              </span>
            )}
          </div>
          
          <Link
            href={`/blog/${post.slug}`}
            className="flex items-center space-x-1 text-cyan-500 dark:text-cyan-400 hover:underline font-medium"
          >
            <span>Ler mais</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}