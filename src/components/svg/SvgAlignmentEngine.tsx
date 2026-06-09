'use client'

import { useEffect, useState } from 'react'
import { motion, useTransform, MotionValue, useMotionValue } from 'framer-motion'

interface WordNode {
  id: string
  rawText: string
  cleanText: string
  ix: number // initial X
  iy: number // initial Y
  tx: number // target X (aligned)
  ty: number // target Y (aligned)
  delay: number
}

const RAW_FRAGMENTS = [
  'uh...', 'lemme check', 'custmer', 'prodct', 'like', 'um', 'sytem',
  'tok_1', 'transcrpt', 'helo', 'plase', 'wait', 'hold on', '[noise]',
  'error_404', 'NaN', 'null', 'undefined', 'accracy', 'effciency'
]

const CLEAN_FRAGMENTS = [
  'customer', 'product', 'system', 'transcript', 'hello', 'please',
  'accuracy', 'efficiency', 'workflow', 'query', 'response', 'context'
]

export function SvgAlignmentEngine({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [nodes, setNodes] = useState<WordNode[]>([])
  
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 100)
      mouseY.set((e.clientY / window.innerHeight) * 100)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const generated: WordNode[] = []
    
    // Create columns for the aligned state
    const cols = 8
    const rows = 25
    
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      
      const rawText = RAW_FRAGMENTS[Math.floor(Math.random() * RAW_FRAGMENTS.length)]
      const cleanText = CLEAN_FRAGMENTS[Math.floor(Math.random() * CLEAN_FRAGMENTS.length)]
      
      // Chaotic starting positions (spread widely)
      const ix = -20 + Math.random() * 140
      const iy = -50 + Math.random() * 200
      
      // Aligned grid positions
      const tx = 15 + col * 10
      const ty = -10 + row * 5
      
      // Delay offset for the evaluation sweep
      const delay = Math.random() * 0.2
      
      generated.push({
        id: `w${i}`,
        rawText,
        cleanText,
        ix, iy, tx, ty, delay
      })
    }
    setNodes(generated)
  }, [])

  // The evaluation plane sweeps down from Y=0 to Y=100 between scroll 0.4 and 0.6
  const evalSweep = useTransform(scrollYProgress, [0.35, 0.6], [-20, 120])
  
  const masterOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])

  return (
    <motion.svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      style={{ opacity: masterOpacity }}
    >
      <defs>
        <linearGradient id="eval-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bc13fe" stopOpacity="0" />
          <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#bc13fe" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* The words */}
      <g className="font-mono text-[1.5px]">
        {nodes.map(n => (
          <Word key={n.id} node={n} scrollYProgress={scrollYProgress} evalSweep={evalSweep} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </g>

      {/* The Evaluation Plane (a horizontal glowing line sweeping down) */}
      <motion.rect
        x="0"
        width="100"
        height="10"
        fill="url(#eval-glow)"
        style={{ y: evalSweep }}
      />
    </motion.svg>
  )
}

function Word({ 
  node, 
  scrollYProgress, 
  evalSweep, 
  mouseX, 
  mouseY 
}: { 
  node: WordNode, 
  scrollYProgress: MotionValue<number>, 
  evalSweep: MotionValue<number>,
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>
}) {
  const startAlign = 0.4 + node.delay
  const endAlign = 0.55 + node.delay

  const x = useTransform(scrollYProgress, [0, 0.3, startAlign, endAlign], [node.ix, node.ix, node.ix, node.tx])
  const y = useTransform(scrollYProgress, [0, 0.3, startAlign, endAlign], [node.iy, node.iy, node.iy, node.ty])
  
  // Chaos motion (drifting)
  const driftX = useTransform(scrollYProgress, [0, 0.3], [0, (Math.random() - 0.5) * 10])
  const driftY = useTransform(scrollYProgress, [0, 0.3], [0, (Math.random() - 0.5) * 10])

  const baseFinalX = useTransform(() => {
    const progress = scrollYProgress.get()
    if (progress < 0.3) return x.get() + driftX.get()
    return x.get()
  })
  
  const baseFinalY = useTransform(() => {
    const progress = scrollYProgress.get()
    if (progress < 0.3) return y.get() + driftY.get()
    return y.get()
  })

  // Repulsion logic
  const repelStrength = useTransform(scrollYProgress, [0, startAlign, endAlign], [1, 1, 0])

  const displayX = useTransform(() => {
    const fx = baseFinalX.get()
    const fy = baseFinalY.get()
    const mx = mouseX.get()
    const my = mouseY.get()
    const strength = repelStrength.get()

    if (strength === 0) return fx

    const dx = fx - mx
    const dy = fy - my
    const distSq = dx*dx + dy*dy
    // 225 is radius 15^2
    if (distSq > 0 && distSq < 225) {
      const dist = Math.sqrt(distSq)
      // Max force of 5 units when distance is 0, fading to 0 at distance 15
      const force = ((15 - dist) / 15) * 5 * strength
      return fx + (dx / dist) * force
    }
    return fx
  })

  const displayY = useTransform(() => {
    const fx = baseFinalX.get()
    const fy = baseFinalY.get()
    const mx = mouseX.get()
    const my = mouseY.get()
    const strength = repelStrength.get()

    if (strength === 0) return fy

    const dx = fx - mx
    const dy = fy - my
    const distSq = dx*dx + dy*dy
    if (distSq > 0 && distSq < 225) {
      const dist = Math.sqrt(distSq)
      const force = ((15 - dist) / 15) * 5 * strength
      return fy + (dy / dist) * force
    }
    return fy
  })

  // Color transitions: from dark gray (noise) to bright cyan (aligned)
  const color = useTransform(scrollYProgress, [startAlign, endAlign], ['#4b5563', '#00f0ff'])
  
  // Opacity: some words fade out if they were pure noise
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 0.4, 0.4, 0])

  return (
    <motion.g style={{ opacity }}>
      {/* Raw text fades out */}
      <motion.text
        style={{ x: displayX, y: displayY, fill: color, opacity: useTransform(scrollYProgress, [startAlign, endAlign], [1, 0]) }}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {node.rawText}
      </motion.text>
      
      {/* Clean text fades in */}
      <motion.text
        style={{ x: displayX, y: displayY, fill: color, opacity: useTransform(scrollYProgress, [startAlign, endAlign], [0, 1]) }}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {node.cleanText}
      </motion.text>
    </motion.g>
  )
}
