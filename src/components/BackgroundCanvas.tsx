'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'
import * as THREE from 'three'

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null)
  
  // Create random points inside a sphere
  const sphere = useMemo(() => random.inSphere(new Float32Array(5000 * 3), { radius: 15 }) as Float32Array, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f0ff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

export function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-bg-dark">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ParticleCloud />
      </Canvas>
    </div>
  )
}
