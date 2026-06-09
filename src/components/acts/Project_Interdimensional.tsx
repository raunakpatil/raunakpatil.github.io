'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GithubRepo } from '@/lib/github'
import Image from 'next/image'

export function Project_Interdimensional({ repo, index }: { repo: GithubRepo, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // --- THE NARRATIVE TIMELINE ---

  // 1. "Remember when finding something amazing was an accident?"
  const text1Opacity = useTransform(scrollYProgress, [0.05, 0.1, 0.15, 0.2], [0, 1, 1, 0])
  
  // 2. The buildup text
  const text2Opacity = useTransform(scrollYProgress, [0.2, 0.22, 0.28, 0.3], [0, 1, 1, 0])
  const text3Opacity = useTransform(scrollYProgress, [0.3, 0.32, 0.38, 0.4], [0, 1, 1, 0])
  const text4Opacity = useTransform(scrollYProgress, [0.4, 0.42, 0.48, 0.5], [0, 1, 1, 0])
  
  // 3. The Climax text
  const text5Opacity = useTransform(scrollYProgress, [0.55, 0.58, 0.65, 0.7], [0, 1, 1, 0])

  // --- THE STATIC WARP EFFECT ---
  const warpOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.7], [0, 0.5, 0.6, 0])
  const warpScale = useTransform(scrollYProgress, [0.2, 0.7], [1, 1.3])
  const warpRotate = useTransform(scrollYProgress, [0.2, 0.7], [0, 5])

  // --- THE DISCOVERY IMAGE ---
  const remoteOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.7, 0.75], [0, 1, 1, 0])
  const remoteScale = useTransform(scrollYProgress, [0.5, 0.7], [0.8, 1.1])

  // --- ENVIRONMENTAL EFFECTS ---
  // Static gets extremely intense, then instantly shuts off at 0.8 when the signal "locks"
  const staticOpacity = useTransform(scrollYProgress, [0, 0.6, 0.7, 0.72], [0.1, 0.8, 0.8, 0])
  // Scanlines also disappear
  const scanlineOpacity = useTransform(scrollYProgress, [0, 0.7, 0.72], [0.3, 0.3, 0])

  // --- THE REVEAL ---
  const titleOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.98, 1], [0, 1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0.75, 0.8], [50, 0])


  return (
    <section ref={ref} className="relative h-[600vh] w-full bg-[#050505] text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#020202]">
        
        {/* --- STATIC OVERLAYS --- */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
          style={{ opacity: staticOpacity }}
        >
          {/* We use a rapidly animated noise GIF or CSS trick. For pure CSS: */}
          <div className="absolute inset-0 opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse" />
        </motion.div>

        {/* Scanlines */}
        <motion.div 
          className="absolute inset-0 z-[1] pointer-events-none mix-blend-overlay"
          style={{ 
            opacity: scanlineOpacity,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)"
          }}
        />

        {/* --- THE TEXT NARRATIVE --- */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-center px-6"
          style={{ opacity: text1Opacity }}
        >
          <div className="backdrop-blur-sm bg-black/40 p-12 rounded-2xl">
            <h2 className="text-3xl md:text-5xl font-mono text-gray-300 tracking-widest uppercase leading-tight">
              Remember when finding something <br/>
              <span className="text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse">amazing</span><br/> 
              was an accident?
            </h2>
          </div>
        </motion.div>

        <motion.div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-center px-6" style={{ opacity: text2Opacity }}>
          <h2 className="text-4xl md:text-6xl font-mono text-white tracking-widest uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            Before recommendations...
          </h2>
        </motion.div>

        <motion.div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-center px-6" style={{ opacity: text3Opacity }}>
          <h2 className="text-4xl md:text-6xl font-mono text-white tracking-widest uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            Before algorithms...
          </h2>
        </motion.div>

        <motion.div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-center px-6" style={{ opacity: text4Opacity }}>
          <h2 className="text-4xl md:text-7xl font-mono text-white font-bold tracking-widest uppercase drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
            Before endless scrolling...
          </h2>
        </motion.div>


        {/* --- THE STATIC WARP --- */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            className="absolute w-[120vw] h-[120vh] mix-blend-screen"
            style={{ opacity: warpOpacity, scale: warpScale, rotate: warpRotate }}
          >
            <Image src="/static.gif" alt="Static Warp" fill className="object-cover blur-[2px] contrast-125" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.9)_90%)]" />
          </motion.div>
        </div>


        {/* --- THE LOCK TEXT --- */}
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: text5Opacity, scale: remoteScale }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-mono text-white font-bold tracking-widest uppercase drop-shadow-[0_0_30px_rgba(0,240,255,0.8)]"
          >
            There was discovery.
          </motion.h2>
        </motion.div>

        {/* --- THE DISCOVERY IMAGE --- */}
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-end pointer-events-none"
          style={{ transformOrigin: "bottom center", opacity: remoteOpacity, scale: remoteScale }}
        >
          <div className="relative w-72 h-72 md:w-[500px] md:h-[500px]">
            <Image src="/discovery.png" alt="Discovery Icon" fill className="object-contain object-bottom drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
          </div>
        </motion.div>


        {/* --- SCENE 6: THE REVEAL TITLE --- */}
        {/* The signal locks, static drops to zero, pure black background, title reveals. */}
        <motion.div 
          className="absolute inset-0 z-30 w-full flex flex-col items-center justify-center text-center px-6 bg-black"
          style={{ opacity: titleOpacity }}
        >
          <motion.div style={{ y: titleY }}>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              INTERDIMENSIONAL <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-gray-800">CABLE</span>
            </h2>
            
            <p className="text-xl md:text-2xl font-mono text-gray-400 tracking-widest uppercase mt-8 mb-12">
              A portal to infinite realities.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {repo.language && (
                <span className="px-4 py-2 border border-gray-600 rounded-full text-sm font-mono text-gray-300">
                  {repo.language}
                </span>
              )}
              {repo.topics?.slice(0, 3).map(topic => (
                <span key={topic} className="px-4 py-2 border border-gray-700 rounded-full text-sm font-mono text-gray-400">
                  {topic}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center w-full gap-4">
              {repo.homepage && (
                <a 
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-gradient-to-b from-gray-400 to-gray-800 text-white font-bold rounded-full hover:from-gray-300 hover:to-gray-700 transition-all duration-300 flex items-center gap-2 text-sm pointer-events-auto drop-shadow-lg"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Watch Now
                </a>
              )}
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-full hover:bg-white/20 transition-colors duration-300 flex items-center gap-2 text-sm pointer-events-auto backdrop-blur-md"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                View Repository
              </a>
            </div>
          </motion.div>
        </motion.div>
        
      </div>
    </section>
  )
}
