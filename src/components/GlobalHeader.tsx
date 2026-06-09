'use client'

import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import { GithubIcon, LinkedinIcon } from './Icons'
import { Mail } from 'lucide-react'

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
            <GithubIcon size={18} />
          </a>
          
          {/* LinkedIn */}
          <a 
            href="https://linkedin.com/in/raunakpatil" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-colors duration-300 backdrop-blur-md"
          >
            <LinkedinIcon size={18} />
          </a>

          {/* Email */}
          <a 
            href="mailto:contact@raunakpatil.com" 
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#ff0000] hover:border-[#ff0000] transition-colors duration-300 backdrop-blur-md"
          >
            <Mail size={18} strokeWidth={2} />
          </a>
        </motion.div>
      </div>
    </motion.header>
  )
}
