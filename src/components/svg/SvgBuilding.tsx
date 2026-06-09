'use client'

import { motion, useTransform } from 'framer-motion'

export function SvgBuilding({ scrollYProgress }: { scrollYProgress: any }) {
  const opacity = useTransform(scrollYProgress, [0.33, 0.4, 0.6, 0.66], [0, 1, 1, 0])
  
  // Staggered snake drawing animations - shoot from edges to center
  const drawWhite = useTransform(scrollYProgress, [0.35, 0.5], [0, 1])
  const drawRed = useTransform(scrollYProgress, [0.4, 0.55], [0, 1])
  const drawBlue = useTransform(scrollYProgress, [0.45, 0.6], [0, 1])
  
  // Blue wedges animation - fade in after lines crash
  const drawBlueWedgesOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 0.3])

  const center = { x: 50, y: 25 }

  // True corners and edges of the 100x50 viewBox
  const corners = [
    { x: 0, y: 0 }, // TL
    { x: 100, y: 0 }, // TR
    { x: 100, y: 50 }, // BR
    { x: 0, y: 50 }, // BL
  ]
  const edges = [
    { x: 50, y: 0 }, // Top
    { x: 100, y: 25 }, // Right
    { x: 50, y: 50 }, // Bottom
    { x: 0, y: 25 }, // Left
  ]

  // The 8 blue triangles that fill the gaps between the crosses
  const blueWedges = [
    "M 50 25 L 0 0 L 50 0 Z", // TL top
    "M 50 25 L 0 0 L 0 25 Z", // TL left
    "M 50 25 L 100 0 L 50 0 Z", // TR top
    "M 50 25 L 100 0 L 100 25 Z", // TR right
    "M 50 25 L 100 50 L 100 25 Z", // BR right
    "M 50 25 L 100 50 L 50 50 Z", // BR bottom
    "M 50 25 L 0 50 L 50 50 Z", // BL bottom
    "M 50 25 L 0 50 L 0 25 Z", // BL left
  ]

  return (
    <motion.svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 50" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <defs>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-glow-heavy" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* The 8 Blue Wedges (Glass Panels) */}
      <motion.g style={{ opacity: drawBlueWedgesOpacity }}>
        {blueWedges.map((d, i) => (
          <path key={`wedge-${i}`} d={d} fill="#0044FF" />
        ))}
      </motion.g>

      {/* The Blue Field Frame (Shoots around the perimeter) */}
      <motion.g opacity="0.3" filter="url(#neon-glow)">
        <motion.line x1="0" y1="0" x2="100" y2="0" stroke="#0044FF" strokeWidth="2" style={{ pathLength: drawBlue }} />
        <motion.line x1="100" y1="0" x2="100" y2="50" stroke="#0044FF" strokeWidth="2" style={{ pathLength: drawBlue }} />
        <motion.line x1="100" y1="50" x2="0" y2="50" stroke="#0044FF" strokeWidth="2" style={{ pathLength: drawBlue }} />
        <motion.line x1="0" y1="50" x2="0" y2="0" stroke="#0044FF" strokeWidth="2" style={{ pathLength: drawBlue }} />
      </motion.g>

      <motion.g filter="url(#neon-glow)">
        {/* White Diagonals (Shooting from 4 corners to center) */}
        {corners.map((c, i) => (
          <motion.line 
            key={`w-diag-${i}`}
            x1={c.x} y1={c.y} x2={center.x} y2={center.y} 
            stroke="#FFFFFF" strokeWidth="3" fill="transparent" 
            style={{ pathLength: drawWhite }} opacity="0.4" 
          />
        ))}

        {/* White Straight Cross Outline (Shooting from 4 edges to center) */}
        {edges.map((e, i) => (
          <motion.line 
            key={`w-edge-${i}`}
            x1={e.x} y1={e.y} x2={center.x} y2={center.y} 
            stroke="#FFFFFF" strokeWidth="6" fill="transparent" 
            style={{ pathLength: drawWhite }} opacity="0.3" 
          />
        ))}

        {/* Red Diagonals (Shooting from 4 corners to center) */}
        {corners.map((c, i) => (
          <motion.line 
            key={`r-diag-${i}`}
            x1={c.x} y1={c.y} x2={center.x} y2={center.y} 
            stroke="#C8102E" strokeWidth="1.5" fill="transparent" 
            style={{ pathLength: drawRed }} 
          />
        ))}
      </motion.g>

      <motion.g filter="url(#neon-glow-heavy)">
        {/* Red Straight Cross (Shooting from 4 edges to center) */}
        {edges.map((e, i) => (
          <motion.line 
            key={`r-edge-${i}`}
            x1={e.x} y1={e.y} x2={center.x} y2={center.y} 
            stroke="#C8102E" strokeWidth="3" fill="transparent" 
            style={{ pathLength: drawRed }} 
          />
        ))}
      </motion.g>
    </motion.svg>
  )
}
