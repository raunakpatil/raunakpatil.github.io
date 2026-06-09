'use client'

import { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GithubRepo } from '@/lib/github'
import Image from 'next/image'

export function Project_Titanic({ repo, index }: { repo: GithubRepo, index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Scene 1: The Disaster (Titanic Background)
  const titanicOpacity = useTransform(scrollYProgress, [0.05, 0.1, 0.8, 0.9], [0, 0.6, 0.2, 0])
  const titanicBlur = useTransform(scrollYProgress, [0.15, 0.25], ["blur(0px)", "blur(12px)"])
  const titanicScale = useTransform(scrollYProgress, [0.05, 0.9], [1, 1.1])
  
  const disasterTextOpacity = useTransform(scrollYProgress, [0.05, 0.1, 0.2, 0.25], [0, 1, 1, 0])
  const disasterTextScale = useTransform(scrollYProgress, [0.05, 0.1], [0.9, 1])
  const disasterTextY = useTransform(scrollYProgress, [0.05, 0.1, 0.2, 0.25], [30, 0, 0, -30])

  // Scene 2: The Data (Inputs)
  const dataLabelsOpacity = useTransform(scrollYProgress, [0.25, 0.3, 0.8, 0.9], [0, 1, 1, 0])
  const inputPathLength = useTransform(scrollYProgress, [0.25, 0.4], [0, 1])

  // Scene 3: The Model (SVG Engine Core)
  const engineOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.8, 0.9], [0, 1, 1, 0])
  const engineRotation = useTransform(scrollYProgress, [0.25, 0.9], [0, 180])
  const engineScale = useTransform(scrollYProgress, [0.3, 0.4], [0.5, 1])

  // Scene 4: The Prediction (Outputs)
  const outputPathLength = useTransform(scrollYProgress, [0.4, 0.6], [0, 1])
  const outputLabelsOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.8, 0.9], [0, 1, 1, 0])
  
  // Scene 5: The Impact (Title Reveal)
  const textOpacity = useTransform(scrollYProgress, [0.6, 0.7, 0.85, 0.95], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0.6, 0.7], [50, 0])

  // Input Data Attributes
  const attributes = ['Age', 'Gender', 'Pclass', 'Fare', 'SibSp', 'Parch', 'Embarked']

  // Generate Flowing Paths
  const paths = useMemo(() => {
    const inputs = []
    const outputs = []

    // Map attributes to inputs
    attributes.forEach((attr, idx) => {
      const startY = 120 + (idx * 45)
      
      for(let i=0; i<5; i++) {
        const cpX = 250 + (Math.sin(idx * i) * 50)
        // Flow into the central AI engine (x=480, y=250)
        inputs.push({
          d: `M 180 ${startY} C ${cpX} ${startY}, 350 250, 480 250`, 
          width: (Math.abs(Math.sin(i*23)) * 1.5 + 0.5).toFixed(2),
          opacity: (Math.abs(Math.sin(i*29)) * 0.4 + 0.1).toFixed(2)
        })
      }
    })

    // Generate output prediction streams from the engine (x=520, y=250)
    for(let i=0; i<30; i++) {
      const survived = i % 2 === 0
      const finalY = survived ? 150 : 350
      
      // Keep the exit horizontal (CP1), spread the middle (CP2), then pinch to the exact circle center
      const spreadY = finalY + (Math.sin(i * 31) * 80)
      const color = survived ? "#00ff88" : "#ff0000"
      
      outputs.push({
        d: `M 520 250 C 650 250, 750 ${spreadY}, 820 ${finalY}`,
        color,
        width: (Math.abs(Math.sin(i*41)) * 1.5 + 0.5).toFixed(2),
        opacity: (Math.abs(Math.sin(i*43)) * 0.4 + 0.1).toFixed(2)
      })
    }

    return { inputs, outputs }
  }, [])

  return (
    <section ref={ref} className="relative h-[500vh] w-full bg-transparent text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* --- SCENE 1: THE DISASTER (Titanic Background) --- */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none mix-blend-screen flex items-center justify-center"
          style={{ opacity: titanicOpacity, scale: titanicScale, filter: titanicBlur }}
        >
          <div className="relative w-[120vw] h-[120vh]" style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}>
            <Image 
              src="/titanic_wireframe.jpeg" 
              alt="Titanic Wireframe Background" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none text-center px-6"
          style={{ opacity: disasterTextOpacity, scale: disasterTextScale, y: disasterTextY }}
        >
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-12 rounded-3xl drop-shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-light leading-tight">
              What if we could <br/>predict who would <br/><span className="text-[#00f0ff] font-bold">survive</span><br/> The Titanic?
            </h2>
          </div>
        </motion.div>

        {/* --- MAIN SVG OVERLAY & ENGINE --- */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <svg className="absolute w-full max-w-[1400px] h-full pointer-events-none -translate-y-12" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            
            {/* Input Attributes Labels */}
            <motion.g style={{ opacity: dataLabelsOpacity }}>
              <text x="70" y="80" fill="#00f0ff" fontSize="10" fontFamily="monospace" letterSpacing="1" opacity="0.6">PASSENGER DATA</text>
              {attributes.map((attr, i) => (
                <g key={attr}>
                  <circle cx="80" cy={120 + (i * 45)} r="10" fill="transparent" stroke="#00f0ff" strokeWidth="1" opacity="0.5" />
                  <text x="100" y={124 + (i * 45)} fill="#ffffff" fontSize="14">{attr}</text>
                </g>
              ))}
            </motion.g>

            {/* Input Data Rivers */}
            <motion.g style={{ opacity: dataLabelsOpacity }}>
              {paths.inputs.map((p, i) => (
                <motion.path 
                  key={`in-${i}`} d={p.d} 
                  stroke="#00f0ff" strokeWidth={p.width} strokeOpacity={p.opacity} fill="transparent"
                  style={{ pathLength: inputPathLength }}
                />
              ))}
            </motion.g>

            {/* Output Prediction Rivers */}
            <g>
              {paths.outputs.map((p, i) => (
                <motion.path 
                  key={`out-${i}`} d={p.d} 
                  stroke={p.color} strokeWidth={p.width} strokeOpacity={p.opacity} fill="transparent"
                  style={{ pathLength: outputPathLength }}
                />
              ))}
            </g>

            {/* Output Labels */}
            <motion.g style={{ opacity: outputLabelsOpacity }}>
              <text x="800" y="80" fill="#00ff88" fontSize="10" fontFamily="monospace" letterSpacing="1" opacity="0.8">PREDICTED OUTCOME</text>
              
              <circle cx="820" cy="150" r="20" fill="transparent" stroke="#00ff88" strokeWidth="2" />
              <text x="850" y="145" fill="#00ff88" fontSize="18" fontWeight="bold">Survived</text>
              <text x="850" y="165" fill="#ffffff" fontSize="12" opacity="0.7">Probability 0.72</text>

              <circle cx="820" cy="350" r="20" fill="transparent" stroke="#ff0000" strokeWidth="2" />
              <text x="850" y="345" fill="#ff0000" fontSize="18" fontWeight="bold">Not Survived</text>
              <text x="850" y="365" fill="#ffffff" fontSize="12" opacity="0.7">Probability 0.28</text>
            </motion.g>

            {/* The SVG AI Engine Core */}
            <motion.g 
              style={{ opacity: engineOpacity, scale: engineScale, transformOrigin: "500px 250px" }}
              className="drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]"
            >
              {/* Outer rings (animated rotation) */}
              <motion.g style={{ rotate: engineRotation, transformOrigin: "500px 250px" }}>
                <circle cx="500" cy="250" r="70" fill="transparent" stroke="#00f0ff" strokeWidth="1" strokeDasharray="10 5" />
                <circle cx="500" cy="250" r="60" fill="transparent" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 4" />
                
                {/* Inner geometric core */}
                <polygon points="500,200 543,225 543,275 500,300 457,275 457,225" fill="#050814" stroke="#00f0ff" strokeWidth="2" />
                <polygon points="500,215 528,231 528,269 500,285 472,269 472,231" fill="transparent" stroke="#ffffff" strokeWidth="1" />
              </motion.g>
              
              {/* Glowing center text (static, doesn't rotate) */}
              <text x="500" y="246" fill="#00f0ff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">RANDOM</text>
              <text x="500" y="264" fill="#00f0ff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">FOREST</text>
            </motion.g>

          </svg>
        </div>

        {/* --- SCENE 5: THE REVEAL TEXT --- */}
        <motion.div 
          className="absolute bottom-4 z-30 w-full flex flex-col items-center justify-center text-center px-6"
          style={{ opacity: textOpacity, y: textY }}
        >

          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-[#00f0ff]">Titanic</span> Survival Predictor
          </h2>
          
          <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed mb-8 max-w-2xl backdrop-blur-xl bg-black/40 border border-white/10 p-6 rounded-2xl">
            {repo.description || "A machine learning data pipeline that analyzes raw historical inputs, runs them through classification models, and mathematically determines human survivability."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {repo.language && (
              <span className="px-3 py-1 border border-gray-600 rounded-full text-xs font-mono text-gray-300 bg-black/80 backdrop-blur-md">
                {repo.language}
              </span>
            )}
            {repo.topics?.slice(0, 3).map(topic => (
              <span key={topic} className="px-3 py-1 border border-[#00f0ff]/50 rounded-full text-xs font-mono text-[#00f0ff] bg-black/80 backdrop-blur-md">
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
