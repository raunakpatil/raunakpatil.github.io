'use client'

import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const projects = [
  {
    name: "ResRescue",
    scenes: [
      { subtitle: "Scene 1", title: "The Problem", text: "Thousands of brilliant resumes vanish into the ATS black box every day. Candidates are rejected not for lack of skill, but for lack of keyword alignment." },
      { subtitle: "Scene 2", title: "The Challenge", text: "Building a parser that genuinely understands semantic meaning, rather than just doing exact-match keyword spotting." },
      { subtitle: "Scene 3", title: "The Process", text: "I engineered an advanced RAG pipeline. Using LangChain and PyTorch, the system digests the job description and the resume, finding the delta in meaning." },
      { subtitle: "Scene 4", title: "The Solution", text: "A production-grade Next.js platform that outputs a highly optimized, ATS-friendly resume tailored to the exact job description." },
      { subtitle: "Scene 5", title: "The Impact", text: "Drastically increased candidate interview callback rates by bridging the semantic gap between human experience and machine parsers." }
    ]
  }
]

export function Act5_BuildingThings() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    if (!wrapperRef.current) return

    const sections = gsap.utils.toArray('.project-scene')
    
    const ctx = gsap.context(() => {
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + wrapperRef.current?.offsetWidth * 2
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative bg-transparent text-white z-10">
      
      <div className="py-32 px-6 text-center max-w-3xl mx-auto">
        <div className="mono text-accent-secondary mb-4">Act V — Building Things</div>
        <h2 className="text-5xl md:text-7xl font-bold mb-6">From theory to production.</h2>
      </div>

      {projects.map((proj, pIdx) => (
        <div key={pIdx} ref={wrapperRef} className="h-screen flex items-center overflow-hidden bg-transparent border-t border-white/10">
          
          <div className="absolute left-8 top-8 z-20">
            <h3 className="text-3xl font-bold tracking-tight">{proj.name}</h3>
            <div className="mono text-accent-primary mt-2">PROJECT FILE // 0{pIdx + 1}</div>
          </div>

          <div className="flex w-[500vw]">
            {proj.scenes.map((scene, i) => (
              <div key={i} className="project-scene w-screen h-screen flex flex-col justify-center px-12 md:px-32">
                <div className="max-w-2xl">
                  <div className="mono text-text-muted mb-6">{scene.subtitle}</div>
                  <h4 className="text-4xl md:text-6xl font-bold mb-8 text-accent-secondary">{scene.title}.</h4>
                  <p className="text-2xl md:text-3xl font-light text-gray-300 leading-relaxed border-l-4 border-accent-primary pl-8">
                    {scene.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
