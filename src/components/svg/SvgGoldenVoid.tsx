'use client'

import { useState, useEffect } from 'react'
import { motion, MotionValue } from 'framer-motion'
import { useMemo } from 'react'

interface SvgGoldenVoidProps {
  scaleUniverse: MotionValue<number>;
  scaleFg: MotionValue<number>;
  scaleMg: MotionValue<number>;
  scaleBg: MotionValue<number>;
}

export function SvgGoldenVoid({ scaleUniverse, scaleFg, scaleMg, scaleBg }: SvgGoldenVoidProps) {
  const concepts = [
    "GRAVITY", "PHOTOSYNTHESIS", "DNA", "THE SPEED OF LIGHT", "BLACK HOLES",
    "THE CAPITAL OF FRANCE", "SATURN HAS RINGS", "THE GREAT WALL", "SHAKESPEARE",
    "JUPITER IS A GAS GIANT", "THE PYRAMIDS OF GIZA", "E=MC²", "COFFEE",
    "THE WATER CYCLE", "OXYGEN", "ATOMS", "THE MOON LANDING", "PI = 3.14159",
    "MAGNETISM", "EVOLUTION", "ELECTRICITY", "THE SOLAR SYSTEM", "CONTINENTAL DRIFT",
    "THE HUMAN BRAIN", "QUANTUM MECHANICS", "THERMODYNAMICS", "THE CELL CYCLE"
  ]

  const [fg, setFg] = useState<any[]>([])
  const [mg, setMg] = useState<any[]>([])
  const [bg, setBg] = useState<any[]>([])

  useEffect(() => {
    const fgText = []
    const mgText = []
    const bgText = []

    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * Math.random() * 100 
      const x = 50 + Math.cos(angle) * radius
      const y = 50 + Math.sin(angle) * radius
      
      const text = concepts[Math.floor(Math.random() * concepts.length)]
      const delay = Math.random() * 5

      if (i < 15) {
        // Foreground: 15 items
        fgText.push({ x, y, text, delay, fontSize: Math.random() * 0.5 + 0.3, opacity: Math.random() * 0.2 + 0.8 })
      } else if (i < 50) {
        // Midground: 35 items
        mgText.push({ x, y, text, delay, fontSize: Math.random() * 0.3 + 0.2, opacity: Math.random() * 0.3 + 0.4 })
      } else {
        // Background: 50 items
        bgText.push({ x, y, text, delay, fontSize: Math.random() * 0.15 + 0.1, opacity: Math.random() * 0.15 + 0.05 })
      }
    }
    setFg(fgText)
    setMg(mgText)
    setBg(bgText)
  }, [])

  return (
    <>
      {/* Layer 3: Background Words (Distant - Rendered BEHIND the glow) */}
      <motion.svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="-50 -50 200 200" 
        preserveAspectRatio="xMidYMid slice"
        style={{ scale: scaleBg, willChange: "transform" }}
      >
        {bg.map((item, i) => (
          <text
            key={`bg-${i}`}
            x={item.x}
            y={item.y}
            fill="#886622"
            fontSize={item.fontSize}
            fontFamily="monospace"
            letterSpacing="0.1em"
            opacity={item.opacity}
            className="animate-pulse"
            style={{ animationDuration: `${4 + (i % 4)}s`, animationDelay: `${i % 5}s` }}
          >
            {item.text}
          </text>
        ))}
      </motion.svg>

      {/* Layer 0: Atmospheric Glow (Fog) */}
      <motion.svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="-50 -50 200 200" 
        preserveAspectRatio="xMidYMid slice"
        style={{ scale: scaleUniverse }}
      >
        <defs>
          <radialGradient id="golden-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.4" />
            <stop offset="30%" stopColor="#ffaa00" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#884400" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="core-glow" cx="50%" cy="50%" r="20%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="100" fill="url(#golden-glow)" />
        <circle cx="50" cy="50" r="30" fill="url(#core-glow)" />
        <circle 
          cx="50" 
          cy="50" 
          r="80" 
          stroke="#ffd700" 
          strokeWidth="0.1" 
          strokeDasharray="1 3" 
          fill="none" 
          opacity="0.3" 
        />
      </motion.svg>

      {/* Layer 2: Midground Words (In focus) */}
      <motion.svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="-50 -50 200 200" 
        preserveAspectRatio="xMidYMid slice"
        style={{ scale: scaleMg, willChange: "transform" }}
      >
        {mg.map((item, i) => (
          <text
            key={`mg-${i}`}
            x={item.x}
            y={item.y}
            fill="#cc9944"
            fontSize={item.fontSize}
            fontFamily="monospace"
            letterSpacing="0.1em"
            opacity={item.opacity}
            className="animate-pulse"
            style={{ animationDuration: `${3 + (i % 3)}s`, animationDelay: `${i % 4}s` }}
          >
            {item.text}
          </text>
        ))}
      </motion.svg>

      {/* Layer 1: Foreground Words (Near Camera - pure white) */}
      <motion.svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="-50 -50 200 200" 
        preserveAspectRatio="xMidYMid slice"
        style={{ scale: scaleFg, willChange: "transform" }}
      >
        {fg.map((item, i) => (
          <text
            key={`fg-${i}`}
            x={item.x}
            y={item.y}
            fill="#ffffff"
            fontSize={item.fontSize}
            fontFamily="monospace"
            letterSpacing="0.1em"
            opacity={item.opacity}
            className="animate-pulse"
            style={{ animationDuration: `${5 + (i % 4)}s`, animationDelay: `${i % 3}s` }}
          >
            {item.text}
          </text>
        ))}
      </motion.svg>
    </>
  )
}
