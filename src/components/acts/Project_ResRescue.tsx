'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { GithubRepo } from '@/lib/github'

function ResRescueNode({ 
  scrollYProgress, 
  chaosX, chaosY, 
  gridX, gridY, 
  delay 
}: { 
  scrollYProgress: MotionValue<number>, 
  chaosX: number, chaosY: number, 
  gridX: number, gridY: number, 
  delay: number 
}) {
  // Chaos (0-0.3) -> Interpolate to Grid (0.3-0.55)
  const x = useTransform(scrollYProgress, [0.3 + delay, 0.52 + delay], [chaosX, gridX])
  const y = useTransform(scrollYProgress, [0.3 + delay, 0.52 + delay], [chaosY, gridY])
  
  // Fade in early to form the starry sky
  const opacity = useTransform(scrollYProgress, [0.02 + delay, 0.1 + delay], [0, 1])
  
  // Turn green when CV forms
  const fill = useTransform(scrollYProgress, [0.45, 0.55], ["#ffffff", "#00ff88"])

  return (
    <motion.circle 
      cx={x} cy={y} r="2.5" 
      style={{ opacity, fill }} 
      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
    />
  )
}

function ResRescueConnection({
  scrollYProgress,
  p1, p2, delay
}: {
  scrollYProgress: MotionValue<number>,
  p1: { chaosX: number, chaosY: number, gridX: number, gridY: number },
  p2: { chaosX: number, chaosY: number, gridX: number, gridY: number },
  delay: number
}) {
  // Constellations appear right as the chaos starts breaking into the grid
  const opacity = useTransform(scrollYProgress, [0.32 + delay * 0.5, 0.38 + delay * 0.5, 0.5, 0.62], [0, 0.05, 0.05, 0])
  const x1 = useTransform(scrollYProgress, [0.3, 0.52], [p1.chaosX, p1.gridX])
  const y1 = useTransform(scrollYProgress, [0.3, 0.52], [p1.chaosY, p1.gridY])
  const x2 = useTransform(scrollYProgress, [0.3, 0.52], [p2.chaosX, p2.gridX])
  const y2 = useTransform(scrollYProgress, [0.3, 0.52], [p2.chaosY, p2.gridY])

  return (
    <motion.line 
      x1={x1} y1={y1} x2={x2} y2={y2} 
      stroke="#ffffff" strokeWidth="0.5" 
      style={{ opacity }} 
    />
  )
}

export function Project_ResRescue({ repo, index }: { repo: GithubRepo, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Scene 1: First Narrative Text (0.02 to 0.15)
  const text1Opacity = useTransform(scrollYProgress, [0.02, 0.05, 0.12, 0.15], [0, 1, 1, 0])
  const text1Y = useTransform(scrollYProgress, [0.02, 0.15], [20, -20])

  // Scene 2: The Moon & Second Text (0.15 to 0.32)
  const moonOpacity = useTransform(scrollYProgress, [0.15, 0.18], [0, 1])
  const text2Opacity = useTransform(scrollYProgress, [0.18, 0.22, 0.28, 0.32], [0, 1, 1, 0])
  const text2Y = useTransform(scrollYProgress, [0.18, 0.32], [20, -20])

  // Scene 3: The Moon's Journey & Morph (0.32 to 0.62)
  const moonX = useTransform(scrollYProgress, [0.32, 0.62], [150, 500])
  const moonY = useTransform(scrollYProgress, [0.32, 0.62], [80, 45])
  // Full Moon -> Slim Pill Rectangle morphing math
  // Starts as a 60x60 circle (r=30), morphs into a 150x22 pill shape (rx=11)
  const morphWidth = useTransform(scrollYProgress, [0.35, 0.62], [60, 150])
  const morphHeight = useTransform(scrollYProgress, [0.35, 0.62], [60, 22])
  const morphRX = useTransform(scrollYProgress, [0.35, 0.62], [30, 11])
  const morphOffsetX = useTransform(scrollYProgress, [0.35, 0.62], [-30, -75])
  const morphOffsetY = useTransform(scrollYProgress, [0.35, 0.62], [-30, -11])
  const textYourCVOpacity = useTransform(scrollYProgress, [0.62, 0.65], [0, 1])

  // Scene 4: CV Document Output (0.62 to 0.65)
  const docOpacity = useTransform(scrollYProgress, [0.62, 0.65], [0, 1])
  const docScale = useTransform(scrollYProgress, [0.62, 0.65], [0.95, 1])

  // Scene 5: ATS Score Progress Bar (0.62 to 0.75)
  const barOpacity = useTransform(scrollYProgress, [0.62, 0.65], [0, 1])
  const barScaleX = useTransform(scrollYProgress, [0.65, 0.75], [0, 1])

  // Scene 6: Reveal Project Info Text (0.75 to 0.95)
  const textOpacity = useTransform(scrollYProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0.75, 0.85], [50, 0])

  // Calculate ATS Score counter state (0.65 to 0.75)
  const [score, setScore] = useState(0)
  
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.65) setScore(0)
      else if (latest > 0.75) setScore(99)
      else {
        // Map 0.65-0.75 to 0-99
        const progress = (latest - 0.65) / 0.10
        setScore(Math.floor(progress * 99))
      }
    })
  }, [scrollYProgress])

  // Generate Nodes: Starry Sky -> Resume Layout
  type ResNode = { id: number, chaosX: number, chaosY: number, gridX: number, gridY: number, delay: number }
  type ResConnection = { n1: ResNode, n2: ResNode, delay: number }

  const data = useMemo(() => {
    const nodes: ResNode[] = []
    const connections: ResConnection[] = []
    
    // CV Layout Math (A4 Aspect Ratio)
    const layoutLines = [
      // Header
      { y: 80, x1: 430, x2: 570, count: 6 },
      { y: 95, x1: 390, x2: 610, count: 10 },
      // Summary
      { y: 130, x1: 380, x2: 620, count: 14 },
      { y: 145, x1: 380, x2: 600, count: 13 },
      { y: 160, x1: 380, x2: 520, count: 8 },
      // Experience 1
      { y: 200, x1: 380, x2: 460, count: 5 }, // Title
      { y: 220, x1: 400, x2: 620, count: 12 }, // Bullet
      { y: 235, x1: 400, x2: 580, count: 10 }, // Bullet
      // Experience 2
      { y: 275, x1: 380, x2: 480, count: 6 }, // Title
      { y: 295, x1: 400, x2: 620, count: 12 }, // Bullet
      { y: 310, x1: 400, x2: 560, count: 9 }, // Bullet
      // Skills
      { y: 350, x1: 380, x2: 430, count: 3 }, // Title
      { y: 370, x1: 380, x2: 620, count: 14 }, // Row 1
      { y: 385, x1: 380, x2: 540, count: 9 }, // Row 2
      // Projects
      { y: 425, x1: 380, x2: 450, count: 4 }, // Title
      { y: 445, x1: 400, x2: 600, count: 12 }, // Bullet
    ]

    let id = 0;
    layoutLines.forEach(line => {
      const spacingX = line.count > 1 ? (line.x2 - line.x1) / (line.count - 1) : 0
      for(let c = 0; c < line.count; c++) {
        nodes.push({
          id: id++,
          // Vast starry sky distribution
          chaosX: -100 + Math.abs(Math.sin(id * 13)) * 1200,
          chaosY: -50 + Math.abs(Math.cos(id * 17)) * 600,
          gridX: line.x1 + c * spacingX,
          gridY: line.y,
          delay: Math.abs(Math.sin(id * 23)) * 0.1
        })
      }
    })

    // Generate random constellations for the chaos phase
    for(let i=0; i<180; i++) {
      const idx1 = Math.floor(Math.abs(Math.sin(i*31)) * 1000) % nodes.length
      const idx2 = Math.floor(Math.abs(Math.cos(i*37)) * 1000) % nodes.length
      const n1 = nodes[idx1]
      const n2 = nodes[idx2]
      connections.push({ n1, n2, delay: Math.abs(Math.sin(i*41)) * 0.1 })
    }

    return { nodes, connections }
  }, [])

  return (
    <section ref={ref} className="relative h-[800vh] w-full bg-transparent text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* --- SCENE 1 & 2: NARRATIVE TEXT --- */}
        <motion.div 
          className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ opacity: text1Opacity, y: text1Y }}
        >
          <h3 className="text-3xl md:text-5xl font-serif italic text-gray-200 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            The sky has countless stars
          </h3>
        </motion.div>

        <motion.div 
          className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ opacity: text2Opacity, y: text2Y }}
        >
          <h3 className="text-3xl md:text-5xl font-serif italic text-gray-200 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            Yet every eye finds the moon
          </h3>
        </motion.div>


        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <svg className="w-full max-w-[1400px] h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            
            {/* Neural Connections / Constellations */}
            {data.connections.map((c, i) => (
              <ResRescueConnection 
                key={`conn-${i}`}
                scrollYProgress={scrollYProgress}
                p1={c.n1} p2={c.n2} delay={c.delay}
              />
            ))}

            {/* Nodes / Stars */}
            {data.nodes.map(node => (
              <ResRescueNode 
                key={`node-${node.id}`}
                scrollYProgress={scrollYProgress}
                chaosX={node.chaosX} chaosY={node.chaosY}
                gridX={node.gridX} gridY={node.gridY}
                delay={node.delay}
              />
            ))}

            {/* --- SCENE 3: THE MOON MORPHING --- */}
            <motion.g style={{ x: moonX, y: moonY, opacity: moonOpacity, scale: 1.5 }}>
              {/* The Full Moon -> Pill Morph */}
              <motion.rect 
                style={{
                  x: morphOffsetX, y: morphOffsetY,
                  width: morphWidth, height: morphHeight, rx: morphRX
                }}
                fill="#ffffff" 
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              />
              
              {/* "ResRescue Resume" Text inside Pill */}
              <motion.text 
                x="0" y="4" textAnchor="middle" fill="#004d26" fontSize="11" fontFamily="monospace" fontWeight="bold"
                style={{ opacity: textYourCVOpacity }}
                className="drop-shadow-[0_0_2px_rgba(0,0,0,0.3)] tracking-widest"
              >
                ResRescue Resume
              </motion.text>
            </motion.g>

            {/* --- SCENE 4: CV FRAME & PROGRESS BAR --- */}
            {/* The Document Frame (Emerges as CV resolves) */}
            <motion.rect 
              x="350" y="25" width="300" height="440" rx="6"
              fill="transparent" stroke="#00ff88" strokeWidth="2"
              style={{ opacity: docOpacity, scale: docScale, transformOrigin: "500px 245px" }}
              className="drop-shadow-[0_0_15px_rgba(0,255,136,0.6)]"
            />

            {/* ATS Score Progress Bar */}
            <motion.g style={{ opacity: barOpacity }}>
              <text x="350" y="5" fill="#ffffff" fontSize="12" fontFamily="monospace" className="tracking-widest opacity-60">
                ATS COMPATIBILITY
              </text>
              <text x="650" y="5" fill="#00ff88" fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="end" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]">
                {score}%
              </text>
              {/* Background Track */}
              <rect x="350" y="15" width="300" height="4" fill="#222222" rx="2" />
              {/* Fill Track */}
              <motion.rect 
                x="350" y="15" width="300" height="4" fill="#00ff88" rx="2"
                style={{ scaleX: barScaleX, transformOrigin: "350px 15px" }}
                className="drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]"
              />
            </motion.g>

          </svg>
        </div>

        {/* --- SCENE 6: THE REVEAL TEXT --- */}
        <motion.div 
          className="absolute bottom-12 z-10 w-full flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ y: textY }}
        >
          <motion.div 
            className="p-12 rounded-3xl drop-shadow-2xl border"
            style={{
              backgroundColor: useTransform(textOpacity, v => `rgba(0,0,0,${v * 0.5})`),
              borderColor: useTransform(textOpacity, v => `rgba(255,255,255,${v * 0.05})`),
              backdropFilter: useTransform(textOpacity, v => `blur(${v * 24}px)`),
              WebkitBackdropFilter: useTransform(textOpacity, v => `blur(${v * 24}px)`)
            }}
          >
            <motion.div style={{ opacity: textOpacity }}>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="text-[#00ff88] drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">ResRescue</span> ATS Optimizer
              </h2>
              
              <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed mb-8 max-w-2xl">
                {repo.description || "A Generative AI pipeline that restructures chaotic human input into perfect, high-scoring ATS-compliant CV formats."}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {repo.language && (
                  <span className="px-4 py-2 border border-gray-600 rounded-full text-sm font-mono text-gray-300 bg-black/80">
                    {repo.language}
                  </span>
                )}
                {repo.topics?.slice(0, 3).map(topic => (
                  <span key={topic} className="px-4 py-2 border border-[#00ff88]/50 rounded-full text-sm font-mono text-[#00ff88] bg-black/80">
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
          </motion.div>
        </motion.div>
        
      </div>
    </section>
  )
}
