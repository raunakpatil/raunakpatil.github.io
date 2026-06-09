'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function SvgBlueprint({ scrollYProgress }: { scrollYProgress: any }) {
  const pathLength = useTransform(scrollYProgress, [0.1, 0.5], [0, 1])
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 0.5, 0.5, 0])
  const rotateX = useTransform(scrollYProgress, [0, 1], [60, 40])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5])

  const gridLines = []
  for (let i = -50; i <= 150; i += 10) {
    gridLines.push(<motion.line key={`v${i}`} x1={i} y1="-50" x2={i} y2="150" stroke="#00ffff" strokeWidth="0.2" style={{ pathLength }} />)
    gridLines.push(<motion.line key={`h${i}`} x1="-50" y1={i} x2="150" y2={i} stroke="#00ffff" strokeWidth="0.2" style={{ pathLength }} />)
  }

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full perspective-[1000px] flex items-center justify-center pointer-events-none"
      style={{ opacity }}
    >
      <motion.svg 
        className="w-[150vw] h-[150vh]" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid slice"
        style={{ rotateX, scale }}
      >
        <g opacity="0.3">{gridLines}</g>
        
        {/* Architectural elements assembling */}
        <motion.rect x="30" y="30" width="40" height="40" fill="transparent" stroke="#00ffff" strokeWidth="0.5" style={{ pathLength }} />
        <motion.rect x="40" y="40" width="20" height="20" fill="transparent" stroke="#00ffff" strokeWidth="0.8" style={{ pathLength }} />
        <motion.circle cx="50" cy="50" r="25" fill="transparent" stroke="#00ffff" strokeWidth="0.3" strokeDasharray="1 1" style={{ pathLength }} />
        <motion.path d="M 10 90 L 50 50 L 90 90" fill="transparent" stroke="#00ffff" strokeWidth="0.5" style={{ pathLength }} />
        <motion.path d="M 10 10 L 50 50 L 90 10" fill="transparent" stroke="#00ffff" strokeWidth="0.5" style={{ pathLength }} />
      </motion.svg>
    </motion.div>
  )
}

export function Act5_ProjectsTransition() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Fade in and out (centered around 0.5)
  const opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0])
  
  // Dramatic scale zoom effect as the user scrolls
  const scale = useTransform(scrollYProgress, [0.2, 0.8], [0.8, 1.5])
  const tracking = useTransform(scrollYProgress, [0.2, 0.8], ["0em", "0.2em"])

  return (
    <section ref={ref} className="relative h-[120vh] bg-transparent text-white z-10 pointer-events-none overflow-hidden">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden w-full">
        
        <SvgBlueprint scrollYProgress={scrollYProgress} />
        
        <motion.div 
          style={{ opacity, scale }} 
          className="relative z-10 flex flex-col items-center justify-center w-full"
        >
          <div className="absolute top-[-4rem] uppercase tracking-[0.5em] text-[#00ffff] text-sm font-mono opacity-60">
            Phase 02 — Architecting Solutions
          </div>
          
          <motion.h1 
            style={{ letterSpacing: tracking }}
            className="text-[10vw] md:text-[12vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00ffff]/20 drop-shadow-[0_0_30px_rgba(0,255,255,0.3)] text-center"
          >
            PASSION<br/>PROJECTS
          </motion.h1>
          
          {/* Subtle reflection/glitch effect */}
          <motion.h1 
            style={{ letterSpacing: tracking, y: 10 }}
            className="absolute text-[10vw] md:text-[12vw] font-black leading-none text-transparent stroke-text opacity-20 blur-[2px] text-center"
            style={{ WebkitTextStroke: "1px #00ffff" } as any}
          >
            PASSION<br/>PROJECTS
          </motion.h1>
        </motion.div>
      </div>
    </section>
  )
}
