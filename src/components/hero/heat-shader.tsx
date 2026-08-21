"use client"

import { useEffect, useRef } from "react"

/*
 * Fundo do hero: um quad em tela cheia com um shader que simula óleo quente e
 * calor subindo — a luz da fritadeira na sombra.
 *
 * Escrito em WebGL puro, sem three.js nem React Three Fiber, por um motivo
 * medido: a versão com as duas bibliotecas custava mais de 1,5 MB de
 * JavaScript para desenhar UM quad com UM shader. three.js é uma engine de
 * cena 3D — câmeras, luzes, grafo de objetos, carregadores — e nada disso é
 * usado aqui. Sessenta linhas de WebGL entregam o mesmo pixel.
 *
 * Também não são partículas: partículas de fogo flutuando são o clichê mais
 * reconhecível de site gerado por IA, custam milhares de draw calls e nunca se
 * parecem com fritura. Ruído fractal num quad custa um draw call.
 */

const VERTEX_SOURCE = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

/*
 * Ruído simplex 2D de Ashima Arts (licença MIT), a implementação padrão de
 * produção — reescrever à mão só introduziria bugs sutis.
 */
const FRAGMENT_SOURCE = `
  precision mediump float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uPointer;

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

  /* Quatro oitavas somadas dão a turbulência do ar quente. */
  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += snoise(p) * amplitude;
      p *= 2.0;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);

    /*
     * O campo sobe com o tempo e ondula na horizontal: é a assinatura do ar
     * quente sobre óleo. A escala vertical é menor que a horizontal para as
     * plumas ficarem alongadas em vez de circulares.
     */
    float t = uTime * 0.11;
    vec2 q = vec2(p.x * 1.6, p.y * 0.9 - t);
    float heat = fbm(q + fbm(q * 1.7) * 0.35);
    heat = heat * 0.5 + 0.5;

    /* Concentra a luz embaixo: a fonte de calor fica fora da tela. */
    heat *= smoothstep(1.05, -0.15, uv.y);

    /* Halo suave seguindo o ponteiro: presença, não holofote. */
    float pointer = 1.0 - smoothstep(0.0, 0.75,
      distance(p, vec2(uPointer.x * aspect, uPointer.y)));
    heat += pointer * 0.16;

    vec3 shadow = vec3(0.071, 0.043, 0.031);
    vec3 ember  = vec3(0.404, 0.145, 0.055);
    vec3 gold   = vec3(0.961, 0.647, 0.141);

    float h = clamp(heat, 0.0, 1.0);
    vec3 color = mix(shadow, ember, smoothstep(0.18, 0.62, h));
    color = mix(color, gold, smoothstep(0.62, 0.95, h));

    /* Vinheta: fecha as bordas e empurra o olho para o centro. */
    float vignette = 1.0 - smoothstep(0.55, 1.25, length(uv - 0.5) * 1.6);
    color *= mix(0.55, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function HeatShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    })
    // Sem WebGL o componente simplesmente não pinta: o gradiente CSS por trás
    // continua sendo a cena.
    if (!gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE)
    if (!vertex || !fragment) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    // Dois triângulos cobrindo o espaço de recorte inteiro.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const aPosition = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, "uTime")
    const uResolution = gl.getUniformLocation(program, "uResolution")
    const uPointer = gl.getUniformLocation(program, "uPointer")

    // Perseguição suavizada: saltar direto para o mouse deixa o halo nervoso.
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX / window.innerWidth
      pointer.ty = 1 - event.clientY / window.innerHeight
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    /*
     * Resolução limitada a 1.5x: acima disso o custo do fragment shader dobra
     * sem ganho visível num efeito difuso como este.
     */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.floor(canvas.clientWidth * dpr)
      const height = Math.floor(canvas.clientHeight * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    let frame = 0
    const start = performance.now()
    let running = true

    const render = (now: number) => {
      if (!running) return
      pointer.x += (pointer.tx - pointer.x) * 0.045
      pointer.y += (pointer.ty - pointer.y) * 0.045

      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform2f(uPointer, pointer.x, pointer.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    /*
     * Fora da tela o laço para. Um site de cardápio passa a maior parte do
     * tempo rolado para baixo do hero, e manter um shader rodando ali é gastar
     * bateria para pintar pixel que ninguém vê.
     */
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          frame = requestAnimationFrame(render)
        } else if (!entry.isIntersecting && running) {
          running = false
          cancelAnimationFrame(frame)
        }
      },
      { threshold: 0 }
    )
    visibility.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
      // WebGL não devolve memória de GPU sozinho.
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  )
}
