'use client'

import { motion } from 'framer-motion'

export function SvgFuture() {
  // Generate spiral galaxy points
  const points = []
  for(let i = 0; i < 400; i++) {
    const angle = 0.1 * i
    const radius = 0.5 * i
    const cx = 50 + radius * Math.cos(angle)
    const cy = 50 + radius * Math.sin(angle)
    points.push({
      cx: cx.toFixed(2), 
      cy: cy.toFixed(2), 
      r: (Math.abs(Math.sin(i * 13)) * 0.5 + 0.1).toFixed(2)
    })
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center">
      {/* 
        We use an incredibly slow CSS spin on the container.
        Using a massive square that overflows ensures no corners are ever seen.
      */}
      <motion.svg 
        className="absolute w-[200vw] h-[200vw] md:w-[150vw] md:h-[150vw] opacity-80" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid slice"
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="future-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bc13fe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#bc13fe" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Gently pulsing central supernova */}
        <motion.circle 
          cx="50" 
          cy="50" 
          fill="url(#future-glow)" 
          animate={{ r: [120, 140, 120] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Expanding Galaxy Points */}
        {points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.cx} cy={p.cy} r={p.r} 
            fill="#ffffff" 
          />
        ))}

        {/* Unfinished Architecture Lines projecting outwards */}
        <line x1="50" y1="50" x2="-50" y2="-50" stroke="#00f0ff" strokeWidth="0.1" strokeDasharray="1 2" />
        <line x1="50" y1="50" x2="150" y2="-50" stroke="#00f0ff" strokeWidth="0.1" strokeDasharray="1 2" />
        <line x1="50" y1="50" x2="-50" y2="150" stroke="#00f0ff" strokeWidth="0.1" strokeDasharray="1 2" />
        <line x1="50" y1="50" x2="150" y2="150" stroke="#00f0ff" strokeWidth="0.1" strokeDasharray="1 2" />
      </motion.svg>
    </div>
  )
}
