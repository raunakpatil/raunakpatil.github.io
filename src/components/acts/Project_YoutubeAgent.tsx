'use client'

import { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GithubRepo } from '@/lib/github'

export function Project_YoutubeAgent({ repo, index }: { repo: GithubRepo, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Track scroll for this 500vh section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // --- Animation Timeline ---
  
  // Scene 1: Nodes appear sequentially (0.0 to 0.20)
  const node0 = useTransform(scrollYProgress, [0.00, 0.04], [0, 1])
  const node1 = useTransform(scrollYProgress, [0.04, 0.08], [0, 1])
  const node2 = useTransform(scrollYProgress, [0.08, 0.12], [0, 1])
  const node3 = useTransform(scrollYProgress, [0.12, 0.16], [0, 1])
  const node4 = useTransform(scrollYProgress, [0.16, 0.20], [0, 1])
  const nodeOpacities = [node0, node1, node2, node3, node4]

  const globalNodesOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]) // Fade out at very end
  
  // Scene 2: Left Paths draw (Wait until 0.25 so nodes are fully visible)
  const leftPathsLength = useTransform(scrollYProgress, [0.25, 0.40], [0, 1])
  
  // Scene 3: Central Convergence & YouTube Logo
  const ytOpacity = useTransform(scrollYProgress, [0.40, 0.45, 0.85, 0.95], [0, 1, 1, 0])
  const ytPathLength = useTransform(scrollYProgress, [0.45, 0.55], [0, 1])
  const ytGlow = useTransform(scrollYProgress, [0.50, 0.60], [0, 1])

  // Scene 4: Distribution / Thumbnails
  const rightPathsLength = useTransform(scrollYProgress, [0.55, 0.70], [0, 1])
  const thumbnailsOpacity = useTransform(scrollYProgress, [0.65, 0.75, 0.85, 0.95], [0, 1, 1, 0])
  const thumbnailsX = useTransform(scrollYProgress, [0.65, 0.75], [-50, 0])

  // Scene 5: The Title Reveal
  const textOpacity = useTransform(scrollYProgress, [0.75, 0.85, 0.90, 1.00], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0.75, 0.85], [50, 0])

  // --- Procedural Generation ---
  
  const nodes = [
    { label: "RESEARCH", y: 150 },
    { label: "SCRIPT", y: 200 },
    { label: "NARRATION", y: 250 },
    { label: "VISUALS", y: 300 },
    { label: "UPLOAD", y: 350 },
  ]

  // Generate dense flowing paths from nodes to center
  const leftPaths = useMemo(() => {
    const paths = []
    nodes.forEach(node => {
      // 10 distinct paths per node to simulate high density data streams
      for(let i=0; i<15; i++) {
        const startX = 220
        const startY = node.y + (Math.sin(i*13) * 10) // slight vertical offset
        const endX = 430
        const endY = 250 + (Math.cos(i*17) * 40) // converge around the logo
        
        // Control point for smooth bezier
        const cpX = 320 + (Math.sin(i*23) * 50)
        const cpY = 250 + (Math.cos(i*29) * 50)
        
        // Some red, mostly white/gray
        const color = i % 3 === 0 ? "#ff0000" : "#ffffff"
        const opacity = (Math.abs(Math.sin(i*31)) * 0.5 + 0.1).toFixed(2)
        const width = (Math.abs(Math.sin(i*37)) * 1.5 + 0.5).toFixed(2)

        paths.push({
          d: `M ${startX} ${startY} Q ${cpX} ${cpY}, ${endX} ${endY}`,
          color, opacity, width
        })
      }
    })
    return paths
  }, [])

  // Generate right side output paths and thumbnails
  const rightPaths = useMemo(() => {
    const paths = []
    const thumbs = []
    for(let i=0; i<30; i++) {
      const startX = 570
      const startY = 250 + (Math.sin(i*41) * 30)
      const endX = 1000
      const endY = 250 + (Math.sin(i*43) * 200) // spread out massively
      
      const cpX = 750
      const cpY = 250 + (Math.cos(i*47) * 50)

      paths.push({
        d: `M ${startX} ${startY} Q ${cpX} ${cpY}, ${endX} ${endY}`,
        color: i % 2 === 0 ? "#ff0000" : "#ffffff",
        opacity: (Math.abs(Math.sin(i*53)) * 0.4 + 0.1).toFixed(2)
      })

      // Add a thumbnail at a random spot along the trajectory
      thumbs.push({
        x: endX - (Math.abs(Math.sin(i*59)) * 200) - 50,
        y: endY - (Math.abs(Math.cos(i*61)) * 50),
        scale: (Math.abs(Math.sin(i*67)) * 0.5 + 0.5).toFixed(2)
      })
    }
    return { paths, thumbs }
  }, [])

  return (
    <section ref={ref} className="relative h-[500vh] w-full bg-transparent text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Massive SVG Canvas matching the reference image */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <svg className="w-full max-w-[1400px] h-full drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="yt-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff0000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* --- SCENE 1: LEFT NODES --- */}
            <motion.g style={{ opacity: globalNodesOpacity }}>
              {nodes.map((node, i) => (
                <motion.g key={`node-${i}`} style={{ opacity: nodeOpacities[i] }}>
                  {/* Pill border */}
                  <rect x="80" y={node.y - 15} width="120" height="30" rx="15" fill="transparent" stroke="#555555" strokeWidth="1" />
                  {/* Icon dot */}
                  <circle cx="100" cy={node.y} r="4" fill="#ffffff" />
                  {/* Text */}
                  <text x="115" y={node.y + 4} fill="#ffffff" fontSize="10" fontFamily="monospace" letterSpacing="1">{node.label}</text>
                  {/* Connection line */}
                  <line x1="200" y1={node.y} x2="220" y2={node.y} stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
                </motion.g>
              ))}
            </motion.g>

            {/* --- SCENE 1 & 2: LEFT PATHS MERGING --- */}
            <g>
              {leftPaths.map((p, i) => (
                <motion.path 
                  key={`lpath-${i}`}
                  d={p.d}
                  stroke={p.color}
                  strokeWidth={p.width}
                  fill="transparent"
                  strokeOpacity={p.opacity}
                  style={{ pathLength: leftPathsLength }}
                />
              ))}
            </g>

            {/* --- SCENE 3: THE YOUTUBE CORE --- */}
            <motion.g style={{ opacity: ytOpacity }}>
              {/* Background glow circle */}
              <motion.circle cx="500" cy="250" r="100" fill="url(#yt-glow)" style={{ opacity: ytGlow }} />
              
              {/* The rounded rectangle (Top Half) */}
              <motion.path 
                d="M 430 250 L 430 225 A 25 25 0 0 1 455 200 L 545 200 A 25 25 0 0 1 570 225 L 570 250"
                fill="transparent" stroke="#ff0000" strokeWidth="4"
                style={{ pathLength: ytPathLength }}
              />
              {/* The rounded rectangle (Bottom Half) */}
              <motion.path 
                d="M 430 250 L 430 275 A 25 25 0 0 0 455 300 L 545 300 A 25 25 0 0 0 570 275 L 570 250"
                fill="transparent" stroke="#ff0000" strokeWidth="4"
                style={{ pathLength: ytPathLength }}
              />
              
              {/* Inner chaotic path 1 (Top Half) */}
              <motion.path 
                d="M 428 250 L 428 225 A 27 27 0 0 1 455 198 L 545 198 A 27 27 0 0 1 572 225 L 572 250"
                fill="transparent" stroke="#ff5555" strokeWidth="1" strokeDasharray="10 5" 
                style={{ pathLength: ytPathLength }} 
              />
              {/* Inner chaotic path 1 (Bottom Half) */}
              <motion.path 
                d="M 428 250 L 428 275 A 27 27 0 0 0 455 302 L 545 302 A 27 27 0 0 0 572 275 L 572 250"
                fill="transparent" stroke="#ff5555" strokeWidth="1" strokeDasharray="10 5" 
                style={{ pathLength: ytPathLength }} 
              />

              {/* Inner chaotic path 2 (Top Half) */}
              <motion.path 
                d="M 432 250 L 432 225 A 23 23 0 0 1 455 202 L 545 202 A 23 23 0 0 1 568 225 L 568 250"
                fill="transparent" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" 
                style={{ pathLength: ytPathLength }} 
              />
              {/* Inner chaotic path 2 (Bottom Half) */}
              <motion.path 
                d="M 432 250 L 432 275 A 23 23 0 0 0 455 298 L 545 298 A 23 23 0 0 0 568 275 L 568 250"
                fill="transparent" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" 
                style={{ pathLength: ytPathLength }} 
              />

              {/* The Play Triangle (Top Half) */}
              <motion.path 
                d="M 480 250 L 480 220 L 530 250" 
                fill="transparent" stroke="#ffffff" strokeWidth="3"
                style={{ pathLength: ytPathLength }}
              />
              {/* The Play Triangle (Bottom Half) */}
              <motion.path 
                d="M 480 250 L 480 280 L 530 250" 
                fill="transparent" stroke="#ffffff" strokeWidth="3"
                style={{ pathLength: ytPathLength }}
              />
            </motion.g>

            {/* --- SCENE 4: DISTRIBUTION & THUMBNAILS --- */}
            <g>
              {rightPaths.paths.map((p, i) => (
                <motion.path 
                  key={`rpath-${i}`}
                  d={p.d}
                  stroke={p.color}
                  strokeWidth="1"
                  fill="transparent"
                  strokeOpacity={p.opacity}
                  style={{ pathLength: rightPathsLength }}
                />
              ))}
            </g>

            <motion.g style={{ opacity: thumbnailsOpacity, x: thumbnailsX }}>
              {rightPaths.thumbs.map((t, i) => (
                <g key={`thumb-${i}`} transform={`translate(${t.x}, ${t.y}) scale(${t.scale})`}>
                  {/* Thumbnail Box */}
                  <rect x="0" y="0" width="60" height="34" rx="2" fill="#111111" stroke="#ff0000" strokeWidth="1" />
                  {/* Inner Play Icon */}
                  <polygon points="25,12 35,17 25,22" fill="#ffffff" opacity="0.8" />
                </g>
              ))}
            </motion.g>

          </svg>
        </div>

        {/* --- SCENE 5: THE REVEAL TEXT --- */}
        <motion.div 
          className="absolute bottom-12 z-10 w-full flex flex-col items-center justify-center text-center px-6"
          style={{ opacity: textOpacity, y: textY }}
        >

          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-[#ff0000]">YouTube</span> Agentic AI Studio
          </h2>
          
          <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed mb-8 max-w-2xl">
            {repo.description || "A 100% free AI pipeline that researches, scripts, narrates, and uploads faceless YouTube videos — one command."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {repo.language && (
              <span className="px-3 py-1 border border-gray-600 rounded-full text-xs font-mono text-gray-300 bg-black/80 backdrop-blur-md">
                {repo.language}
              </span>
            )}
            {repo.topics?.slice(0, 3).map(topic => (
              <span key={topic} className="px-3 py-1 border border-[#ff0000]/50 rounded-full text-xs font-mono text-[#ff0000] bg-black/80 backdrop-blur-md">
                {topic}
              </span>
            ))}
          </div>

          <div className="mt-10 flex justify-center w-full">
            <a 
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2 text-sm pointer-events-auto"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              View Repository
            </a>
          </div>
        </motion.div>
        
      </div>
    </section>
  )
}
