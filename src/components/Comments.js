'use client'

import Giscus from '@giscus/react'

// Acesse https://giscus.app/pt e siga as instruções para configurar o Giscus
// Copie as métricas do seu repositório publico e cole nas props do componente abaixo

export default function Comments() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <Giscus
        repo="leonardoSaaads/blog-devsecops" // COLOQUE AS MÉTRICAS DO SEU REPOSITÓRIO
        repoId="R_kgDOP7RkyQ"                // COLOQUE AS MÉTRICAS DO SEU REPOSITÓRIO
        category="General"
        categoryId="DIC_kwDOP7Rkyc4CwLqY"    // COLOQUE AS MÉTRICAS DO SEU REPOSITÓRIO
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