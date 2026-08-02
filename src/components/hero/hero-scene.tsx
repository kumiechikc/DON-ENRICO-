"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

function FireParticles({ count = 1500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const reducedMotion = useReducedMotion()
  const actualCount = reducedMotion ? 200 : count

  const { positions, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(actualCount * 3)
    const col = new Float32Array(actualCount * 3)
    const spd = new Float32Array(actualCount)

    const orange = new THREE.Color("#EA580C")
    const red = new THREE.Color("#CC0000")
    const amber = new THREE.Color("#F28C28")

    for (let i = 0; i < actualCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = Math.random() * 10 - 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8

      const t = Math.random()
      const color = t < 0.33 ? red : t < 0.66 ? orange : amber
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b

      spd[i] = 0.3 + Math.random() * 0.8
    }
    return { positions: pos, colors: col, speeds: spd }
  }, [actualCount])

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < actualCount; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 2
      arr[i * 3] += Math.sin(Date.now() * 0.001 + i) * delta * 0.15

      if (arr[i * 3 + 1] > 8) {
        arr[i * 3 + 1] = -2
        arr[i * 3] = (Math.random() - 0.5) * 12
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function FloatingSalgados() {
  const reducedMotion = useReducedMotion()

  const items = [
    { position: [-3, 0.5, -1] as [number, number, number], color: "#F28C28", type: "cone" },
    { position: [3.5, -0.5, -2] as [number, number, number], color: "#EA580C", type: "sphere" },
    { position: [-2, 2, -3] as [number, number, number], color: "#F97316", type: "box" },
    { position: [2.5, 1.5, -1.5] as [number, number, number], color: "#CC0000", type: "torus" },
  ]

  return (
    <>
      {items.map((item, i) => (
        <Float
          key={i}
          speed={reducedMotion ? 0 : 2}
          rotationIntensity={reducedMotion ? 0 : 0.8}
          floatIntensity={reducedMotion ? 0 : 0.6}
        >
          <mesh position={item.position}>
            {item.type === "cone" && <coneGeometry args={[0.4, 0.7, 8]} />}
            {item.type === "sphere" && <sphereGeometry args={[0.35, 16, 16]} />}
            {item.type === "box" && <boxGeometry args={[0.5, 0.3, 0.5]} />}
            {item.type === "torus" && <torusGeometry args={[0.3, 0.12, 8, 16]} />}
            <meshStandardMaterial
              color={item.color}
              roughness={0.6}
              metalness={0.2}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1, 5], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 3]} color="#EA580C" intensity={3} distance={12} />
      <pointLight position={[-3, 1, 1]} color="#CC0000" intensity={1.5} distance={10} />

      <FireParticles />
      <FloatingSalgados />
    </Canvas>
  )
}
