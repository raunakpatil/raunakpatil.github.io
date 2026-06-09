'use client'

import { useEffect, useRef, useState } from 'react'

export function CinematicAudio() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)


  // Attempt to autoplay on mount and setup interaction listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Attempt immediate autoplay for desktop
    if (!isMuted) {
      audio.play().catch((e) => {
        console.warn("Immediate autoplay blocked by browser. Awaiting user interaction.", e)
      })
    }

    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true)
        if (audio.paused && !isMuted) {
          audio.play().catch((e) => {
            console.warn("Autoplay blocked on this interaction.", e)
          })
        }
      }
    }

    // Bind interaction events (click, touch, scroll)
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('touchstart', handleInteraction, { once: true })
    window.addEventListener('scroll', handleInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [hasInteracted, isMuted])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  const toggleMute = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.error)
    }
    setIsMuted(!isMuted)
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/TRON Legacy (End Titles).mp3"
        loop
        preload="auto"
        autoPlay
      />

      {/* Global Mute Toggle Button */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <button
          onClick={toggleMute}
          className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          aria-label={isMuted ? "Unmute Cinematic Audio" : "Mute Cinematic Audio"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>


    </>
  )
}
