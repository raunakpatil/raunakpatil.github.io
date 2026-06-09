'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { useScroll } from 'framer-motion'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

import { TheAwakening } from './scenes/TheAwakening'
import { TheNetwork } from './scenes/TheNetwork'
import { TheCity } from './scenes/TheCity'
import { TheGalaxy } from './scenes/TheGalaxy'
import { LightManager } from './LightManager'
import { GithubRepo } from '@/lib/github'

export function lerpScroll(scroll: number, points: [number, number], values: [number, number]) {
  if (scroll <= points[0]) return values[0]
  if (scroll >= points[1]) return values[1]
  const t = (scroll - points[0]) / (points[1] - points[0])
  return values[0] + t * (values[1] - values[0])
}

export function multiLerpScroll(scroll: number, points: number[], values: number[]) {
  if (scroll <= points[0]) return values[0]
  if (scroll >= points[points.length - 1]) return values[values.length - 1]
  for (let i = 0; i < points.length - 1; i++) {
    if (scroll >= points[i] && scroll <= points[i + 1]) {
      const t = (scroll - points[i]) / (points[i + 1] - points[i])
      return values[i] + t * (values[i + 1] - values[i])
    }
  }
  return values[values.length - 1]
}

function SceneManager({ scrollYProgress, repos }: { scrollYProgress: any, repos: GithubRepo[] }) {
  const cameraGroup = useRef<THREE.Group>(null)

  const cityLength = repos.length * 100
  const cityEndZ = -150 - cityLength

  useFrame(() => {
    if (cameraGroup.current) {
      const scroll = scrollYProgress.get()
      
      const z = multiLerpScroll(scroll, 
        [0, 0.2, 0.4, 0.8, 0.9, 1], 
        [20, 0, -50, cityEndZ, cityEndZ, cityEndZ - 350]
      )
      
      const y = multiLerpScroll(scroll, 
        [0, 0.8, 0.9, 1], 
        [0, 0, 50, 200]
      )

      const rotX = multiLerpScroll(scroll,
        [0, 0.8, 0.9, 1],
        [0, 0, Math.PI / 4, Math.PI / 8]
      )

      cameraGroup.current.position.set(0, y, z)
      cameraGroup.current.rotation.x = rotX
    }
  })

  return (
    <>
      {/* Global Fog Exp2. The color is managed by LightManager */}
      <fogExp2 attach="fog" args={['#0a0a1a', 0.015]} />

      <LightManager scrollYProgress={scrollYProgress} />

      <group ref={cameraGroup}>
        <perspectiveCamera makeDefault fov={75} position={[0, 0, 0]} />
      </group>

      <TheAwakening scrollYProgress={scrollYProgress} />
      <TheNetwork scrollYProgress={scrollYProgress} />
      <TheCity scrollYProgress={scrollYProgress} repos={repos} />
      
      <group position-z={cityEndZ - 100}>
        <TheGalaxy scrollYProgress={scrollYProgress} />
      </group>

      <EffectComposer>
        {/* Aggressive HDR Bloom that catches the fog and emissive materials */}
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.5} />
        <DepthOfField focusDistance={0.01} focalLength={0.05} bokehScale={2} height={480} />
      </EffectComposer>
    </>
  )
}

export function UniverseCanvas({ repos }: { repos: GithubRepo[] }) {
  const { scrollYProgress } = useScroll()

  return (
    // Replaced black backdrop with transparent to let R3F background color shine through
    <div className="fixed inset-0 z-[-1] bg-transparent">
      <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <SceneManager scrollYProgress={scrollYProgress} repos={repos} />
        </Suspense>
      </Canvas>
    </div>
  )
}
