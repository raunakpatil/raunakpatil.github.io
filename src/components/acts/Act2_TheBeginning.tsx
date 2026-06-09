'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SvgDiscovery } from '../svg/SvgDiscovery'

export function Act2_TheBeginning() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const opacity1 = useTransform(scrollYProgress, [0.4, 0.6, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={ref} className="relative h-[200vh] bg-transparent text-white z-10 pointer-events-none">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        <div className="absolute inset-0 z-0">
          <SvgDiscovery scrollYProgress={scrollYProgress} />
        </div>


        
        <motion.div className="will-change-transform" style={{ opacity: opacity1 }} className="absolute max-w-4xl text-center z-10 drop-shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl">
          <p className="text-2xl md:text-5xl font-light leading-relaxed">
            Growing up in <strong className="font-bold text-[#bc13fe]">Nagpur</strong>, technology felt like magic. But magic is just engineering we don't understand yet. I wanted to understand.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
