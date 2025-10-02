import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { formatDate, readingTime } from '@/lib/utils'
import { MDXRemote } from 'next-mdx-remote/rsc'
import MDXComponents from '@/components/MDXComponents'
import Comments from '@/components/Comments'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiClock, FiArrowLeft } from 'react-icons/fi'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  return {
    title: `${post.frontmatter.title} - Leonardo Saads`,
    description: post.frontmatter.description,
  }
}

export default async function PostPage({ params }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const readTime = readingTime(post.content)

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center space-x-2 text-cyan-500 dark:text-cyan-400 hover:underline mb-8"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Voltar ao blog</span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.frontmatter.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 uppercase tracking-wide hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {post.frontmatter.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
          <span className="flex items-center space-x-2">
            <FiCalendar className="w-4 h-4" />
            <time dateTime={post.frontmatter.date}>
              {formatDate(post.frontmatter.date)}
            </time>
          </span>
          <span className="flex items-center space-x-2">
            <FiClock className="w-4 h-4" />
            <span>{readTime}</span>
          </span>
        </div>
      </header>

      {/* Featured Image */}
      {post.frontmatter.image && (
        <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <MDXRemote
          source={post.content}
          components={MDXComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight],
            },
          }}
        />
      </div>

      {/* Comments */}
      <Comments />
    </article>
  )
}