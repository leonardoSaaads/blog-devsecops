import Image from 'next/image'
import { FiMail, FiGithub, FiLinkedin } from 'react-icons/fi'

export const metadata = {
  title: 'About - Leonardo Saads',
  description: 'Sobre Leonardo Saads Pinto',
}

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-12">
        About
      </h1>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Left Side - Profile */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            {/* Profile Image */}
            <div className="relative w-48 h-48 mx-auto md:mx-0 mb-6">
              <Image
                src="/profile-image.png"
                alt="Leonardo Saads Pinto"
                sizes="(max-width: 817px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                className="rounded-full object-cover border-4 border-cyan-500 dark:border-cyan-400"
                priority
              />
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center md:text-left">
              Leonardo Saads Pinto
            </h2>

            {/* Role */}
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center md:text-left">
              Telecommunications Engineer | DevOps | Observability & Monitoring
            </p>

            {/* University */}
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6 text-center md:text-left">
              University of Rio Grande do Norte
            </p>

            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="mailto:leonadospinto@hotmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                aria-label="Email"
              >
                <FiMail className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/leonardosaaads"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/leonardo-saads-pinto-5a61731b4/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Bio */}
        <div className="md:col-span-2">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Leonardo Saads Pinto is a telecommunications engineering student and research 
              developer with a focus on observability systems, RF engineering, and process 
              automation.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              He currently contributes to national-level spectrum monitoring initiatives at 
              ANATEL, leads DevOps and NOC operations at MW Solutions, and conducts applied 
              research in machine learning for coherent optical systems.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              His technical repertoire includes Docker-based infrastructure, signal processing, 
              and full-stack observability with Grafana, Zabbix, and Prometheus. In his free 
              time he debugs Python scripts and mentors peers in differential equations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}