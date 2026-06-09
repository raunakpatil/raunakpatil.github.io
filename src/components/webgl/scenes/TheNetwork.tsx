'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { multiLerpScroll } from '../UniverseCanvas'

export function TheNetwork({ scrollYProgress }: { scrollYProgress: any }) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  
  const nodes = useMemo(() => {
    const temp = []
    for (let i = 0; i < 200; i++) {
      temp.push(new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      ))
    }
    return temp
  }, [])

  const fragments = ["console.log()", "def init():", "SELECT *", "React.FC", "Model()", "await fetch"]

  useFrame((state) => {
    const scroll = scrollYProgress.get()
    const opacity = multiLerpScroll(scroll, [0.1, 0.2, 0.5, 0.6], [0, 1, 1, 0])

    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }

    if (materialRef.current) {
      materialRef.current.opacity = opacity
    }

    // Three Text opacity is handled via state or traversing, but for simplicity
    // we can traverse the group and set fillOpacity on Text objects
    if (groupRef.current) {
      groupRef.current.traverse((child: any) => {
        if (child.material && child.material.isShaderMaterial) { // Text material
          child.material.uniforms.opacity.value = opacity
        }
      })
    }
  })

  return (
    <group ref={groupRef} position-z={-50}>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial ref={i === 0 ? materialRef : undefined} color="#bc13fe" transparent />
        </mesh>
      ))}

      {fragments.map((text) => (
        <Text
          key={text}
          position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]}
          fontSize={1}
          color="#00f0ff"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          {text}
        </Text>
      ))}
    </group>
  )
}
