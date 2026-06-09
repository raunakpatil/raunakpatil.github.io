'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Act7_Philosophy() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  })

  // Fade in and slide up slightly as the user scrolls into this section
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [50, 0])

  return (
    <section ref={containerRef} className="relative h-screen text-white w-full flex items-center justify-center overflow-hidden">
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/quote.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay to improve contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glassmorphism Card + Quote */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl px-8 py-12 mx-6
                   rounded-3xl border border-white/10
                   backdrop-blur-xl bg-white/5
                   shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{ opacity, y }}
      >
        <div className="text-[#ffd700] text-4xl mb-8 font-serif">"</div>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight font-light">
          The best AI system<br/>
          is one that knows<br/>
          what it <span className="italic text-[#ffd700]">doesn&apos;t</span> know.
        </h2>
        <div className="text-[#ffd700] text-3xl mt-12">✦</div>
      </motion.div>
    </section>
  )
}
