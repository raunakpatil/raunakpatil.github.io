'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { multiLerpScroll } from '../UniverseCanvas'

export function TheGalaxy({ scrollYProgress }: { scrollYProgress: any }) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  const COUNT = 10000
  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const radius = Math.random() * 200
      const angle = radius * 0.1 + Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [])

  useFrame((state) => {
    const scroll = scrollYProgress.get()
    const opacity = multiLerpScroll(scroll, [0.8, 0.9], [0, 1])

    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity
    }
  })

  return (
    <group position-z={-500}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.5}
          color="#bc13fe"
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
