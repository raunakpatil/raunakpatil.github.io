'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SvgAlignmentEngine } from '../svg/SvgAlignmentEngine'

export function Act5_SigmaAI() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Phase 1: Raw Language (0.1 to 0.2)
  const op1 = useTransform(scrollYProgress, [0.05, 0.1, 0.15, 0.2], [0, 1, 1, 0])
  
  // Phase 2: Context (0.25 to 0.35)
  const op2_1 = useTransform(scrollYProgress, [0.22, 0.25, 0.32, 0.35], [0, 1, 1, 0])
  const op2_2 = useTransform(scrollYProgress, [0.26, 0.29, 0.32, 0.35], [0, 1, 1, 0])

  // Phase 3: Evaluation (0.4 to 0.5)
  const op3_1 = useTransform(scrollYProgress, [0.38, 0.42, 0.48, 0.52], [0, 1, 1, 0])
  const op3_2 = useTransform(scrollYProgress, [0.42, 0.46, 0.48, 0.52], [0, 1, 1, 0])

  // Phase 4: Alignment (0.55 to 0.65)
  const op4_1 = useTransform(scrollYProgress, [0.55, 0.58, 0.62, 0.65], [0, 1, 1, 0])
  const op4_2 = useTransform(scrollYProgress, [0.58, 0.61, 0.62, 0.65], [0, 1, 1, 0])
  
  // Pause beat (0.66 to 0.73)
  const op4_3 = useTransform(scrollYProgress, [0.66, 0.68, 0.71, 0.73], [0, 1, 1, 0])

  // Phase 5: Metrics Construction
  const metric1Op = useTransform(scrollYProgress, [0.73, 0.74, 0.76, 0.77], [0, 1, 1, 0])
  const metric2Op = useTransform(scrollYProgress, [0.77, 0.78, 0.80, 0.81], [0, 1, 1, 0])
  
  // Final Hero Metric
  const metric3Op = useTransform(scrollYProgress, [0.81, 0.82, 0.85, 0.86], [0, 1, 1, 0])

  // Final Reveal
  const finalOp = useTransform(scrollYProgress, [0.86, 0.87, 1.0], [0, 1, 1])

  return (
    <section ref={ref} className="relative h-[800vh] bg-transparent text-white z-10 pointer-events-none">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        {/* The Text Alignment Engine Background */}
        <div className="absolute inset-0 z-0">
          <SvgAlignmentEngine scrollYProgress={scrollYProgress} />
        </div>

        {/* Phase 1 */}
        <motion.div className="will-change-transform" style={{ opacity: op1 }} className="absolute z-10 text-center max-w-4xl px-4">
          <p className="text-2xl md:text-5xl font-light tracking-wide text-gray-300 drop-shadow-md">
            The scale of global systems wasn't theoretical anymore.
          </p>
        </motion.div>

        {/* Phase 2 */}
        <motion.div className="will-change-transform absolute z-10 text-center max-w-4xl px-4 flex flex-col gap-6">
          <motion.p style={{ opacity: op2_1 }} className="text-2xl md:text-5xl font-light tracking-wide text-gray-300 drop-shadow-md">
            Every conversation mattered.
          </motion.p>
          <motion.p style={{ opacity: op2_2 }} className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg">
            There were millions to understand.
          </motion.p>
        </motion.div>

        {/* Phase 3 */}
        <motion.div className="will-change-transform absolute z-10 text-center max-w-4xl px-4 flex flex-col gap-6">
          <motion.p style={{ opacity: op3_1 }} className="text-2xl md:text-5xl font-light tracking-wide text-gray-300 drop-shadow-md">
            Every prediction was measured.
          </motion.p>
          <motion.p style={{ opacity: op3_2 }} className="text-3xl md:text-6xl font-bold text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">
            Every error became feedback.
          </motion.p>
        </motion.div>

        {/* Phase 4 */}
        <motion.div className="will-change-transform absolute z-10 text-center max-w-4xl px-4 flex flex-col gap-6">
          <motion.p style={{ opacity: op4_1 }} className="text-2xl md:text-5xl font-light tracking-wide text-gray-300 drop-shadow-md">
            Fine-tuning isn't teaching.
          </motion.p>
          <motion.p style={{ opacity: op4_2 }} className="text-4xl md:text-7xl font-bold text-[#bc13fe] drop-shadow-[0_0_20px_rgba(188,19,254,0.5)]">
            It's alignment.
          </motion.p>
        </motion.div>

        {/* Pause Beat */}
        <motion.div className="will-change-transform" style={{ opacity: op4_3 }} className="absolute z-10 text-center max-w-4xl px-4">
          <p className="text-2xl md:text-4xl font-light tracking-widest text-gray-400 drop-shadow-md uppercase">
            And alignment has consequences.
          </p>
        </motion.div>

        {/* Phase 5: Metrics */}
        <motion.div className="will-change-transform" style={{ opacity: metric1Op }} className="absolute z-10 flex flex-col items-center justify-center text-center">
          <p className="text-[6rem] md:text-[10rem] font-bold text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            +7%
          </p>
          <p className="text-xl md:text-3xl tracking-widest text-[#00f0ff] uppercase mt-4 font-mono">
            Transcription Accuracy
          </p>
        </motion.div>

        <motion.div className="will-change-transform" style={{ opacity: metric2Op }} className="absolute z-10 flex flex-col items-center justify-center text-center">
          <p className="text-[6rem] md:text-[10rem] font-bold text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            -12%
          </p>
          <p className="text-xl md:text-3xl tracking-widest text-[#bc13fe] uppercase mt-4 font-mono">
            Error Rates
          </p>
        </motion.div>

        {/* Hero Metric */}
        <motion.div className="will-change-transform" style={{ opacity: metric3Op }} className="absolute z-10 flex flex-col items-center justify-center text-center max-w-5xl px-4">
          <p className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00f0ff]/50 leading-none drop-shadow-[0_0_40px_rgba(0,240,255,0.6)]">
            +30%
          </p>
          <p className="text-3xl md:text-5xl font-bold tracking-widest text-white uppercase mt-2 md:mt-4">
            QA Efficiency
          </p>
          <div className="mt-8 md:mt-12 space-y-2">
            <p className="text-lg md:text-2xl text-gray-300 font-light tracking-wide">
              Automated quality assurance workflows.
            </p>
            <p className="text-lg md:text-2xl text-gray-300 font-light tracking-wide">
              Fine-tuned LLMs aligned with internal quality standards.
            </p>
          </div>
        </motion.div>

        {/* Final Reveal */}
        <motion.div className="will-change-transform" style={{ opacity: finalOp }} className="absolute z-10 flex flex-col items-center justify-center text-center">
          <p className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            SIGMA AI
          </p>
          <p className="text-sm md:text-xl text-gray-400 font-mono tracking-widest mt-6 uppercase">
            London
          </p>
        </motion.div>

      </div>
    </section>
  )
}
