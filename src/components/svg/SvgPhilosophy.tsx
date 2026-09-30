'use client'

import { motion, useTransform } from 'framer-motion'

export function SvgPhilosophy() {
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="xMidYMid slice"
    >
      
      {/* The AI Model Core (Final State) */}
      <g transform="translate(0, 70)">
        <circle 
          cx="50" cy="0" r="12" 
          fill="transparent" stroke="#ff0055" strokeWidth="0.2" strokeDasharray="2 2" 
        />
        <circle 
          cx="50" cy="0" r="8" 
          fill="transparent" stroke="#ff0055" strokeWidth="0.5" strokeDasharray="4 4"
        />
        <circle 
          cx="50" cy="0" r="3" 
          fill="#ff0055" 
        />
      </g>

      {/* The Guardrails (Final State) */}
      <g>
        {/* Left Bracket */}
        <path d="M 35 25 L 28 25 L 28 55 L 35 55" stroke="#ff0055" strokeWidth="0.8" fill="transparent" />
        {/* Right Bracket */}
        <path d="M 65 25 L 72 25 L 72 55 L 65 55" stroke="#ff0055" strokeWidth="0.8" fill="transparent" />
        {/* Top/Bottom Constraints */}
        <line x1="45" y1="20" x2="55" y2="20" stroke="#ff0055" strokeWidth="0.4" />
        <line x1="45" y1="60" x2="55" y2="60" stroke="#ff0055" strokeWidth="0.4" />
      </g>

      {/* The Safety Net (Final State) */}
      <g>
        {/* Horizontal Webbing */}
        <path d="M 10 50 Q 50 90, 90 50" stroke="#bc13fe" strokeWidth="0.4" fill="transparent" />
        <path d="M 20 60 Q 50 85, 80 60" stroke="#bc13fe" strokeWidth="0.3" fill="transparent" />
        <path d="M 30 68 Q 50 80, 70 68" stroke="#bc13fe" strokeWidth="0.2" fill="transparent" />
        <path d="M 40 73 Q 50 78, 60 73" stroke="#bc13fe" strokeWidth="0.1" fill="transparent" />
        
        {/* Vertical Webbing */}
        <path d="M 20 60 Q 30 80, 35 100" stroke="#bc13fe" strokeWidth="0.2" fill="transparent" />
        <path d="M 35 70 Q 42 85, 45 100" stroke="#bc13fe" strokeWidth="0.2" fill="transparent" />
        <path d="M 50 78 L 50 100" stroke="#bc13fe" strokeWidth="0.2" fill="transparent" />
        <path d="M 65 70 Q 58 85, 55 100" stroke="#bc13fe" strokeWidth="0.2" fill="transparent" />
        <path d="M 80 60 Q 70 80, 65 100" stroke="#bc13fe" strokeWidth="0.2" fill="transparent" />
        
        {/* Glowing impact zone */}
        <circle cx="50" cy="70" r="15" fill="#bc13fe" opacity="0.1" />
      </g>

    </svg>
  )
}
