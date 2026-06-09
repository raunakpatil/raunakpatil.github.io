'use client'

import { motion, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

function PatternNode({ node, scrollYProgress }: { node: any, scrollYProgress: any }) {
  // Movement progression: Chaos [0-0.2] -> Precluster [0.2-0.3] -> Distinct [0.45/0.55] -> Merged Core [0.7-0.8]
  const isMachine = node.type === 'machine'
  
  const movePhase2 = isMachine ? [0.45, 0.5] : [0.55, 0.6]
  
  const x = useTransform(scrollYProgress, 
    [0, 0.2, 0.25, movePhase2[0], movePhase2[1], 0.7, 0.8], 
    [node.cx, node.cx, node.px, node.px, node.sx, node.sx, node.mx]
  )
  const y = useTransform(scrollYProgress, 
    [0, 0.2, 0.25, movePhase2[0], movePhase2[1], 0.7, 0.8], 
    [node.cy, node.cy, node.py, node.py, node.sy, node.sy, node.my]
  )
  
  const baseOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8], [0.1, 0.4, 0.6])
  
  return (
    <motion.circle 
      cx={x} cy={y} r={node.r} fill={node.color} 
      style={{ opacity: baseOpacity }}
      animate={!isMachine ? { r: [node.r, node.r * 1.5, node.r] } : {}}
      transition={!isMachine ? { repeat: Infinity, duration: 2 + Math.random(), ease: "easeInOut" } : {}}
    />
  )
}

function PatternLine({ n1, n2, scrollYProgress }: { n1: any, n2: any, scrollYProgress: any }) {
  const isMachine = n1.type === 'machine'
  const movePhase2 = isMachine ? [0.45, 0.5] : [0.55, 0.6]

  const x1 = useTransform(scrollYProgress, [0, 0.2, 0.25, movePhase2[0], movePhase2[1], 0.7, 0.8], [n1.cx, n1.cx, n1.px, n1.px, n1.sx, n1.sx, n1.mx])
  const y1 = useTransform(scrollYProgress, [0, 0.2, 0.25, movePhase2[0], movePhase2[1], 0.7, 0.8], [n1.cy, n1.cy, n1.py, n1.py, n1.sy, n1.sy, n1.my])
  const x2 = useTransform(scrollYProgress, [0, 0.2, 0.25, movePhase2[0], movePhase2[1], 0.7, 0.8], [n2.cx, n2.cx, n2.px, n2.px, n2.sx, n2.sx, n2.mx])
  const y2 = useTransform(scrollYProgress, [0, 0.2, 0.25, movePhase2[0], movePhase2[1], 0.7, 0.8], [n2.cy, n2.cy, n2.py, n2.py, n2.sy, n2.sy, n2.my])
  
  // Lines appear slowly at 0.3, then get strong when their specific network forms
  const opacity = useTransform(scrollYProgress, 
    [0.25, 0.35, movePhase2[0], movePhase2[1]], 
    [0, 0.1, 0.1, isMachine ? 0.2 : 0.15]
  )
  
  return (
    <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={n1.color} strokeWidth={isMachine ? "0.1" : "0.05"} style={{ opacity }} />
  )
}

export function SvgPatterns({ scrollYProgress }: { scrollYProgress: any }) {
  const [nodes, setNodes] = useState<any[]>([])
  const [lines, setLines] = useState<any[]>([])

  useEffect(() => {
    const generatedNodes = []
    
    // Machine Nodes (Rigid, Geometric, Left side)
    for (let i = 0; i < 64; i++) {
      const cx = -40 + Math.random() * 180
      const cy = -40 + Math.random() * 180
      const px = cx * 0.5 + 25
      const py = cy * 0.5 + 25
      
      const col = i % 8
      const row = Math.floor(i / 8)
      const sx = 25 + col * 4
      const sy = 35 + row * 4
      
      const angle = Math.random() * Math.PI * 2
      // Hollow ring for the core
      const rad = 14 + Math.random() * 10
      const mx = 50 + Math.cos(angle) * rad
      const my = 50 + Math.sin(angle) * rad

      generatedNodes.push({ id: `m${i}`, type: 'machine', cx, cy, px, py, sx, sy, mx, my, r: 0.4, color: '#00f0ff' })
    }

    // Human Nodes (Organic, Messy, Right side)
    for (let i = 0; i < 80; i++) {
      const cx = -40 + Math.random() * 180
      const cy = -40 + Math.random() * 180
      const px = cx * 0.5 + 25
      const py = cy * 0.5 + 25
      
      const angle = Math.random() * Math.PI * 2
      const rad = Math.random() * 14
      const sx = 75 + Math.cos(angle) * rad
      const sy = 50 + Math.sin(angle) * rad
      
      const a2 = Math.random() * Math.PI * 2
      // Hollow ring for the core
      const r2 = 14 + Math.random() * 14
      const mx = 50 + Math.cos(a2) * r2
      const my = 50 + Math.sin(a2) * r2

      generatedNodes.push({ id: `h${i}`, type: 'human', cx, cy, px, py, sx, sy, mx, my, r: 0.5, color: '#bc13fe' })
    }
    
    setNodes(generatedNodes)

    const generatedLines = []
    // Connect Machine Nodes
    const machineNodes = generatedNodes.filter(n => n.type === 'machine')
    for (let i = 0; i < 80; i++) {
      const n1 = machineNodes[Math.floor(Math.random() * machineNodes.length)]
      const n2 = machineNodes[Math.floor(Math.random() * machineNodes.length)]
      generatedLines.push({ id: `lm${i}`, n1, n2 })
    }
    // Connect Human Nodes
    const humanNodes = generatedNodes.filter(n => n.type === 'human')
    for (let i = 0; i < 120; i++) {
      const n1 = humanNodes[Math.floor(Math.random() * humanNodes.length)]
      const n2 = humanNodes[Math.floor(Math.random() * humanNodes.length)]
      generatedLines.push({ id: `lh${i}`, n1, n2 })
    }
    setLines(generatedLines)

  }, [])

  const masterOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])
  const masterScale = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8], [1, 1.1, 1.3, 1.8])

  // Central glow only appears after networks merge
  const glowOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 0.6])

  return (
    <motion.svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: masterOpacity, scale: masterScale, transformOrigin: '50% 50%' }}
    >
      <defs>
        <radialGradient id="pattern-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bc13fe" stopOpacity="1" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <motion.g 
        style={{ transformOrigin: '50px 50px' }} 
        animate={{ rotate: 360 }} 
        transition={{ ease: "linear", duration: 150, repeat: Infinity }}
      >
        <motion.circle 
          cx="50" cy="50" r="30" 
          fill="url(#pattern-glow)" 
          style={{ opacity: glowOpacity }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />

        {lines.map(l => <PatternLine key={l.id} n1={l.n1} n2={l.n2} scrollYProgress={scrollYProgress} />)}
        {nodes.map(n => <PatternNode key={n.id} node={n} scrollYProgress={scrollYProgress} />)}
      </motion.g>
    </motion.svg>
  )
}
