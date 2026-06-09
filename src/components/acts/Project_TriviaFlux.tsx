'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GithubRepo } from '@/lib/github'

export function Project_TriviaFlux({ repo, index }: { repo: GithubRepo, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Scene 0: The Question (0.05 - 0.7)
  const questionOpacity = useTransform(scrollYProgress, [0.05, 0.1, 0.65, 0.7], [0, 1, 1, 0])
  const questionY = useTransform(scrollYProgress, [0.05, 0.1], [-20, 0])

  // Scene 1: Options Appear (0.1 - 0.25)
  const nodeOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1])
  const baseLineLength = useTransform(scrollYProgress, [0.15, 0.25], [0, 1])

  // Scene 2: Player Input connecting lines (0.25 - 0.4)
  const inputLineLength = useTransform(scrollYProgress, [0.25, 0.4], [0, 1])
  const higherLowerOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.65, 0.7], [0, 1, 1, 0])

  // Scene 3: The Evaluation (Higher vs Lower Translation) (0.4 - 0.6)
  // Left node translates DOWN (Lower) (+120y)
  const leftY = useTransform(scrollYProgress, [0.4, 0.6], [250, 370])
  // Right node translates UP (Higher) (-120y)
  const rightY = useTransform(scrollYProgress, [0.4, 0.6], [250, 130])

  // Scene 4: The Outcome (0.6 - 0.75)
  const trendLineLength = useTransform(scrollYProgress, [0.6, 0.7], [0, 1])
  
  // Left Node loses to red/fade
  const leftColor = useTransform(scrollYProgress, [0.6, 0.65], ["#ffffff", "#ef4444"])
  const leftOpacity = useTransform(scrollYProgress, [0.6, 0.65], [1, 0.3])
  
  // Right Node wins cyan/glow
  const rightColor = useTransform(scrollYProgress, [0.6, 0.65], ["#ffffff", "#00f0ff"])
  const rightScale = useTransform(scrollYProgress, [0.6, 0.65, 0.7], [1, 1.5, 1.2])

  // Arrows Opacity
  const arrowOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1])

  // Shockwave victory rings on Right Node (which ends at y=130)
  const ringOpacity = useTransform(scrollYProgress, [0.65, 0.7], [0, 1])
  const ringScale1 = useTransform(scrollYProgress, [0.65, 0.75], [1, 3])
  const ringScale2 = useTransform(scrollYProgress, [0.68, 0.78], [1, 4])
  const ringScale3 = useTransform(scrollYProgress, [0.71, 0.81], [1, 5])

  // Scene 5: Reveal Text (0.75 to 0.95)
  const textOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0.75, 0.8], [50, 0])

  return (
    <section ref={ref} className="relative h-[600vh] w-full bg-[#050505] text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
        
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* --- SCENE 0: THE QUESTION --- */}
          <motion.div 
            className="absolute top-20 w-full flex flex-col items-center justify-center text-center z-20 pointer-events-none px-6"
            style={{ opacity: questionOpacity, y: questionY }}
          >
            <motion.h3 
              animate={{ opacity: [1, 0.6, 1, 0.8, 1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-xl md:text-2xl lg:text-3xl font-mono font-bold text-gray-300 tracking-widest max-w-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-relaxed uppercase"
            >
              Can you guess the distance of Neptune compared to Uranus <br /> compared to the sun?
            </motion.h3>
          </motion.div>

          <svg className="w-full max-w-[1400px] h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            
            {/* --- SCENE 1: THE BASE CONNECTION --- */}
            <motion.line 
              x1="300" y1={leftY} x2="700" y2={rightY} 
              stroke="#333333" strokeWidth="2" strokeDasharray="5,5" fill="transparent"
              style={{ pathLength: baseLineLength, opacity: nodeOpacity }}
            />

            {/* --- SCENE 2: THE PLAYER INPUT --- */}
            {/* Player at bottom center (500, 480) connecting to Left Node */}
            <motion.line 
              x1="500" y1="480" x2="300" y2={leftY} 
              stroke="#555555" strokeWidth="1.5" fill="transparent"
              style={{ pathLength: inputLineLength, opacity: nodeOpacity }}
            />
            {/* Player at bottom center (500, 480) connecting to Right Node */}
            <motion.line 
              x1="500" y1="480" x2="700" y2={rightY} 
              stroke="#555555" strokeWidth="1.5" fill="transparent"
              style={{ pathLength: inputLineLength, opacity: nodeOpacity }}
            />
            {/* The Player Node Indicator */}
            <motion.circle cx="500" cy="480" r="5" fill="#555555" style={{ opacity: inputLineLength }} />
            <motion.text
              x="500" y="505"
              textAnchor="middle" fill="#ffffff" fontSize="16" fontFamily="monospace"
              className="tracking-widest uppercase drop-shadow-md"
              style={{ opacity: higherLowerOpacity }}
            >
              <tspan fill="#00f0ff" className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">HIGHER</tspan> OR <tspan fill="#ef4444" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">LOWER</tspan>
            </motion.text>


            {/* --- SCENE 4: THE TRENDLINE --- */}
            {/* Draws exactly through the final resolved positions of the nodes (300, 370) and (700, 130) */}
            <motion.path 
              d="M 100 450 L 300 370 L 700 130 L 900 50"
              stroke="url(#neonGradient)" strokeWidth="4" fill="transparent"
              style={{ pathLength: trendLineLength }}
              className="drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]"
            />


            {/* --- SCENE 1 & 3 & 4: THE NODES --- */}
            {/* Left Node (LOWER) */}
            <motion.g style={{ opacity: leftOpacity }}>
              {/* Outer Halo */}
              <motion.circle 
                cx="300" cy={leftY} r="25" fill="transparent" 
                stroke={leftColor} strokeWidth="1" strokeDasharray="4,4"
              />
              {/* Inner Core */}
              <motion.circle 
                cx="300" cy={leftY} r="10" fill={leftColor} 
                className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
              {/* Label */}
              <motion.text
                x="300" y={leftY} dy="60"
                textAnchor="middle" fill="#ffffff" fontSize="14" fontFamily="monospace"
                className="tracking-widest opacity-50 uppercase drop-shadow-md"
              >
                URANUS
              </motion.text>
              {/* Down Arrow */}
              <motion.path 
                d={`M 260 370 L 260 400 M 250 390 L 260 400 L 270 390`} 
                stroke="#ef4444" strokeWidth="2" fill="transparent"
                style={{ opacity: arrowOpacity }}
              />
            </motion.g>

            {/* Right Node (HIGHER) */}
            <motion.g style={{ opacity: nodeOpacity, scale: rightScale, transformOrigin: "700px 130px" }}>
              {/* Outer Halo */}
              <motion.circle 
                cx="700" cy={rightY} r="25" fill="transparent" 
                stroke={rightColor} strokeWidth="2"
                className="drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
              />
              {/* Inner Core */}
              <motion.circle 
                cx="700" cy={rightY} r="10" fill={rightColor} 
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              />
              {/* Label */}
              <motion.text
                x="700" y={rightY} dy="60"
                textAnchor="middle" fill="#ffffff" fontSize="14" fontFamily="monospace"
                className="tracking-widest opacity-50 uppercase drop-shadow-md"
              >
                NEPTUNE
              </motion.text>
              {/* Up Arrow */}
              <motion.path 
                d={`M 740 130 L 740 100 M 730 110 L 740 100 L 750 110`} 
                stroke="#00f0ff" strokeWidth="2" fill="transparent"
                style={{ opacity: arrowOpacity }}
              />
            </motion.g>


            {/* --- SCENE 4: VICTORY SHOCKWAVES (RIGHT NODE) --- */}
            <motion.g style={{ opacity: ringOpacity, transformOrigin: "700px 130px" }}>
              <motion.circle cx="700" cy="130" r="40" fill="transparent" stroke="#00f0ff" strokeWidth="2" style={{ scale: ringScale1 }} />
              <motion.circle cx="700" cy="130" r="60" fill="transparent" stroke="#bc13fe" strokeWidth="1" style={{ scale: ringScale2 }} />
              <motion.circle cx="700" cy="130" r="80" fill="transparent" stroke="#ffffff" strokeWidth="0.5" style={{ scale: ringScale3 }} />
            </motion.g>

            {/* --- GRADIENTS --- */}
            <defs>
              <linearGradient id="neonGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#bc13fe" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>
            </defs>

          </svg>
        </div>

        {/* --- SCENE 5: THE REVEAL TEXT --- */}
        <motion.div 
          className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="backdrop-blur-xl bg-black/50 border border-white/5 p-12 rounded-3xl drop-shadow-2xl">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#bc13fe] to-[#00f0ff]">TriviaFlux</span>
            </h2>
            
            <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed mb-8 max-w-2xl">
              {repo.description || "A real-time, multi-player synchronization hub. Players evaluate options, making 'Higher or Lower' decisions while disparate human inputs mathematically converge into a central websocket engine."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {repo.language && (
                <span className="px-4 py-2 border border-gray-600 rounded-full text-sm font-mono text-gray-300 bg-black/80">
                  {repo.language}
                </span>
              )}
              {repo.topics?.slice(0, 3).map(topic => (
                <span key={topic} className="px-4 py-2 border border-[#bc13fe]/50 rounded-full text-sm font-mono text-[#00f0ff] bg-black/80">
                  {topic}
                </span>
              ))}
            </div>

            <div className="mt-10 flex justify-center w-full">
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm pointer-events-auto"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                View Repository
              </a>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  )
}
