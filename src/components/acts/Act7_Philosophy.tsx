'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SvgGoldenVoid } from '../svg/SvgGoldenVoid'

export function Act7_Philosophy() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // 1. Exponential Constant Zoom & 3D Parallax Depth
  // The base scale shrinks the glow and boundary. Starting it at 4 keeps the light deep in the background
  // while the foreground text (scale 60) flies past the camera.
  const universeScale = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.4, 0.5], [4, 3, 2, 0.2, 0.02])
  
  // The Parallax Layers (Scaling faster/slower relative to base to create physical depth)
  const scaleFg = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.4, 0.5], [60, 10, 2, 0.2, 0.02]) // Flies past camera fast
  const scaleMg = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.4, 0.5], [30, 7, 2, 0.2, 0.02])  // Standard
  const scaleBg = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.4, 0.5], [10, 4, 2, 0.2, 0.02])  // Recedes slower

  // Fade in after reaching the section (0 to 0.05), hold, then fade out during final zoom (0.35 to 0.5)
  const universeOpacity = useTransform(scrollYProgress, [0, 0.05, 0.35, 0.5], [0, 1, 1, 0])

  // Map rotation to scroll so it always starts exactly at 0 degrees (right-side up)
  const universeRotate = useTransform(scrollYProgress, [0, 0.5], [0, 90])

  // 1.5. "K N O W N" flies in from behind the camera (scale 200) starting at 0.1, locks into place at 0.2, then shrinks
  const knownScale = useTransform(scrollYProgress, [0.1, 0.2, 0.25, 0.4, 0.5], [200, 3, 2, 0.2, 0.02])
  const knownOpacity = useTransform(scrollYProgress, [0.1, 0.15, 0.35, 0.5], [0, 1, 1, 0])

  // 2. The Unknown Void (Question marks appear in the darkness)
  const voidOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6], [0, 1, 0])

  // 3. The Climax ("I DON'T KNOW.")
  const climaxOpacity = useTransform(scrollYProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0])
  const climaxScale = useTransform(scrollYProgress, [0.5, 0.85], [0.95, 1.05])
  
  // 4. The Principle (Final Quote)
  const principleOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1])
  const principleY = useTransform(scrollYProgress, [0.85, 0.95], [50, 0])

  // Generate random question marks for the void
  const voidParticles = Array.from({ length: 50 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.3 + 0.1
  }))

  return (
    <section ref={containerRef} className="relative h-[500vh] bg-black text-white w-full">
      
      {/* Sticky Cinematic Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        
        {/* The Golden Universe (Zooms Out & Rotates based on scroll) */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center origin-center"
          style={{ opacity: universeOpacity, rotate: universeRotate }}
        >
          <div className="w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] relative">
            <SvgGoldenVoid scaleUniverse={universeScale} scaleFg={scaleFg} scaleMg={scaleMg} scaleBg={scaleBg} />
          </div>
        </motion.div>

        {/* "K N O W N" flies in from behind the camera */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
          style={{ scale: knownScale, opacity: knownOpacity }}
        >
          <h1 
            className="text-white text-4xl sm:text-5xl md:text-8xl font-serif font-light tracking-[0.2em] md:tracking-[0.5em] text-center whitespace-nowrap"
            style={{ textShadow: "0 0 40px rgba(255,215,0,0.8)" }}
          >
            K N O W N
          </h1>
        </motion.div>

        {/* The Void Particles (Fade In as universe shrinks) */}
        <motion.div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: voidOpacity }}
        >
          {voidParticles.map((p, i) => (
            <div 
              key={i} 
              className="absolute text-gray-700 font-serif"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size}rem`,
                opacity: p.opacity,
                transform: 'translate(-50%, -50%)'
              }}
            >
              ?
            </div>
          ))}
        </motion.div>

        {/* The Climax Statement */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: climaxOpacity, scale: climaxScale }}
        >
          <h2 className="text-5xl md:text-8xl font-serif text-white tracking-[0.2em] font-light drop-shadow-2xl text-center">
            I DON'T <span className="font-bold text-[#ffd700]">KNOW.</span>
          </h2>
          {/* Golden horizon glow underneath the text */}
          <div className="absolute top-[60%] w-[60%] h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-50" style={{ filter: 'blur(10px)' }} />
          <div className="absolute top-[60%] w-[40%] h-[1px] bg-gradient-to-r from-transparent via-[#ffffff] to-transparent opacity-80" />
        </motion.div>

        {/* The Final Principle */}
        <motion.div 
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none bg-black"
          style={{ opacity: principleOpacity }}
        >
          <motion.div 
            className="flex flex-col items-center justify-center text-center max-w-4xl px-6"
            style={{ y: principleY }}
          >
            <div className="text-[#ffd700] text-4xl mb-8 font-serif">“</div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight font-light">
              The best AI system<br/>
              is one that knows<br/>
              what it <span className="italic text-[#ffd700]">doesn't</span> know.
            </h2>
            <div className="text-[#ffd700] text-3xl mt-12">✦</div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
