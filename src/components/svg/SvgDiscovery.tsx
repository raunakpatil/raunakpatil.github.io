'use client'

import { motion, useTransform } from 'framer-motion'

export function SvgDiscovery({ scrollYProgress }: { scrollYProgress: any }) {
  // Master opacity fade in and out for the whole section
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  
  // Sun rising animation tied to scroll
  const sunY = useTransform(scrollYProgress, [0.2, 0.6], [90, 30])
  const skyOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1])

  // Parallax for mountains
  const mountainBackY = useTransform(scrollYProgress, [0.2, 0.6], [15, 0])
  const mountainMidY = useTransform(scrollYProgress, [0.2, 0.6], [8, 0])

  return (
    <motion.svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <defs>
        {/* Glow behind the sun */}
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffaa00" stopOpacity="1" />
          <stop offset="25%" stopColor="#ff0055" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#bc13fe" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#bc13fe" stopOpacity="0" />
        </radialGradient>
        
        {/* Sky gradient that brightens */}
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a0845" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="mountain-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a154b" />
          <stop offset="100%" stopColor="#1a0525" />
        </linearGradient>

        <linearGradient id="mountain-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c0b38" />
          <stop offset="100%" stopColor="#0a0212" />
        </linearGradient>

        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bc13fe" stopOpacity="0" />
          <stop offset="100%" stopColor="#05010a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Background Sky */}
      <motion.rect x="0" y="0" width="100" height="100" fill="url(#sky-grad)" style={{ opacity: skyOpacity }} />

      {/* The Sun Group */}
      <motion.g style={{ y: sunY }}>
        <circle 
          cx="50" cy="0"
          r="40" 
          fill="url(#sun-glow)" 
        />
        <circle 
          cx="50" cy="0"
          r="6" 
          fill="#ffebd6" 
        />
      </motion.g>

      {/* Back Mountains (Parallax) */}
      <motion.path 
        d="M -10 100 L 15 45 L 35 65 L 60 35 L 85 70 L 110 40 L 110 100 Z" 
        fill="url(#mountain-back)"
        style={{ y: mountainBackY }}
      />

      {/* Mid Mountains (Parallax) */}
      <motion.path 
        d="M -20 100 L 5 65 L 25 50 L 50 80 L 75 45 L 95 60 L 120 100 Z" 
        fill="url(#mountain-mid)"
        style={{ y: mountainMidY }}
      />

      {/* Front Foreground (Static Silhouette) */}
      <path 
        d="M -10 100 L 20 80 L 45 90 L 70 75 L 110 95 L 110 100 Z" 
        fill="#05010a"
      />
      
      {/* Fog overlay at bottom to blend into the next section */}
      <rect x="0" y="80" width="100" height="20" fill="url(#fog)" />
    </motion.svg>
  )
}
