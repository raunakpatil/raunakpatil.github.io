'use client'

import { motion, useTransform } from 'framer-motion'
import { useMemo } from 'react'

export function SvgCuriosity({ scrollYProgress }: { scrollYProgress: any }) {
  
  // 1. The Dot fades in and scales up
  // 1. The Dot fades in and goes through a complex pulse sequence
  const dotOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1])
  
  // Pulse sequence: tiny -> bigger -> small -> big -> small -> final size (1.0)
  const dotScale = useTransform(
    scrollYProgress, 
    [0.05, 0.08, 0.11, 0.14, 0.17, 0.20], 
    [0.2,  1.5,  0.5,  1.2,  0.8,  1.0]
  )
  
  // 1b. The Glow matches the pulse sequence but much larger
  const glowOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 0.5])
  const glowScale = useTransform(
    scrollYProgress, 
    [0.05, 0.08, 0.11, 0.14, 0.17, 0.20], 
    [0.2,  3.0,  1.0,  2.5,  1.5,  2.0]
  )

  // 2. The Curve of the Question Mark fades in
  const curveOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1])
  
  // 3. The entire symbol moves UP to make room for the text
  const svgY = useTransform(scrollYProgress, [0.35, 0.45], ["0px", "-150px"])
  
  // Entire scene fades out at the end
  const sceneOpacity = useTransform(scrollYProgress, [0.7, 0.8], [1, 0])

  // 4. The Wavy Lines fade in at the end
  const fieldOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1])

  const fieldCurves = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      // Start higher up and draw enough lines to guarantee coverage
      const yOffset = i * 40 - 200
      
      // Use deterministic pseudo-random math based on the index 'i' 
      const pseudoRandomOpacity = (Math.sin(i * 13) * 0.5 + 0.5) * 0.3 + 0.05
      const pseudoRandomWidth = (Math.cos(i * 7) * 0.5 + 0.5) * 1 + 0.5

      return {
        d: `M -100 ${yOffset} Q 250 ${yOffset + 150}, 500 ${yOffset} T 1100 ${yOffset}`,
        opacity: pseudoRandomOpacity,
        width: pseudoRandomWidth
      }
    })
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
      {/* The Wavy Lines Background (Stays full screen, does not move up) */}
      <motion.svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: fieldOpacity }}
      >
        <motion.g
          animate={{ scaleY: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {fieldCurves.map((c, i) => (
            <path key={i} d={c.d} fill="transparent" stroke="#f4f4f5" strokeWidth={c.width} opacity={c.opacity} />
          ))}
        </motion.g>
      </motion.svg>

      {/* The Question Mark (Moves UP to make room for text) */}
      <motion.svg 
        className="w-[150px] h-[225px] md:w-[200px] md:h-[300px] overflow-visible z-10" 
        viewBox="0 0 200 300"
        style={{ opacity: sceneOpacity, y: svgY }}
      >
        <defs>
          <filter id="dot-glow" x="-500%" y="-500%" width="1000%" height="1000%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Expanding Glow (Scroll controlled scale, autonomous flicker) */}
        <motion.g style={{ opacity: glowOpacity, scale: glowScale }}>
          <circle cx="100" cy="260" r="1000" fill="transparent" />
          <motion.circle 
            cx="100" cy="260" r="14" 
            fill="#f4f4f5" 
            filter="url(#dot-glow)"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* The Solid Dot (Scroll controlled scale, autonomous flicker) */}
        <motion.g style={{ opacity: dotOpacity, scale: dotScale }}>
          <circle cx="100" cy="260" r="1000" fill="transparent" />
          <motion.circle 
            cx="100" cy="260" r="14" 
            fill="#f4f4f5" 
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
          />
        </motion.g>

        {/* The Curve (Top of the ?) */}
        <motion.path 
          d="M 60 120 C 60 60, 140 60, 140 120 C 140 160, 100 170, 100 210"
          fill="transparent"
          stroke="#f4f4f5"
          strokeWidth="28"
          strokeLinecap="round"
          style={{ opacity: curveOpacity }}
        />
      </motion.svg>
    </div>
  )
}
