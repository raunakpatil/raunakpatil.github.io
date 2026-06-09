'use client'

import { motion } from 'framer-motion'
import { SvgFuture } from '../svg/SvgFuture'
import { Mail } from 'lucide-react'

const LinkedinIcon = ({ size = 28, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const GithubIcon = ({ size = 28, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.8 0-1.4-.5-2.8-1.5-3.8.1-.3.2-1.8-.1-3.8 0 0-1.2-.4-4 1.5-1.1-.3-2.3-.4-3.5-.4s-2.4.1-3.5.4c-2.8-1.9-4-1.5-4-1.5-.3 2-.2 3.5-.1 3.8-1 1-1.5 2.4-1.5 3.8 0 5.3 3 6.5 6 6.8-.5.4-.9 1.2-1 2.4-.3.2-1 .3-1.6-.1-.6-.4-1-1.4-1-1.4-.4-.7-1.1-1-1.1-1-.6-.1-.1-.1.1-.1.5.1 1 1 1 1 .6 1.1 1.7 1.1 2.3.8v2.4"/>
  </svg>
)

export function Act8_TheFuture() {
  return (
    <section className="relative min-h-screen bg-transparent text-white flex flex-col items-center justify-center overflow-hidden px-6 pb-20">
      
      {/* Background Component */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_20%,black_100%)]"
      >
        <SvgFuture />
      </motion.div>

      {/* Main Content Box */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 max-w-4xl text-center pointer-events-auto drop-shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl"
      >
        <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white">
          Let's build something <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc13fe] to-[#00f0ff]">meaningful</span> together.
        </h2>
        
        <div className="flex items-center justify-center gap-6 mt-12">
          <a 
            href="mailto:contact@raunakpatil.com"
            className="w-16 h-16 flex items-center justify-center bg-transparent text-white border border-white/20 rounded-full hover:bg-[#bc13fe]/10 hover:border-[#bc13fe] hover:text-[#bc13fe] hover:scale-110 hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transition-all duration-300"
            aria-label="Email Me"
          >
            <Mail size={28} strokeWidth={2} />
          </a>
          <a 
            href="https://www.linkedin.com/in/raunakpatil/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 flex items-center justify-center bg-transparent text-white border border-white/20 rounded-full hover:bg-[#bc13fe]/10 hover:border-[#bc13fe] hover:text-[#bc13fe] hover:scale-110 hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transition-all duration-300"
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={28} strokeWidth={2} />
          </a>
          <a 
            href="https://github.com/raunakpatil"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 flex items-center justify-center bg-transparent text-white border border-white/20 rounded-full hover:bg-[#bc13fe]/10 hover:border-[#bc13fe] hover:text-[#bc13fe] hover:scale-110 hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transition-all duration-300"
            aria-label="GitHub"
          >
            <GithubIcon size={28} strokeWidth={2} />
          </a>
        </div>
      </motion.div>
    </section>
  )
}
