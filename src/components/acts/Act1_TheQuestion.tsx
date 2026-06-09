'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SvgCuriosity } from '../svg/SvgCuriosity'

export function Act1_TheQuestion() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  // Text 1: "Every engineer starts with a question" (0.4 to 0.5)
  const text1Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.65, 0.75], [0, 1, 1, 0])
  const text1Y = useTransform(scrollYProgress, [0.4, 0.5], [30, 0])

  // Text 2: "Mine started with curiosity." (0.8 to 0.85)
  const text2Opacity = useTransform(scrollYProgress, [0.8, 0.85], [0, 1])
  const text2Y = useTransform(scrollYProgress, [0.8, 0.85], [20, 0])

  // Text 3: "How do the systems beneath the world actually work?" (0.9 to 0.95)
  const text3Opacity = useTransform(scrollYProgress, [0.9, 0.95], [0, 1])
  const text3Y = useTransform(scrollYProgress, [0.9, 0.95], [20, 0])

  return (
    <section ref={ref} className="relative h-[800vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
          
          {/* Background Visuals via SVG */}
          <div className="absolute inset-0 z-0">
            <SvgCuriosity scrollYProgress={scrollYProgress} />
          </div>

          {/* Scene 4 Text */}
          <motion.div 
            style={{ opacity: text1Opacity, y: text1Y }} 
            className="absolute text-center px-6 z-10 mt-[20vh]"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-8 leading-relaxed text-[#f4f4f5]">
              Every engineer <br/> starts with a <span className="font-bold">question</span>
            </h1>
          </motion.div>

          {/* Scene 6 Texts */}
          <motion.div 
            className="absolute flex flex-col items-center justify-center text-center px-6 z-20 max-w-4xl"
          >
            <motion.p 
              style={{ opacity: text2Opacity, y: text2Y }}
              className="text-2xl md:text-4xl font-light text-gray-400 mb-12 italic"
            >
              Mine started with curiosity.
            </motion.p>
            
            <motion.h2 
              style={{ opacity: text3Opacity, y: text3Y }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-[#f4f4f5]"
            >
              How do the systems beneath the world actually work?
            </motion.h2>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
