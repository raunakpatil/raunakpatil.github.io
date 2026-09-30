'use client'

import { motion, useTransform } from 'framer-motion'

export function SvgLearning({ scrollYProgress }: { scrollYProgress: any }) {
  const opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.5, 0.6], [0, 1, 1, 0])
  const pathLength = useTransform(scrollYProgress, [0.35, 0.5], [0, 1])

  return (
    <motion.svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="learning-glow" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Main Trunk */}
      <motion.path 
        d="M50 100 C50 80, 50 60, 50 40" 
        stroke="url(#learning-glow)" 
        strokeWidth="0.5" 
        fill="transparent"
        style={{ pathLength }}
      />

      {/* Branches */}
      <motion.path 
        d="M50 70 C40 60, 20 50, 10 30" 
        stroke="url(#learning-glow)" 
        strokeWidth="0.2" 
        fill="transparent"
        style={{ pathLength }}
      />
      <motion.path 
        d="M50 60 C60 50, 80 40, 90 20" 
        stroke="url(#learning-glow)" 
        strokeWidth="0.2" 
        fill="transparent"
        style={{ pathLength }}
      />
      <motion.path 
        d="M50 40 C35 30, 30 20, 25 5" 
        stroke="url(#learning-glow)" 
        strokeWidth="0.1" 
        fill="transparent"
        style={{ pathLength }}
      />
      <motion.path 
        d="M50 40 C65 30, 70 20, 75 5" 
        stroke="url(#learning-glow)" 
        strokeWidth="0.1" 
        fill="transparent"
        style={{ pathLength }}
      />

      {/* Synaptic Nodes */}
      <motion.circle cx="50" cy="40" r="0.8" fill="#ffffff" style={{ opacity: pathLength }} />
      <motion.circle cx="10" cy="30" r="0.4" fill="#ffffff" style={{ opacity: pathLength }} />
      <motion.circle cx="90" cy="20" r="0.4" fill="#ffffff" style={{ opacity: pathLength }} />
    </motion.svg>
  )
}
