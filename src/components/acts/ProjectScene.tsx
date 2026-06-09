'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GithubRepo } from '@/lib/github'

// SVG Metaphors based on Topics/Language
function SvgSwarm({ progress }: { progress: any }) {
  const pathLength = useTransform(progress, [0, 0.5], [0, 1])
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  return (
    <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      {/* Abstract swarm lines */}
      {[...Array(20)].map((_, i) => (
        <motion.path 
          key={i}
          d={`M${(Math.sin(i*13)*50+50).toFixed(2)} ${(Math.cos(i*17)*50+50).toFixed(2)} Q 50 50, ${(Math.sin(i*23)*50+50).toFixed(2)} ${(Math.cos(i*29)*50+50).toFixed(2)}`}
          stroke="#00f0ff" strokeWidth="0.1" fill="transparent"
          style={{ pathLength }}
        />
      ))}
    </motion.svg>
  )
}

function SvgNeural({ progress }: { progress: any }) {
  const pathLength = useTransform(progress, [0, 0.5], [0, 1])
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  return (
    <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <motion.path d="M50 50 L20 20 M50 50 L80 20 M50 50 L20 80 M50 50 L80 80" stroke="#bc13fe" strokeWidth="0.2" style={{ pathLength }} />
      <motion.circle cx="50" cy="50" r="2" fill="#ffffff" style={{ opacity: pathLength }} />
    </motion.svg>
  )
}

function SvgDataPillars({ progress }: { progress: any }) {
  const pathLength = useTransform(progress, [0, 0.5], [0, 1])
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  return (
    <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      {[20, 50, 80].map(x => (
        <motion.rect key={x} x={x-5} y="10" width="10" height="80" stroke="#00ff88" strokeWidth="0.1" fill="transparent" style={{ pathLength }} />
      ))}
    </motion.svg>
  )
}

function SvgFactory({ progress }: { progress: any }) {
  const pathLength = useTransform(progress, [0, 0.5], [0, 1])
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  return (
    <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <motion.rect x="30" y="30" width="40" height="40" stroke="#f7df1e" strokeWidth="0.2" fill="transparent" style={{ pathLength }} />
      <motion.path d="M30 30 L70 70 M30 70 L70 30" stroke="#f7df1e" strokeWidth="0.1" style={{ pathLength }} />
    </motion.svg>
  )
}

export function ProjectScene({ repo, index }: { repo: GithubRepo, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Track scroll for this specific 300vh section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Text fades in only during the second half (0.5 to 0.7)
  const textOpacity = useTransform(scrollYProgress, [0.4, 0.6, 0.8, 1], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0.4, 0.6], [50, 0])

  // Determine Metaphor
  const topics = repo.topics || []
  const isAgent = topics.includes('ai-agents') || topics.includes('automation')
  const isAI = topics.includes('generative-ai') || topics.includes('llm') || topics.includes('resume')
  const isData = repo.language === 'Python' && !isAgent
  
  let MetaphorSVG = SvgFactory
  if (isAgent) MetaphorSVG = SvgSwarm
  else if (isAI) MetaphorSVG = SvgNeural
  else if (isData) MetaphorSVG = SvgDataPillars

  return (
    <section ref={ref} className="relative h-[300vh] w-full flex flex-col items-center justify-center bg-transparent">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center p-6 text-white overflow-hidden pointer-events-none">
        
        {/* The SVG Metaphor fills the screen */}
        <div className="absolute inset-0 z-0">
          <MetaphorSVG progress={scrollYProgress} />
        </div>

        {/* The Delayed Text Reveal */}
        <motion.div 
          className="relative z-10 max-w-4xl text-center drop-shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl"
          style={{ opacity: textOpacity, y: textY }}
        >

          <h2 className="text-5xl md:text-8xl font-bold mb-6 tracking-tight text-[#00f0ff]">
            {repo.name}
          </h2>
          <p className="text-xl md:text-3xl font-light text-gray-300 leading-relaxed mb-8">
            {repo.description || "Experimental architecture and codebase."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {repo.language && (
              <span className="px-3 py-1 border border-gray-600 rounded-full text-sm font-mono text-gray-300 bg-black/50 backdrop-blur-sm">
                {repo.language}
              </span>
            )}
            {repo.topics?.slice(0, 3).map(topic => (
              <span key={topic} className="px-3 py-1 border border-[#bc13fe]/30 rounded-full text-sm font-mono text-[#bc13fe] bg-black/50 backdrop-blur-sm">
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
