'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface StoryChapterProps {
  chapter: string
  title: string
  subtitle?: string
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
}

export function StoryChapter({ chapter, title, subtitle, children, align = 'left' }: StoryChapterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2], [100, 0])

  return (
    <section ref={ref} className="relative min-h-[120vh] flex items-center py-32 pointer-events-none">
      <div className="w-full max-w-7xl mx-auto px-6 pointer-events-auto">
        <motion.div 
          style={{ opacity, y }}
          className={cn(
            "max-w-2xl",
            align === 'center' && "mx-auto text-center",
            align === 'right' && "ml-auto"
          )}
        >
          <div className="mono text-accent-secondary mb-6 text-sm">{chapter}</div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{title}</h2>
          {subtitle && <h3 className="text-2xl text-accent-primary mb-8 font-light">{subtitle}</h3>}
          
          <div className="text-lg md:text-xl text-text-muted leading-relaxed space-y-6">
            {children}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
