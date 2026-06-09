'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const CODE_SNIPPETS = [
  "while (!success) { tryAgain(); }",
  "try { myCode.run(); } catch (e) { stackOverflow.search(e); }",
  "if (brain.isEmpty()) { coffee.drink(); }",
  "[ 'hip', 'hip' ] // hip hip array!",
  "git commit -m 'Fixed bug I created 5 mins ago'",
  "if (code.works()) { dontTouchIt(); }",
  "throw new TableException(); // (╯°□°)╯︵ ┻━┻",
  "git push --force origin master // YOLO",
  "let story = ['my', 'life']; story.slice(); // cut my life into slices",
  "1 / 0; // Black hole created",
  "System.out.println('It works on my machine!');",
  "const css = 'is intuitive'; // said no one ever",
  "sudo rm -rf /bugs",
  "while(alive) { eat(); sleep(); code(); repeat(); }",
  "import { more_time } from 'universe';",
  "catch(e) { console.log('Please work'); }",
  "const sleep = new Promise(res => setTimeout(res, Infinity));",
  "// TODO: I'll fix this later (narrator: he didn't)",
  "if (isWeekend) { return false; }",
  "const joke = await getJoke(); if (!joke.funny) { forceLaugh(); }",
  "Array(16).join('wat' - 1) + ' Batman!';"
];

function TerminalBackground() {
  const [snippets, setSnippets] = useState<{id: number, text: string, x: number, y: number, scale: number, delay: number, duration: number}[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 0.8 + 0.4,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3
    }))
    setSnippets(generated)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      {snippets.map((s) => (
        <motion.div
          key={s.id}
          className="absolute terminal-text text-[#00ff00] whitespace-nowrap drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]"
          style={{
            left: `${s.x}vw`,
            top: `${s.y}vh`,
            transform: `scale(${s.scale})`,
            zIndex: Math.floor(s.scale * 10),
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, s.scale * 0.4, 0] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {s.text}
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40"></div>
    </div>
  )
}

function ScrollTypewriter({ text, progress, range, className }: { text: string, progress: any, range: [number, number], className?: string }) {
  const length = text.length;
  const index = useTransform(progress, range, [0, length]);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    return index.on("change", (v) => {
      setDisplayText(text.slice(0, Math.floor(v)));
    });
  }, [index, text]);

  return <span className={className}>{displayText}</span>;
}

export function Act3_DiscoveringCode() {
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Fade out the entire section smoothly when scrolling past it
  const opacity1 = useTransform(scrollYProgress, [0.85, 0.95], [1, 0])

  return (
    <section ref={ref} className="relative h-[400vh] bg-black text-[#00ff00] z-10 pointer-events-none">
      <style dangerouslySetInnerHTML={{__html: `
        .terminal-text { font-family: var(--font-vt323), monospace; }
      `}} />
      
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        <div ref={ref} className="absolute inset-0 z-0">
          <TerminalBackground />
        </div>


        
        <TerminalBox scrollYProgress={scrollYProgress} />
      </div>
    </section>
  )
}

function TerminalBox({ scrollYProgress }: { scrollYProgress: any }) {
  const boxRef = useRef(null)
  const isInView = useInView(boxRef, { once: true, margin: "-20%" })

  return (
    <motion.div 
      ref={boxRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative max-w-4xl z-10 w-full mx-4"
    >

      {/* The Terminal Window Background (CRT Turn-On Effect) */}
      <motion.div
        variants={{
          hidden: { scaleX: 0.01, scaleY: 0.01, opacity: 0 },
          visible: { 
            scaleX: [0.01, 1, 1], 
            scaleY: [0.01, 0.01, 1],
            opacity: [1, 1, 1],
            transition: { 
              duration: 0.6, 
              times: [0, 0.4, 1], 
              ease: "easeOut",
              delay: 0.2
            } 
          }
        }}
        style={{ transformOrigin: "center" }}
        className="absolute inset-0 border border-[#00ff00]/30 bg-black/80 shadow-[0_0_30px_rgba(0,255,0,0.15)] backdrop-blur-md rounded-lg"
      />

      {/* The Content Wrapper - kept invisible until CRT finishes expanding */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 0.8, duration: 0.2 } }
        }}
        className="relative p-8 md:p-12 text-left w-full h-full"
      >
        
        {/* The Top Bar & Traffic Lights */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#00ff00]/30 pb-3 relative">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(255,0,0,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(255,255,0,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-[#00ff00]/80 shadow-[0_0_5px_rgba(0,255,0,0.5)]"></div>
          </div>
          <div className="ml-4 terminal-text text-[#00ff00]/50 text-sm mt-[-2px]">
            root@engineering:~/learning$
          </div>
        </div>
        
        <h2 className="terminal-text text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-[#00ff00] drop-shadow-[0_0_8px_rgba(0,255,0,0.8)] h-auto min-h-[4rem]">
          <ScrollTypewriter text="> Hello, World." progress={scrollYProgress} range={[0.2, 0.3]} />
          <motion.span 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 0.8 } }
            }}
          >_</motion.span>
        </h2>
        
        <div className="terminal-text text-xl md:text-3xl lg:text-4xl text-[#00ff00]/80 leading-relaxed space-y-6">
          <p><ScrollTypewriter text="At Engineering College, the chaotic fragments of syntax began to form logic." progress={scrollYProgress} range={[0.35, 0.55]} /></p>
          <p className="text-[#00ff00] drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
            <ScrollTypewriter text="> Python became my voice." progress={scrollYProgress} range={[0.6, 0.7]} />
          </p>
          <p className="text-[#00ff00] drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
            <ScrollTypewriter text="> SQL became my memory." progress={scrollYProgress} range={[0.75, 0.85]} />
          </p>
        </div>
      </motion.div>

    </motion.div>
  )
}
