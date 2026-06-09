'use client'

import { motion, useTransform } from 'framer-motion'

export function SvgGrowth({ scrollYProgress }: { scrollYProgress: any }) {
  const opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0])
  
  // Lines draw themselves as user scrolls
  const pathLength = useTransform(scrollYProgress, [0.35, 0.55], [0, 1])
  
  // Nodes scale up slightly earlier
  const nodeScale = useTransform(scrollYProgress, [0.3, 0.45], [0, 1])

  const nodes = [
    // Core
    { x: 50, y: 50, r: 3, color: "#00f0ff" },
    // Inner Ring
    { x: 40, y: 40, r: 1.5, color: "#bc13fe" },
    { x: 60, y: 40, r: 1.5, color: "#00f0ff" },
    { x: 60, y: 60, r: 1.5, color: "#bc13fe" },
    { x: 40, y: 60, r: 1.5, color: "#00f0ff" },
    // Middle Hexagon
    { x: 50, y: 25, r: 2, color: "#bc13fe" },
    { x: 72, y: 38, r: 2, color: "#00f0ff" },
    { x: 72, y: 62, r: 2, color: "#bc13fe" },
    { x: 50, y: 75, r: 2, color: "#00f0ff" },
    { x: 28, y: 62, r: 2, color: "#bc13fe" },
    { x: 28, y: 38, r: 2, color: "#00f0ff" },
    // Outer Shell
    { x: 50, y: 5, r: 1, color: "#ffffff" },
    { x: 89, y: 27, r: 1, color: "#ffffff" },
    { x: 89, y: 73, r: 1, color: "#ffffff" },
    { x: 50, y: 95, r: 1, color: "#ffffff" },
    { x: 11, y: 73, r: 1, color: "#ffffff" },
    { x: 11, y: 27, r: 1, color: "#ffffff" },
  ]

  const connections: { n1: { x: number, y: number, r: number, color: string }, n2: { x: number, y: number, r: number, color: string }, dist: number }[] = []
  nodes.forEach((n1, i) => {
    nodes.forEach((n2, j) => {
      if (i < j) {
        const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2))
        // Connect nodes that are close to each other
        if (dist < 35) {
          connections.push({ n1, n2, dist })
        }
      }
    })
  })

  return (
    <motion.svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#bc13fe" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bc13fe" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Massive subtle background pulse */}
      <motion.circle 
        cx="50" cy="50" r="40" 
        fill="url(#node-glow)" 
        style={{ opacity: pathLength }} 
        className="opacity-20"
      />

      {/* The Network Connections */}
      {connections.map((c, idx) => (
        <motion.line 
          key={`conn-${idx}`}
          x1={c.n1.x} y1={c.n1.y} 
          x2={c.n2.x} y2={c.n2.y} 
          stroke="url(#line-grad)" 
          strokeWidth={c.dist < 20 ? 0.3 : 0.1}
          fill="transparent"
          style={{ pathLength }}
        />
      ))}

      {/* The Isolated Scripts (Nodes) */}
      {nodes.map((n, idx) => (
        <g key={`node-${idx}`}>
          <motion.circle 
            cx={n.x} cy={n.y} r={n.r} 
            fill={n.color}
            style={{ scale: nodeScale, transformOrigin: `${n.x}px ${n.y}px` }}
            className="drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]"
          />
          <motion.circle 
            cx={n.x} cy={n.y} r={n.r * 2} 
            fill="transparent"
            stroke={n.color}
            strokeWidth="0.2"
            style={{ scale: pathLength, opacity: pathLength, transformOrigin: `${n.x}px ${n.y}px` }}
          />
        </g>
      ))}
      
      {/* Dynamic Data Packets shooting across lines */}
      {connections.slice(0, 10).map((c, idx) => (
        <motion.circle
          key={`packet-${idx}`}
          r="0.5"
          fill="#ffffff"
          style={{ opacity: pathLength }}
          animate={{
            cx: [c.n1.x, c.n2.x, c.n1.x],
            cy: [c.n1.y, c.n2.y, c.n1.y]
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </motion.svg>
  )
}
