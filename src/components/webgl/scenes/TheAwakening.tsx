'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { multiLerpScroll } from '../UniverseCanvas'

export function TheAwakening({ scrollYProgress }: { scrollYProgress: any }) {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const mat1Ref = useRef<THREE.MeshStandardMaterial>(null)
  const mat2Ref = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const scroll = scrollYProgress.get()
    
    if (groupRef.current) {
      groupRef.current.position.y = multiLerpScroll(scroll, [0, 0.2], [-10, 0])
    }

    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }

    const opacity = multiLerpScroll(scroll, [0, 0.2, 0.3], [0, 1, 0])
    
    if (mat1Ref.current) {
      mat1Ref.current.opacity = opacity
    }
    if (mat2Ref.current) {
      mat2Ref.current.opacity = opacity
    }
  })

  return (
    <group ref={groupRef} position-z={0}>
      <mesh ref={sphereRef} scale={5}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          ref={mat1Ref}
          color="#00f0ff" 
          emissive="#00f0ff"
          emissiveIntensity={2}
          wireframe
          transparent
        />
      </mesh>
      
      {/* Core glow */}
      <mesh scale={4.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          ref={mat2Ref}
          color="#ffffff" 
          transparent
        />
      </mesh>
    </group>
  )
}
