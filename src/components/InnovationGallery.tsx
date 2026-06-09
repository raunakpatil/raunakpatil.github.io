'use client'

import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const projects = [
  {
    title: "ResRescue",
    subtitle: "AI ATS Optimizer",
    desc: "A production-grade resume optimization platform. Employs advanced RAG pipelines to match resumes against job descriptions with extreme accuracy.",
    tech: "Next.js • Python • LangChain"
  },
  {
    title: "YouTube Agentic AI",
    subtitle: "Faceless Video Studio",
    desc: "End-to-end automated video generation. Scripts, voiceovers, and visuals created seamlessly through agentic orchestration.",
    tech: "PyTorch • OpenAI • FFmpeg"
  },
  {
    title: "TriviaFlux",
    subtitle: "Firebase Genkit Game",
    desc: "Real-time AI generated trivia using the latest Genkit frameworks to dynamically create engaging multiplayer experiences.",
    tech: "React • Firebase • Genkit"
  },
  {
    title: "Titanic Predictor",
    subtitle: "ML Survival Model",
    desc: "Foundational machine learning pipeline for survival prediction, demonstrating core data science competencies and feature engineering.",
    tech: "Scikit-Learn • Pandas"
  }
]

export function InnovationGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.project-card')
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + wrapperRef.current?.offsetWidth
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative z-10 bg-bg-dark">
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mono text-accent-secondary mb-4">Chapter 05</div>
        <h2 className="text-5xl font-bold mb-8">Innovation Protocol</h2>
      </div>

      <div ref={wrapperRef} className="h-screen flex items-center overflow-hidden">
        <div className="flex gap-8 px-6 md:px-24 w-[400vw] lg:w-[300vw]">
          {projects.map((project, i) => (
            <div 
              key={i} 
              className="project-card w-full sm:w-[80vw] md:w-[60vw] lg:w-[45vw] flex-shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
            >
              <div className="text-accent-primary font-mono text-sm mb-4">0{i + 1} // {project.tech}</div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">{project.title}</h3>
              <h4 className="text-2xl text-text-muted mb-6">{project.subtitle}</h4>
              <p className="text-lg leading-relaxed">{project.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
