'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SvgBuilding } from '../svg/SvgBuilding'

export function Act4_Obsession() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const opacity1 = useTransform(scrollYProgress, [0.33, 0.4, 0.6, 0.66], [0, 1, 1, 0])

  return (
    <section ref={ref} className="relative h-[200vh] bg-transparent text-white z-10 pointer-events-none">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        <div className="absolute inset-0 z-0">
          <SvgBuilding scrollYProgress={scrollYProgress} />
        </div>


        
        <motion.div className="will-change-transform" style={{ opacity: opacity1 }} className="absolute max-w-[95vw] md:max-w-6xl text-center z-10 p-6 md:p-12 drop-shadow-[0_0_15px_rgba(0,0,0,1)]">
          <div className="leading-relaxed text-white flex flex-col items-center gap-2 md:gap-4 w-full">
            <span className="font-light tracking-wide text-base md:text-xl lg:text-2xl md:whitespace-nowrap">I didn't just want to write scripts. I wanted to build ecosystems. Moving to</span>
            <span className="font-bold text-4xl md:text-7xl text-white tracking-widest my-2 md:my-4" style={{ fontFamily: "'Baskerville', 'Baskerville Old Face', 'Hoefler Text', Garamond, 'Times New Roman', serif" }}>Liverpool</span>
            <span className="font-light tracking-wide text-base md:text-xl lg:text-2xl md:whitespace-nowrap">for my Master's exposed me to the scale of global systems.</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
