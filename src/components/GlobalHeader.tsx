'use client'

import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

export function GlobalHeader() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    // 800vh is roughly 8 * window.innerHeight (the height of Act1)
    if (typeof window !== 'undefined') {
      if (latest > window.innerHeight * 7.5) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }
  })

  return (
    <motion.header 
      className="fixed top-0 left-0 w-full z-50 flex items-start justify-between px-8 py-8 pointer-events-none"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative pointer-events-auto">
        <div 
          className="text-xl md:text-2xl font-bold tracking-tight text-white cursor-pointer select-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Raunak<span className="text-gray-500">.</span>Patil
        </div>

        <motion.div 
          className="absolute top-full left-0 mt-4 flex gap-3"
          initial={{ opacity: 0, y: -10, pointerEvents: "none" }}
          animate={{ 
            opacity: menuOpen ? 1 : 0, 
            y: menuOpen ? 0 : -10, 
            pointerEvents: menuOpen ? "auto" : "none" 
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* GitHub */}
          <a 
            href="https://github.com/raunakpatil" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300 backdrop-blur-md"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          
          {/* LinkedIn */}
          <a 
            href="https://linkedin.com/in/raunakpatil" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-colors duration-300 backdrop-blur-md"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>

          {/* Email */}
          <a 
            href="mailto:contact@raunakpatil.com" 
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#ff0000] hover:border-[#ff0000] transition-colors duration-300 backdrop-blur-md"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.header>
  )
}
