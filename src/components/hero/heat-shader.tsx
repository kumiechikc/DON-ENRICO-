"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/*
 * O plano de fundo do hero: um único quad em tela cheia com um shader que
 * simula óleo quente e calor subindo — a luz da fritadeira na sombra.
 *
 * Por que shader e não sistema de partículas: partículas de fogo flutuando são
 * o clichê mais reconhecível de "site gerado por IA", custam milhares de draw
 * calls e nunca se parecem com fritura. Um quad com ruído fractal em GLSL custa
 * um draw call, roda a 60fps em aparelho fraco e produz a luz volumétrica
 * quente que a direção de arte pede.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/*
 * Ruído simplex 2D de Ashima Arts (domínio público / MIT), a implementação
 * padrão usada em produção — reescrever isto à mão só introduziria bugs.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uPointer;
  uniform float uIntensity;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  /* Ruído fractal: várias oitavas somadas dão a turbulência do calor. */
  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      total += snoise(p) * amplitude;
      p *= 2.0;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    /*
     * O campo sobe com o tempo e ondula na horizontal: é a assinatura visual do
     * ar quente sobre óleo. A escala vertical é menor que a horizontal para as
     * plumas ficarem alongadas em vez de circulares.
     */
    float t = uTime * 0.11;
    vec2 q = vec2(p.x * 1.6, p.y * 0.9 - t);
    float heat = fbm(q + fbm(q * 1.7) * 0.35);
    heat = heat * 0.5 + 0.5;

    /* Concentra a luz embaixo, como se a fonte de calor estivesse fora da tela. */
    float rise = smoothstep(1.05, -0.15, uv.y);
    heat *= rise;

    /* Halo suave seguindo o ponteiro: presença, não efeito de spotlight. */
    float pointer = 1.0 - smoothstep(0.0, 0.75, distance(p, vec2(uPointer.x * aspect, uPointer.y)));
    heat += pointer * 0.16;

    /* Rampa de cor da sombra quente ao dourado. */
    vec3 shadow = vec3(0.071, 0.043, 0.031);
    vec3 ember  = vec3(0.404, 0.145, 0.055);
    vec3 gold   = vec3(0.961, 0.647, 0.141);

    float h = clamp(heat * uIntensity, 0.0, 1.0);
    vec3 color = mix(shadow, ember, smoothstep(0.18, 0.62, h));
    color = mix(color, gold, smoothstep(0.62, 0.95, h));

    /* Vinheta: fecha as bordas e empurra o olho para o centro. */
    float vignette = 1.0 - smoothstep(0.55, 1.25, length(uv - 0.5) * 1.6);
    color *= mix(0.55, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`

function HeatPlane({ intensity }: { intensity: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  // O alvo do ponteiro é perseguido com suavização; saltar direto para a
  // posição do mouse deixa o halo nervoso.
  const pointer = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: intensity },
    }),
    [intensity]
  )

  useFrame((state, delta) => {
    const mat = materialRef.current
    if (!mat) return

    mat.uniforms.uTime.value += delta
    mat.uniforms.uResolution.value.set(size.width, size.height)

    pointer.current.tx = state.pointer.x * 0.5 + 0.5
    pointer.current.ty = state.pointer.y * 0.5 + 0.5
    pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.045
    pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.045
    mat.uniforms.uPointer.value.set(pointer.current.x, pointer.current.y)
  })

  return (
    <mesh frustumCulled={false}>
      {/* Quad de tela cheia: o vertex shader já emite clip space, então a
          geometria não precisa de câmera nem de transformação. */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function HeatShader({ intensity = 1 }: { intensity?: number }) {
  return (
    <Canvas
      // dpr limitado a 1.5: acima disso o custo do fragment shader dobra sem
      // ganho visível num efeito difuso como este.
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <HeatPlane intensity={intensity} />
    </Canvas>
  )
}
