'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef } from 'react'

export function LightManager({ scrollYProgress }: { scrollYProgress: any }) {
  const { scene } = useThree()
  
  // Create color objects for interpolation
  const cAwakening = new THREE.Color("#ffaa00") // Warm Amber
  const cDiscovery = new THREE.Color("#002244") // Deep Cyan/Electric Blue
  const cBuilding = new THREE.Color("#1a0b2e") // Industrial Violet
  const cPhilosophy = new THREE.Color("#111116") // Slate Gray
  const cFuture = new THREE.Color("#bc13fe") // Blinding starlight purple

  const ambientRef = useRef<THREE.AmbientLight>(null)
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const targetColorRef = useRef(new THREE.Color())

  useFrame(() => {
    const scroll = scrollYProgress.get()

    // --- FOG & BACKGROUND COLOR INTERPOLATION ---
    const targetColor = targetColorRef.current

    if (scroll < 0.2) {
      targetColor.copy(cAwakening)
    } else if (scroll < 0.4) {
      const t = (scroll - 0.2) / 0.2
      targetColor.lerpColors(cAwakening, cDiscovery, t)
    } else if (scroll < 0.8) {
      const t = (scroll - 0.4) / 0.4
      targetColor.lerpColors(cDiscovery, cBuilding, t)
    } else if (scroll < 0.9) {
      const t = (scroll - 0.8) / 0.1
      targetColor.lerpColors(cBuilding, cPhilosophy, t)
    } else {
      const t = (scroll - 0.9) / 0.1
      targetColor.lerpColors(cPhilosophy, cFuture, t)
    }

    if (scene.fog) {
      // @ts-ignore
      scene.fog.color.copy(targetColor)
    }
    // Also set scene background so it matches fog
    scene.background = targetColor

    // --- LIGHTING INTENSITY ---
    if (ambientRef.current) {
      // Bright at the start (sunrise), dim in the middle, incredibly bright at the end
      if (scroll < 0.2) ambientRef.current.intensity = 0.5
      else if (scroll < 0.8) ambientRef.current.intensity = 0.1 // Let emissive geometries pop
      else ambientRef.current.intensity = 1.0 // Overwhelming future
    }

    if (dirRef.current) {
      // Directional light position (Sun rising)
      if (scroll < 0.2) {
        dirRef.current.position.set(10, 0.5, -20) // Very low horizon sunrise
        dirRef.current.intensity = 2.0
      } else {
        dirRef.current.position.set(10, 20, 10) // High overhead
        dirRef.current.intensity = 0.5
      }
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.2} />
      <directionalLight ref={dirRef} position={[10, 10, 10]} intensity={1} color="#ffffff" />
    </>
  )
}
