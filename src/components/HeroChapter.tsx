'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export function HeroChapter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        style={{ y, opacity }}
        className="z-10 text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mono text-accent-secondary mb-4 tracking-widest text-sm uppercase"
        >
          System Initialized
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)] text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
        >
          RAUNAK PATIL
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-2xl md:text-3xl text-text-muted font-light"
        >
          Architecting Production-Grade <span className="text-accent-primary font-bold">AI</span>
        </motion.h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted"
      >
        <span className="mono text-xs text-text-muted">Scroll to Interface</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="text-accent-primary opacity-50 w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
