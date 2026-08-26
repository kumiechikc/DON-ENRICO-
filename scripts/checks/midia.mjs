/**
 * Verificação da mídia em movimento: clipes de vídeo e sequências de quadros.
 *
 * Duas frentes, porque os dois jeitos de errar são diferentes:
 *
 *  — ESTÁTICA: todo clipe do manifesto tem os três arquivos, dentro do
 *    orçamento, com o fallback MP4; e toda sequência tem a tira medida no
 *    arquivo de verdade. Roda sem navegador (`npm run check:midia`), para dar
 *    resposta em um segundo depois de preparar uma peça.
 *
 *  — NAVEGADOR: com `prefers-reduced-motion`, nenhum byte de vídeo é pedido e
 *    nenhuma sequência avança. Essa é a que não dá para conferir lendo código:
 *    o `<video>` pode estar fora da árvore e mesmo assim um `<source>`
 *    esquecido em algum lugar dispara o download; e um ouvinte de rolagem que
 *    não deveria existir só aparece quando a página rola de verdade.
 */
import { existsSync, statSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join } from "node:path"
import { medirWebp } from "../lib/webp.mjs"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

/*
 * `import()` de caminho absoluto não funciona no Windows: o carregador de
 * módulos lê `c:\...` como se `c:` fosse um esquema de URL e recusa. No Linux
 * do CI o caminho começa com barra e passa por acaso, então a suíte de mídia
 * ficava quebrada só na máquina de quem desenvolve — que é onde ela precisa
 * rodar antes de abrir PR.
 *
 * `pathToFileURL` resolve nos dois: devolve `file:///c:/...` no Windows e
 * `file:///...` no resto. É o mesmo caminho que `design-audit.mjs` já usa.
 */
const moduloDaRaiz = (...partes) => import(pathToFileURL(join(raiz, ...partes)).href)

const ORCAMENTO_KB = { hero: 600, secao: 350, total: 2048, sequencia: 250 }

/*
 * Teto por foto e no conjunto. As fotos entram na mesma página que já carrega
 * quase um megabyte de vídeo, e uma foto de produto que chega em 300 KB come o
 * orçamento inteiro sozinha.
 */
const ORCAMENTO_FOTO_KB = { grande: 200, estreita: 100, total: 700 }

/** Lê o manifesto sem precisar compilar TypeScript. */
async function lerManifesto() {
  const mod = await moduloDaRaiz("src", "lib", "media", "clipes.ts")
  return mod.clipes
}

async function lerSequencias() {
  const mod = await moduloDaRaiz("src", "lib", "media", "sequencias.ts")
  return mod.sequencias
}

async function lerFotos() {
  const mod = await moduloDaRaiz("src", "lib", "media", "fotos.ts")
  return mod.fotos
}

/**
 * O deslocamento que o componente aplica no quadro `q` de uma tira de `n`.
 *
 * Copiado do componente de propósito: se a fórmula lá mudar, a conferência
 * reprova em vez de acompanhar em silêncio. Uma conferência que importa a
 * fórmula do código conferido só prova que o código é igual a si mesmo.
 */
export function deslocamento(q, n) {
  return `translateX(-${(q / n) * 100}%)`
}

/* ─────────────────────────────── estática ───────────────────────────── */

export async function checkMidiaEstatica() {
  const failures = []
  const notes = []
  const clipes = await lerManifesto()

  if (clipes.length === 0) {
    notes.push("nenhum clipe registrado — o site não pede vídeo nenhum hoje")
    /*
     * Sem clipe não há o que medir, e dizer "passou" seria mentira por
     * omissão. O manifesto vazio é estado legítimo do projeto, então a
     * conferência reporta o estado em vez de fingir que verificou algo.
     */
    return { failures, notes }
  }

  let totalKb = 0

  for (const clipe of clipes) {
    const base = join(raiz, "public", "cinema", clipe.id)
    const arquivos = {
      webm: `${base}.webm`,
      mp4: `${base}.mp4`,
      poster: `${base}-poster.webp`,
    }

    for (const [tipo, caminho] of Object.entries(arquivos)) {
      if (!existsSync(caminho)) {
        failures.push(`clipe "${clipe.id}": falta o ${tipo} (${caminho})`)
      }
    }
    if (Object.values(arquivos).some((c) => !existsSync(c))) continue

    const kb = (c) => statSync(c).size / 1024
    const maior = Math.max(kb(arquivos.webm), kb(arquivos.mp4))
    // O hero é o único que quase todo visitante baixa; os de seção são vários.
    const limite = clipe.id === "lampada" ? ORCAMENTO_KB.hero : ORCAMENTO_KB.secao

    if (maior > limite) {
      failures.push(
        `clipe "${clipe.id}": ${maior.toFixed(0)} KB passou do orçamento de ${limite} KB`
      )
    }

    if (!clipe.largura || !clipe.altura) {
      failures.push(`clipe "${clipe.id}": sem largura/altura — a página vai pular`)
    }

    totalKb += kb(arquivos.webm) + kb(arquivos.poster)
    notes.push(
      `${clipe.id}: webm ${kb(arquivos.webm).toFixed(0)} KB, ` +
        `mp4 ${kb(arquivos.mp4).toFixed(0)} KB, ` +
        `poster ${kb(arquivos.poster).toFixed(0)} KB`
    )
  }

  if (totalKb > ORCAMENTO_KB.total) {
    failures.push(
      `soma dos clipes: ${totalKb.toFixed(0)} KB acima do teto de ${ORCAMENTO_KB.total} KB`
    )
  } else if (clipes.length > 0) {
    notes.push(`soma: ${totalKb.toFixed(0)} KB de ${ORCAMENTO_KB.total} KB`)
  }

  return { failures, notes }
}

/* ─────────────────────── sequências (estática) ──────────────────────── */

/**
 * A conferência que justifica a ferramenta de preparo existir.
 *
 * A largura vem do ARQUIVO, não do manifesto. É a única forma de pegar o caso
 * que motivou tudo isto: uma tira de 1376 px anotada como 5 quadros, porque
 * 1376 ÷ 5 = 275,2 e a divisão não fecha. Se a medida saísse do manifesto, a
 * conferência estaria comparando a anotação com ela mesma e passaria feliz
 * enquanto a animação derrapa um pedaço de quadro por passo.
 */
export async function checkSequenciasEstatica() {
  const failures = []
  const notes = []
  const sequencias = await lerSequencias()

  if (sequencias.length === 0) {
    notes.push("nenhuma sequência registrada — nada para medir hoje")
    return { failures, notes }
  }

  for (const seq of sequencias) {
    const caminho = join(raiz, "public", "cinema", `${seq.id}.webp`)

    if (!existsSync(caminho)) {
      failures.push(`sequência "${seq.id}": falta a tira (${caminho})`)
      continue
    }

    if (!Number.isInteger(seq.quadros) || seq.quadros < 2) {
      failures.push(`sequência "${seq.id}": ${seq.quadros} quadro(s) não é sequência`)
      continue
    }
    if (!seq.largura || !seq.altura) {
      failures.push(`sequência "${seq.id}": sem largura/altura — a página vai pular`)
      continue
    }

    let medida
    try {
      medida = medirWebp(caminho)
    } catch (erro) {
      failures.push(`sequência "${seq.id}": não consegui medir a tira — ${erro.message}`)
      continue
    }

    const esperada = seq.largura * seq.quadros
    if (medida.largura !== esperada) {
      failures.push(
        `sequência "${seq.id}": a tira tem ${medida.largura} px, mas ` +
          `${seq.quadros} quadros de ${seq.largura} px dariam ${esperada} — ` +
          "os quadros vão desalinhar. Rode npm run sequencia de novo."
      )
    }
    if (medida.altura !== seq.altura) {
      failures.push(
        `sequência "${seq.id}": a tira tem ${medida.altura} px de altura, ` +
          `o manifesto diz ${seq.altura} — a proporção reservada está errada`
      )
    }

    const kb = statSync(caminho).size / 1024
    if (kb > ORCAMENTO_KB.sequencia) {
      failures.push(
        `sequência "${seq.id}": ${kb.toFixed(0)} KB passou do orçamento de ` +
          `${ORCAMENTO_KB.sequencia} KB`
      )
    }

    notes.push(
      `${seq.id}: ${medida.largura}×${medida.altura}, ` +
        `${seq.quadros} × ${seq.largura} px, ${kb.toFixed(0)} KB`
    )
  }

  return { failures, notes }
}

/* ────────────────────────────── navegador ───────────────────────────── */

/* ────────────────────────── fotos (estática) ─────────────────────────── */

/**
 * As fotos de produto: os dois arquivos existem, cabem no orçamento, e as
 * dimensões anotadas são as do arquivo.
 *
 * A medida sai do ARQUIVO, pelo mesmo motivo da tira de quadros. A altura
 * anotada no manifesto vira o atributo `height` da tag, e é ela que reserva o
 * espaço antes de a imagem chegar. Anotar 675 numa imagem de 600 não quebra
 * nada visível no meu monitor — só faz a página pular um pouco quando a foto
 * carrega, num celular, na casa de outra pessoa. É o CLS voltando pela porta
 * dos fundos, e o jeito de pegar é comparar com o arquivo, não com a anotação.
 */
export async function checkFotosEstatica() {
  const failures = []
  const notes = []
  const fotos = await lerFotos()

  if (fotos.length === 0) {
    notes.push("nenhuma foto registrada — os cards caem no espaço da marca")
    return { failures, notes }
  }

  let totalKb = 0

  for (const foto of fotos) {
    /*
     * O tamanho de cada parte é guardado enquanto ela é medida, e o resumo é
     * montado no fim a partir daqui.
     *
     * A primeira versão remedia o arquivo para escrever a linha do resumo, e
     * quando o arquivo não existia o `statSync` do resumo levantava erro e
     * derrubava a conferência INTEIRA — engolindo a própria reprovação que ela
     * tinha acabado de registrar. A mutação "apaga o arquivo estreito" passou
     * em silêncio por causa disso, que é o pior resultado possível: uma
     * conferência que morre parece uma conferência que não achou nada.
     */
    const medidos = new Map()
    const partes = [
      { rotulo: "grande", caminho: foto.arquivo, largura: foto.largura, teto: ORCAMENTO_FOTO_KB.grande },
      { rotulo: "estreita", caminho: foto.arquivoEstreito, largura: foto.larguraEstreita, teto: ORCAMENTO_FOTO_KB.estreita },
    ]

    for (const parte of partes) {
      const arquivo = join(raiz, "public", parte.caminho.replace(/^\//, ""))
      if (!existsSync(arquivo)) {
        failures.push(`${foto.id}: falta ${parte.caminho}`)
        continue
      }

      const kb = statSync(arquivo).size / 1024
      medidos.set(parte.rotulo, kb)
      totalKb += kb
      if (kb > parte.teto) {
        failures.push(
          `${foto.id} (${parte.rotulo}): ${kb.toFixed(0)} KB acima do teto de ${parte.teto} KB`
        )
      }

      const medida = medirWebp(arquivo)
      if (medida.largura !== parte.largura) {
        failures.push(
          `${foto.id} (${parte.rotulo}): o arquivo tem ${medida.largura} px de largura, ` +
            `o manifesto diz ${parte.largura}`
        )
      }

      /*
       * A altura só é conferida na grande, que é a que o manifesto declara. A
       * estreita é derivada pelo mesmo recorte, então basta que a PROPORÇÃO
       * bata: se as duas discordassem, o navegador trocaria de arquivo no meio
       * do carregamento e a imagem mudaria de formato na tela.
       */
      if (parte.rotulo === "grande" && medida.altura !== foto.altura) {
        failures.push(
          `${foto.id}: o arquivo tem ${medida.altura} px de altura, ` +
            `o manifesto diz ${foto.altura} — é o CLS que isso deixa passar`
        )
      }
      if (parte.rotulo === "estreita") {
        const proporcaoGrande = foto.largura / foto.altura
        const proporcaoEstreita = medida.largura / medida.altura
        if (Math.abs(proporcaoGrande - proporcaoEstreita) > 0.02) {
          failures.push(
            `${foto.id}: a versão estreita tem proporção ${proporcaoEstreita.toFixed(3)} ` +
              `e a grande ${proporcaoGrande.toFixed(3)} — a imagem mudaria de formato ` +
              `quando o navegador trocasse de arquivo`
          )
        }
      }
    }

    if (!foto.descricao || foto.descricao.trim().length < 15) {
      failures.push(
        `${foto.id}: descrição vazia ou curta demais. Foto de produto não é ` +
          `decoração: quem usa leitor de tela também está decidindo o que pedir`
      )
    }

    const grande = medidos.get("grande")
    const estreita = medidos.get("estreita")
    notes.push(
      `${foto.id}: ${foto.largura}x${foto.altura}, ` +
        `${grande === undefined ? "sem arquivo" : `${grande.toFixed(0)} KB`} ` +
        `+ ${estreita === undefined ? "sem arquivo" : `${estreita.toFixed(0)} KB`} estreita`
    )
  }

  if (totalKb > ORCAMENTO_FOTO_KB.total) {
    failures.push(
      `soma das fotos: ${totalKb.toFixed(0)} KB acima do teto de ${ORCAMENTO_FOTO_KB.total} KB`
    )
  } else {
    notes.push(`soma: ${totalKb.toFixed(0)} KB de ${ORCAMENTO_FOTO_KB.total} KB`)
  }

  return { failures, notes }
}

export async function checkMidia(browser, url) {
  const { failures, notes } = await checkMidiaEstatica()
  const daTira = await checkSequenciasEstatica()
  failures.push(...daTira.failures)
  notes.push(...daTira.notes)

  const clipes = await lerManifesto()
  const sequencias = await lerSequencias()

  /**
   * Conta quantos arquivos de vídeo o navegador pediu numa visita.
   *
   * Olha a requisição, não o DOM: é o download que custa os megabytes do
   * cliente no 4G, e ele pode acontecer sem nenhum `<video>` visível.
   */
  async function pedidosDeVideo({ reducedMotion, aparelhoFraco = false }) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion,
    })
    /*
     * Finge um aparelho de entrada. É o caso que o `MotionProvider` rebaixa
     * para "video": sem rolagem interpolada e sem animação amarrada ao scroll,
     * mas COM o clipe — decodificar vídeo em hardware é barato, e era esse
     * aparelho que ficava sem a peça principal da página.
     */
    if (aparelhoFraco) {
      await ctx.addInitScript(() => {
        Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 })
        Object.defineProperty(navigator, "deviceMemory", { get: () => 2 })
      })
    }
    const page = await ctx.newPage()
    const videos = []
    page.on("request", (r) => {
      if (/\.(webm|mp4)(\?|$)/.test(r.url())) videos.push(r.url())
    })
    await page.goto(url, { waitUntil: "load", timeout: 60000 })
    // Percorre a página inteira: o observador só monta o vídeo na aproximação.
    await page.evaluate(async () => {
      const passo = window.innerHeight * 0.7
      for (let y = 0; y < document.body.scrollHeight; y += passo) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 200))
      }
    })
    await page.waitForTimeout(1500)
    await ctx.close()
    return videos
  }

  const comReducao = await pedidosDeVideo({ reducedMotion: "reduce" })
  if (comReducao.length > 0) {
    failures.push(
      `com prefers-reduced-motion o navegador pediu ${comReducao.length} vídeo(s): ` +
        comReducao.map((u) => u.split("/").pop()).join(", ")
    )
  }
  notes.push(`com movimento reduzido: ${comReducao.length} vídeo(s) baixado(s)`)

  /*
   * Com movimento ligado o vídeo TEM que ser pedido. Sem esta metade, a
   * conferência passaria com o componente quebrado e nenhum vídeo tocando —
   * que é exatamente o resultado que "zero downloads" também produz.
   */
  if (clipes.length > 0) {
    const normal = await pedidosDeVideo({ reducedMotion: "no-preference" })
    if (normal.length === 0) {
      failures.push(
        "com movimento ligado nenhum vídeo foi pedido — o componente não está montando"
      )
    }
    notes.push(`com movimento normal: ${normal.length} vídeo(s) baixado(s)`)

    /*
     * A metade que existe por um defeito real: o clipe do hero estava preso
     * atrás do mesmo portão das animações, e sumia em qualquer aparelho que
     * reportasse menos de 4 núcleos ou menos de 4 GB. O dono do site abriu a
     * página e não viu animação nenhuma.
     *
     * Aparelho fraco perde Lenis, ScrollTrigger e shader. NÃO perde o vídeo.
     */
    const fraco = await pedidosDeVideo({
      reducedMotion: "no-preference",
      aparelhoFraco: true,
    })
    if (fraco.length === 0) {
      failures.push(
        "num aparelho fraco (2 núcleos, 2 GB) nenhum vídeo foi pedido — o clipe " +
          "voltou a ficar preso atrás do portão das animações"
      )
    }
    notes.push(`em aparelho fraco: ${fraco.length} vídeo(s) baixado(s)`)
  }

  /*
   * O clipe que toca UMA VEZ tem que começar quando a pessoa chega nele.
   *
   * O observador que decide baixar tem 200px de folga, e por engano era ele
   * quem mandava tocar também. Medido antes do conserto, num celular rolando
   * devagar: ao chegar na peça o vídeo já estava em 3,25s de 4,17, e terminava
   * um segundo depois. O dono do site viu uma "foto estática" — era o último
   * quadro, parado.
   */
  for (const clipe of clipes.filter((c) => c.modo === "unico")) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: "load", timeout: 60000 })
    await page.waitForTimeout(2000)

    const topo = await page.evaluate((id) => {
      const el = document.querySelector(`[data-clipe="${id}"]`)
      return el ? el.getBoundingClientRect().top + window.scrollY : null
    }, clipe.id)

    if (topo === null) {
      failures.push(`clipe "${clipe.id}": não achei a peça na página`)
      await ctx.close()
      continue
    }

    // Rolagem em passos, como um dedo — não um salto, que não reproduz o caso.
    for (let y = 0; y <= Math.max(0, topo - 300); y += 120) {
      await page.evaluate((v) => window.scrollTo(0, v), y)
      await page.waitForTimeout(140)
    }

    const emQueTempo = await page.evaluate((id) => {
      const v = document.querySelector(`[data-clipe="${id}"] video`)
      return v ? Number(v.currentTime.toFixed(2)) : null
    }, clipe.id)
    await ctx.close()

    if (emQueTempo === null) {
      failures.push(`clipe "${clipe.id}": nenhum vídeo montado ao chegar na peça`)
    } else if (emQueTempo > 1.5) {
      failures.push(
        `clipe "${clipe.id}": ao chegar na peça o vídeo já estava em ` +
          `${emQueTempo}s — começou fora da tela e a pessoa pega o fim dele`
      )
    } else {
      notes.push(`${clipe.id}: ao chegar na peça o vídeo estava em ${emQueTempo}s`)
    }
  }

  /*
  /*
   * A esteira de sabores, medida em px/s e não em "andou alguma coisa".
   *
   * Duas frentes, e a segunda é a que pegou o defeito de verdade:
   *
   * 1. Ela roda no aparelho fraco? É uma `transform` em laço composta na GPU, e
   *    ficava desligada junto com o que é caro (Lenis, ScrollTrigger).
   * 2. Ela roda numa VELOCIDADE LEGÍVEL, e a mesma em qualquer tela? A versão
   *    anterior fixava a duração em 28s e deixava a velocidade sair do tamanho
   *    do trilho: 502 px/s no desktop e 336 no celular. Texto acima de ~150
   *    px/s vira borrão, e o dono do site relatou não conseguir ler os sabores.
   *    Pior: acrescentar um sabor no cardápio acelerava a faixa.
   *
   * A conferência anterior exigia "andou mais de 5px em 1,5s" — passava com 502
   * px/s tranquilamente. Medir que se move não basta; é preciso medir o passo.
   */
  {
    const FAIXA_LEGIVEL = { min: 40, max: 110 }
    const medidas = []

    for (const [rotulo, largura, altura, fraco] of [
      ["celular fraco", 390, 844, true],
      ["desktop", 1440, 900, false],
    ]) {
      const ctx = await browser.newContext({
        viewport: { width: largura, height: altura },
        isMobile: largura < 500,
        hasTouch: largura < 500,
      })
      if (fraco) {
        await ctx.addInitScript(() => {
          Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 })
          Object.defineProperty(navigator, "deviceMemory", { get: () => 2 })
        })
      }
      const page = await ctx.newPage()
      await page.goto(url, { waitUntil: "load", timeout: 60000 })
      await page.waitForTimeout(1500)

      const px = await page.evaluate(async () => {
        const faixa = document.querySelector("[data-esteira]")
        if (!faixa) return null
        const ler = () =>
          new DOMMatrixReadOnly(getComputedStyle(faixa).transform || "none").m41
        const antes = ler()
        await new Promise((r) => setTimeout(r, 2000))
        return Math.abs(ler() - antes) / 2
      })
      await ctx.close()

      if (px === null) {
        failures.push("não achei a esteira de sabores na página")
        continue
      }
      medidas.push({ rotulo, px })

      if (px < 1) {
        failures.push(
          `esteira em ${rotulo}: parada (${px.toFixed(1)} px/s) — desligada junto ` +
            "com o que é caro de verdade"
        )
      } else if (px < FAIXA_LEGIVEL.min || px > FAIXA_LEGIVEL.max) {
        failures.push(
          `esteira em ${rotulo}: ${px.toFixed(0)} px/s, fora da faixa legível de ` +
            `${FAIXA_LEGIVEL.min} a ${FAIXA_LEGIVEL.max} px/s — ` +
            (px > FAIXA_LEGIVEL.max ? "os sabores viram borrão" : "parece travada")
        )
      } else {
        notes.push(`esteira em ${rotulo}: ${px.toFixed(0)} px/s`)
      }
    }

    /*
     * E as duas têm que bater. Velocidade diferente entre telas significa que
     * ela está saindo do tamanho do trilho em vez de ser escolhida.
     */
    if (medidas.length === 2) {
      const [a, b] = medidas
      const desvio = Math.abs(a.px - b.px) / Math.max(a.px, b.px)
      if (desvio > 0.15) {
        failures.push(
          `esteira: ${a.px.toFixed(0)} px/s em ${a.rotulo} contra ` +
            `${b.px.toFixed(0)} em ${b.rotulo} — a velocidade está saindo do ` +
            "tamanho do trilho, não de uma decisão"
        )
      }
    }
  }

  /**
   * Percorre a página anotando em que quadro cada sequência parou.
   *
   * Não dá para perguntar ao navegador "existe ouvinte de rolagem aqui". O que
   * dá para observar é a consequência: se o ouvinte existe, o quadro muda ao
   * rolar; se não existe, ele fica parado no último. É a mesma coisa medida
   * pelo lado que o usuário sente.
   */
  async function quadrosVistos({ reducedMotion }) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: "load", timeout: 60000 })

    const vistos = new Map()
    async function anotar() {
      const agora = await page.$$eval("[data-sequencia]", (els) =>
        els.map((el) => ({
          id: el.getAttribute("data-sequencia"),
          transform: el.querySelector("img")?.style.transform ?? "",
        }))
      )
      for (const { id, transform } of agora) {
        if (!vistos.has(id)) vistos.set(id, new Set())
        vistos.get(id).add(transform)
      }
    }

    await anotar()
    const altura = await page.evaluate(() => document.body.scrollHeight)
    const passo = 844 * 0.35
    for (let y = 0; y < altura; y += passo) {
      await page.evaluate((v) => window.scrollTo(0, v), y)
      await page.waitForTimeout(120)
      await anotar()
    }

    await ctx.close()
    return vistos
  }

  if (sequencias.length > 0) {
    const parado = await quadrosVistos({ reducedMotion: "reduce" })
    const rolando = await quadrosVistos({ reducedMotion: "no-preference" })

    for (const seq of sequencias) {
      const ultimo = deslocamento(seq.quadros - 1, seq.quadros)

      const comReducao = parado.get(seq.id)
      if (!comReducao) {
        failures.push(`sequência "${seq.id}": não achei a peça na página`)
        continue
      }
      if (comReducao.size !== 1 || !comReducao.has(ultimo)) {
        failures.push(
          `sequência "${seq.id}": com movimento reduzido o quadro deveria ficar ` +
            `parado em ${ultimo}, mas passou por ${[...comReducao].join(", ")}`
        )
      } else {
        notes.push(`${seq.id}: com movimento reduzido, parada no último quadro`)
      }

      /*
       * A outra metade, e a que pega o componente morto: sem ela, uma peça que
       * nunca avança passaria nos dois lados — "parada" é o resultado certo de
       * um lado e o defeito silencioso do outro.
       */
      const comMovimento = rolando.get(seq.id)
      if (!comMovimento || comMovimento.size < 2) {
        failures.push(
          `sequência "${seq.id}": com movimento ligado o quadro não mudou ao ` +
            "rolar — a animação não está ligada"
        )
      } else {
        notes.push(`${seq.id}: com movimento ligado, ${comMovimento.size} quadros vistos`)
      }
    }

    /*
     * Sem JavaScript o HTML entregue pelo servidor já tem que trazer o último
     * quadro. Aqui é o HTML cru mesmo, sem navegador: é o que o robô de busca
     * lê e o que aparece enquanto o JavaScript não chega.
     */
    const html = await (await fetch(url)).text()
    let faltou = 0
    for (const seq of sequencias) {
      const ultimo = deslocamento(seq.quadros - 1, seq.quadros)
      if (!html.includes(ultimo)) {
        faltou++
        failures.push(
          `sequência "${seq.id}": o HTML do servidor não traz o último quadro ` +
            `(${ultimo}) — sem JavaScript a peça aparece no quadro errado`
        )
      }
    }
    if (faltou === 0) notes.push("HTML do servidor: último quadro presente")
  }

  return { failures, notes }
}
