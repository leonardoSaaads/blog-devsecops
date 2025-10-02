import Image from 'next/image'

const components = {
  h1: (props) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
  ),
  p: (props) => (
    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300" {...props} />
  ),
  li: (props) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-4 border-cyan-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />
  ),
  code: (props) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-cyan-600 dark:text-cyan-400" {...props} />
  ),
  pre: (props) => (
    <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto my-6" {...props} />
  ),
  a: (props) => (
    <a className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 underline" {...props} />
  ),
  img: (props) => (
    <Image
      {...props}
      width={800}
      height={400}
      className="rounded-lg my-6"
      alt={props.alt || ''}
    />
  ),
  hr: () => (
    <hr className="my-8 border-gray-300 dark:border-gray-700" />
  ),
}

export default components