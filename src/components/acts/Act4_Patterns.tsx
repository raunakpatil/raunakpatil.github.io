'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SvgPatterns } from '../svg/SvgPatterns'

export function Act4_Patterns() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // 1000vh cinematic pacing
  const op1 = useTransform(scrollYProgress, [0.02, 0.05, 0.12, 0.15], [0, 1, 1, 0]) // The code worked...
  const op2 = useTransform(scrollYProgress, [0.18, 0.21, 0.27, 0.30], [0, 1, 1, 0]) // Noise
  const op3 = useTransform(scrollYProgress, [0.32, 0.35, 0.40, 0.43], [0, 1, 1, 0]) // PATTERNS
  const op4 = useTransform(scrollYProgress, [0.45, 0.48, 0.52, 0.55], [0, 1, 1, 0]) // Signals
  const op5 = useTransform(scrollYProgress, [0.55, 0.58, 0.62, 0.65], [0, 1, 1, 0]) // People
  const op6 = useTransform(scrollYProgress, [0.65, 0.68, 0.73, 0.76], [0, 1, 1, 0]) // Consequences
  const zummitOp = useTransform(scrollYProgress, [0.80, 0.85, 0.95, 1.00], [0, 1, 1, 0])
  const metricsOp = useTransform(scrollYProgress, [0.85, 0.90, 0.95, 1.00], [0, 1, 1, 0])

  return (
    <section ref={ref} className="relative min-h-[1000vh] bg-transparent text-white z-10 pointer-events-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&display=swap');
      `}</style>

      {/* Sticky Background & Title */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden w-full font-['Space_Grotesk']">
        <div className="absolute inset-0 z-0">
          <SvgPatterns scrollYProgress={scrollYProgress} />
        </div>
        


        {/* Phase 1: Chaos */}
        <motion.div className="will-change-transform" style={{ opacity: op1 }} className="absolute w-full max-w-4xl text-center z-10 p-8">
          <div className="space-y-8 drop-shadow-[0_0_40px_rgba(0,0,0,1)]">
            <p className="text-gray-400 uppercase tracking-[0.4em] text-sm md:text-base font-bold">The code worked.</p>
            <p className="text-white font-black text-5xl md:text-[5rem] tracking-tighter leading-[1.1]">
              But I became obsessed<br/>with something else.
            </p>
          </div>
        </motion.div>

        {/* Phase 2: Mystery */}
        <motion.div className="will-change-transform" style={{ opacity: op2 }} className="absolute w-full max-w-4xl text-center z-10 p-8">
          <div className="space-y-8 drop-shadow-[0_0_40px_rgba(0,0,0,1)]">
            <p className="text-gray-400 uppercase tracking-[0.4em] text-sm md:text-base font-bold">What looked like noise...</p>
            <p className="text-white font-black text-5xl md:text-[5rem] tracking-tighter leading-[1.1]">
              ...wasn't noise at all.
            </p>
          </div>
        </motion.div>

        {/* Phase 3: Reveal */}
        <motion.div className="will-change-transform" style={{ opacity: op3 }} className="absolute w-full max-w-4xl text-center z-10 p-8">
          <h2 className="text-7xl md:text-[8rem] font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00f0ff]/50 drop-shadow-[0_0_40px_rgba(0,255,255,0.4)]">
            PATTERNS
          </h2>
        </motion.div>

        {/* Phase 4: Signals (Machine Network) */}
        <motion.div className="will-change-transform" style={{ opacity: op4 }} className="absolute w-full h-full flex flex-col justify-center items-end pr-[10%] md:pr-[20%] z-10 pointer-events-none">
          <div className="text-right drop-shadow-[0_0_40px_rgba(0,0,0,1)]">
            <p className="text-white font-black text-5xl md:text-[5rem] tracking-tighter leading-[1.1]">
              Behind every system<br/>were <span className="text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]">signals.</span>
            </p>
          </div>
        </motion.div>

        {/* Phase 5: People (Human Network) */}
        <motion.div className="will-change-transform" style={{ opacity: op5 }} className="absolute w-full h-full flex flex-col justify-center items-start pl-[10%] md:pl-[20%] z-10 pointer-events-none">
          <div className="text-left drop-shadow-[0_0_40px_rgba(0,0,0,1)]">
            <p className="text-white font-black text-5xl md:text-[5rem] tracking-tighter leading-[1.1]">
              Behind every signal<br/>were <span className="text-[#bc13fe] drop-shadow-[0_0_20px_rgba(188,19,254,0.6)]">people.</span>
            </p>
          </div>
        </motion.div>

        {/* Phase 6: Convergence */}
        <motion.div className="will-change-transform" style={{ opacity: op6 }} className="absolute w-full max-w-5xl text-center z-10 p-8 pointer-events-none">
          <p className="text-white font-black text-5xl md:text-[5rem] tracking-tighter leading-[1.1] drop-shadow-[0_0_40px_rgba(0,0,0,1)]">
            The patterns had consequences.
          </p>
        </motion.div>

        {/* Phase 7: Impact & Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          
          <motion.div className="will-change-transform" style={{ opacity: zummitOp }} className="text-center z-20 transform -translate-y-16">
            <p className="text-gray-400 uppercase tracking-[0.4em] text-sm md:text-base font-bold mb-4 drop-shadow-[0_0_10px_rgba(0,0,0,1)]">my time at</p>
            <h3 className="text-5xl md:text-[6rem] lg:text-[7rem] font-black tracking-[0.1em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] mix-blend-overlay">ZUMMIT INFOLAB</h3>
            <p className="text-[#bc13fe] tracking-[0.4em] text-sm md:text-lg uppercase mt-6 font-bold drop-shadow-[0_0_10px_rgba(0,0,0,1)]">Junior Data Scientist</p>
          </motion.div>
          
          <motion.div className="will-change-transform" style={{ opacity: metricsOp }} className="absolute inset-0 w-full h-full z-10">
            {/* SVG branches connecting core to metrics */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="55" x2="25" y2="65" stroke="#00f0ff" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" className="opacity-40" />
              <line x1="50" y1="55" x2="50" y2="75" stroke="#bc13fe" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" className="opacity-40" />
              <line x1="50" y1="55" x2="75" y2="65" stroke="#00f0ff" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" className="opacity-40" />
            </svg>

            <div className="absolute w-full h-full">
              {/* Metric 1 */}
              <div className="absolute top-[65%] left-[25%] transform -translate-x-1/2 flex flex-col items-center text-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_12px_#00f0ff] mb-4 transform -translate-y-1/2"></div>
                <p className="text-5xl md:text-7xl font-bold text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">15%</p>
                <p className="text-xs md:text-sm text-gray-300 uppercase tracking-widest mt-2 font-medium drop-shadow-[0_0_10px_rgba(0,0,0,1)]">Less Downtime</p>
              </div>
              
              {/* Metric 2 */}
              <div className="absolute top-[75%] left-[50%] transform -translate-x-1/2 flex flex-col items-center text-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#bc13fe] shadow-[0_0_12px_#bc13fe] mb-4 transform -translate-y-1/2"></div>
                <p className="text-5xl md:text-7xl font-bold text-[#bc13fe] drop-shadow-[0_0_20px_rgba(188,19,254,0.5)]">36%</p>
                <p className="text-xs md:text-sm text-gray-300 uppercase tracking-widest mt-2 font-medium drop-shadow-[0_0_10px_rgba(0,0,0,1)]">Product Engagement</p>
              </div>
              
              {/* Metric 3 */}
              <div className="absolute top-[65%] left-[75%] transform -translate-x-1/2 flex flex-col items-center text-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_12px_#00f0ff] mb-4 transform -translate-y-1/2"></div>
                <p className="text-5xl md:text-7xl font-bold text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">27%</p>
                <p className="text-xs md:text-sm text-gray-300 uppercase tracking-widest mt-2 font-medium drop-shadow-[0_0_10px_rgba(0,0,0,1)]">Higher Conversions</p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
