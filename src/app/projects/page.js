import Image from 'next/image'
import { FiExternalLink } from 'react-icons/fi'

export const metadata = {
  title: 'Projects - Leonardo Saads',
  description: 'Meus projetos e trabalhos',
}

const projects = [
  {
    title: 'A Search Engine',
    description: 'What if you could look up any information in the world? Webpages, images, videos and more. Google has many features to help you find exactly what you\'re looking for.',
    image: '/project-images/exemplo_imagem_01.jpg',
    url: 'https://google.com',
  },
  {
    title: 'The Time Machine',
    description: 'Imagine being able to travel back in time or to the future. Simple turn the knob to the desired date and press "Go". No more worrying about lost keys or forgotten headphones with this simple yet affordable solution.',
    image: '/project-images/exemplo_imagem_02.jpg',
    url: 'https://exemplo.com',
  },
  // Adicione mais projetos aqui
]

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Projects
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <a
            key={index}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-xl transition-all duration-300"
          >
            {/* Project Image */}
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Project Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h2>
                <FiExternalLink className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {project.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}