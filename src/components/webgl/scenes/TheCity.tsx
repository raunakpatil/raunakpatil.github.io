'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { multiLerpScroll } from '../UniverseCanvas'
import { GithubRepo } from '@/lib/github'

export function TheCity({ scrollYProgress, repos }: { scrollYProgress: any, repos: GithubRepo[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  // Calculate total buildings needed
  const repoData = useMemo(() => {
    return repos.map((repo, index) => {
      // 1 building per 100 KB, capped at 400 buildings per city to maintain 60FPS
      const count = Math.max(10, Math.min(Math.floor(repo.size / 100), 400))
      
      let color = new THREE.Color("#bc13fe") // Default purple
      if (repo.language === 'Python') color = new THREE.Color("#00ff88") // Green
      if (repo.language === 'TypeScript') color = new THREE.Color("#007acc") // Blue
      if (repo.language === 'JavaScript') color = new THREE.Color("#f7df1e") // Yellow
      if (repo.language === 'HTML') color = new THREE.Color("#e34c26") // Orange

      return { count, color, zOffset: -(index * 100) - 100 }
    })
  }, [repos])

  const TOTAL_COUNT = repoData.reduce((acc, curr) => acc + curr.count, 0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Generate energy flow lines (commits) between cities
  const lineGeometry = useMemo(() => {
    const points = []
    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 40
      const y = Math.random() * 2
      const z = -(Math.random() * (repos.length * 100 + 100))
      points.push(new THREE.Vector3(x, y, z))
      // Line segment goes purely along Z axis to simulate data flow
      points.push(new THREE.Vector3(x, y, z - (Math.random() * 10 + 5)))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [repos.length])

  useMemo(() => {
    if (meshRef.current) {
      let currentIndex = 0
      
      repoData.forEach((repo) => {
        for (let i = 0; i < repo.count; i++) {
          const x = (Math.random() - 0.5) * 80
          const z = repo.zOffset + (Math.random() - 0.5) * 80
          
          const isSkyscraper = Math.random() > 0.9
          const h = isSkyscraper ? Math.random() * 20 + 10 : Math.random() * 5 + 2
          
          dummy.position.set(x, h / 2 - 10, z)
          dummy.scale.set(Math.random() * 1.5 + 0.5, h, Math.random() * 1.5 + 0.5)
          dummy.updateMatrix()
          
          meshRef.current!.setMatrixAt(currentIndex, dummy.matrix)
          meshRef.current!.setColorAt(currentIndex, repo.color)
          
          currentIndex++
        }
      })
      
      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true
      }
    }
  }, [dummy, meshRef, repoData])

  useFrame((state) => {
    const scroll = scrollYProgress.get()
    const opacity = multiLerpScroll(scroll, [0.3, 0.4, 0.7, 0.8], [0, 1, 1, 0])
    const cityScaleY = multiLerpScroll(scroll, [0.3, 0.5], [0.001, 1])

    if (groupRef.current) {
      groupRef.current.scale.y = cityScaleY
    }

    if (materialRef.current) {
      materialRef.current.opacity = opacity
    }

    // Animate energy flows (commits)
    if (linesRef.current) {
      linesRef.current.position.z = (state.clock.elapsedTime * 20) % 100
      // @ts-ignore
      linesRef.current.material.opacity = opacity * 0.5
    }
  })

  return (
    <group ref={groupRef} position-z={0}>
      {TOTAL_COUNT > 0 && (
        <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL_COUNT]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial 
            ref={materialRef}
            wireframe
            transparent
          />
        </instancedMesh>
      )}

      {/* Energy Flow / Commits */}
      <lineSegments ref={linesRef}>
        <primitive object={lineGeometry} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}
