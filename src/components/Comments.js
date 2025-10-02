'use client'

import Giscus from '@giscus/react'

export default function Comments() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <Giscus
        repo="seu-usuario/seu-repo" // Alterar depois
        repoId="seu-repo-id" // Alterar depois
        category="General"
        categoryId="seu-category-id" // Alterar depois
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="pt"
        loading="lazy"
      />
    </div>
  )
}