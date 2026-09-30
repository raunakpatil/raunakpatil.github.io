'use client'

import { motion } from 'framer-motion'

import { Mail } from 'lucide-react'

import { LinkedinIcon, GithubIcon } from '../Icons'
export function Act8_TheFuture() {
  return (
    <section className="relative min-h-screen bg-transparent text-white flex flex-col items-center justify-center overflow-hidden px-6 pb-20">
      
      {/* Background Component */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute bottom-0 w-full h-[70vh] md:h-full object-cover object-bottom md:object-center opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_20%,black_100%)]"
        >
          <source src="/videos/finalact.mp4" type="video/mp4" />
        </video>
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
            href="mailto:raunakpatil15@gmail.com"
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
