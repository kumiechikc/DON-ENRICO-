/**
 * Trata uma foto de produto para o site: enquadra, corrige a cor, e exporta.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O QUE ESTE SCRIPT FAZ, E O QUE ELE SE RECUSA A FAZER
 *
 * Ele faz o que um laboratório de fotografia faz: recorta, acerta o branco,
 * abre a sombra, tira um pouco do ruído de compressão e devolve o foco que a
 * compressão comeu. Tudo isso são operações sobre os pixels QUE JÁ EXISTEM.
 *
 * Ele NÃO inventa pixel nenhum. Nada de "melhorar com IA", nada de gerar uma
 * versão mais bonita do salgado. O motivo é o mesmo que vale para as fotos de
 * banco de imagem: a foto de um site de comida é uma afirmação sobre o produto.
 * Um modelo que redesenha a coxinha entrega uma coxinha que não é a da casa, e
 * quem pediu confiando na foto recebe outra coisa. Isso tem nome, e o nome é
 * propaganda enganosa.
 *
 * A consequência prática: a qualidade máxima de saída é a qualidade do arquivo
 * de entrada. Foto que veio pelo WhatsApp já perdeu metade dos pixels no
 * caminho, e nenhum tratamento devolve isso. O conserto de verdade é pedir o
 * original.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * O BRANCO SAI DO PAPEL, NÃO DE UM PALPITE
 *
 * A correção de cor mais comum ("mundo cinza") assume que a média da cena é
 * neutra. Numa bandeja de salgado frito isso é falso: a cena é dourada de
 * verdade, e a correção rouba o dourado junto com o defeito.
 *
 * Aqui o branco sai de uma referência real. As fotos têm papel branco embaixo
 * do salgado, e papel branco é neutro por construção. O script pega os pixels
 * mais claros da imagem (que são esse papel), mede o quanto cada canal está
 * desviado, e aplica só uma FRAÇÃO da correção — o suficiente para o papel
 * parar de ser amarelo, não o suficiente para o salgado parar de ser dourado.
 *
 *   node scripts/tratar-foto.mjs entrada.jpg saida --corte 100:100:0:0 --branco 0.7
 */
import { execFileSync } from "node:child_process"
import { acharFfmpeg, rodarFfmpeg } from "./lib/ffmpeg.mjs"

/**
 * Larguras exportadas. A maior serve desktop; a menor, celular em 1x.
 *
 * Nenhuma delas AUMENTA a imagem. Foto que chega por WhatsApp já veio reduzida
 * e recomprimida; esticá-la para 1200 não devolve detalhe nenhum, só espalha o
 * borrão da compressão por mais pixels e engorda o arquivo. Quando o recorte
 * for menor que a largura pedida, a largura pedida é ignorada e vale a do
 * recorte.
 */
const LARGURAS = [1200, 640]

/*
 * Separa as opções dos posicionais numa passada só. A versão ingênua
 * (`filter(a => !a.startsWith("--"))`) engolia o VALOR de cada opção como se
 * fosse posicional, e o segundo posicional virava "1200".
 */
const OPCOES = new Map()
const POSICIONAIS = []
{
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) OPCOES.set(args[i].slice(2), args[++i])
    else POSICIONAIS.push(args[i])
  }
}
const argumento = (nome, padrao) => OPCOES.get(nome) ?? padrao

/**
 * Mede o desvio de cor da referência branca da foto.
 *
 * Reduz a imagem a 96x96 (a média de cada bloco já filtra o ruído de
 * compressão), ordena por luminância e olha só o quinto mais claro. Num prato
 * de comida sobre papel, esse quinto É o papel.
 */
function medirBranco(ffmpeg, entrada) {
  const cru = execFileSync(
    ffmpeg,
    ["-v", "error", "-i", entrada, "-vf", "scale=96:96", "-f", "rawvideo",
     "-pix_fmt", "rgb24", "-"],
    { maxBuffer: 1 << 24 }
  )

  const pixels = []
  for (let i = 0; i < cru.length; i += 3) {
    const [r, g, b] = [cru[i], cru[i + 1], cru[i + 2]]
    pixels.push({ r, g, b, luz: 0.2126 * r + 0.7152 * g + 0.0722 * b })
  }
  pixels.sort((a, b) => b.luz - a.luz)

  /*
   * Descarta os 2% do topo antes de medir. Reflexo especular (o brilho da luz
   * na gordura, o plástico da embalagem) satura em 255 nos três canais e
   * chega neutro por estouro, não por ser branco: incluí-lo diluiria a medida
   * justamente com os pixels que não têm informação de cor.
   */
  const de = Math.floor(pixels.length * 0.02)
  const ate = Math.floor(pixels.length * 0.2)
  const amostra = pixels.slice(de, ate)

  const soma = amostra.reduce(
    (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
    { r: 0, g: 0, b: 0 }
  )
  return {
    r: soma.r / amostra.length,
    g: soma.g / amostra.length,
    b: soma.b / amostra.length,
    n: amostra.length,
  }
}

const ffmpeg = acharFfmpeg()
const [entrada, saida] = POSICIONAIS

if (!entrada || !saida) {
  console.error(
    "uso: node scripts/tratar-foto.mjs <entrada> <nome-de-saida> [opções]\n" +
      "  --corte  L:A:X:Y   recorte, em pixels da imagem original\n" +
      "  --branco 0..1      quanto da correção de branco aplicar (padrão 0.7)\n" +
      "  --luz    -1..1     abre ou fecha a exposição (padrão 0)\n" +
      "  --saida-em <dir>   pasta de destino (padrão public/produtos)"
  )
  process.exit(1)
}

const corte = argumento("corte", null)
const forcaBranco = Number(argumento("branco", "0.7"))
const luz = Number(argumento("luz", "0"))
const destino = argumento("saida-em", "public/produtos")

/**
 * Largura real da imagem depois do recorte, para não ampliar.
 *
 * `--corte L:A:X:Y` já traz a largura no primeiro campo; sem recorte, ela sai
 * do próprio arquivo.
 */
function larguraDaFonte(ffmpeg, entrada, corte) {
  if (corte) return Number(corte.split(":")[0])

  /*
   * `ffmpeg -i` sem saída termina com erro e escreve a descrição do fluxo no
   * stderr. É de lá que sai a dimensão: este ambiente não tem `ffprobe`, e o
   * ffmpeg-static vem só com o binário principal.
   */
  let texto = ""
  try {
    execFileSync(ffmpeg, ["-hide_banner", "-i", entrada], { stdio: "pipe" })
  } catch (erro) {
    texto = String(erro.stderr ?? "")
  }
  const m = texto.match(/Video:.*?, (\d+)x(\d+)/)
  if (!m) throw new Error(`não consegui ler a dimensão de ${entrada}`)
  return Number(m[1])
}

const branco = medirBranco(ffmpeg, entrada)
const media = (branco.r + branco.g + branco.b) / 3

/*
 * Ganho por canal para levar a referência ao cinza, temperado por `forcaBranco`.
 * Com 1.0 o papel fica perfeitamente neutro e o salgado perde o dourado junto;
 * com 0 nada muda. O padrão 0.7 tira o amarelo da lâmpada e deixa o da fritura.
 */
const ganho = (canal) => 1 + forcaBranco * (media / branco[canal] - 1)
const gR = ganho("r")
const gG = ganho("g")
const gB = ganho("b")

console.log(`  referência branca: R${branco.r.toFixed(0)} G${branco.g.toFixed(0)} ` +
  `B${branco.b.toFixed(0)} (${branco.n} amostras)`)
console.log(`  ganho aplicado:    R${gR.toFixed(3)} G${gG.toFixed(3)} B${gB.toFixed(3)}`)

const larguraFonte = larguraDaFonte(ffmpeg, entrada, corte)

for (const pedida of LARGURAS) {
  const largura = Math.min(pedida, larguraFonte)
  /*
   * A ordem importa e não é livre:
   *
   *   corte    antes de tudo, porque muda o que as etapas seguintes veem;
   *   hqdn3d   antes de reduzir, para atacar o bloco do JPEG no tamanho em que
   *            ele existe. Depois da redução o bloco vira ruído fino e o filtro
   *            só borra;
   *   cor      no tamanho grande, onde a média é mais estável;
   *   scale    lanczos, que é o que preserva borda em redução;
   *   unsharp  por último e leve, para devolver a borda que a redução comeu.
   *            Antes da redução ele só realçaria o artefato de compressão.
   */
  const etapas = []
  if (corte) etapas.push(`crop=${corte}`)
  etapas.push("hqdn3d=2:1.5:3:3")
  etapas.push(`colorchannelmixer=${gR.toFixed(4)}:0:0:0:0:${gG.toFixed(4)}:0:0:0:0:${gB.toFixed(4)}:0`)
  if (luz !== 0) etapas.push(`eq=brightness=${luz}`)
  etapas.push("eq=contrast=1.06:saturation=1.05")
  etapas.push(`scale=${largura}:-2:flags=lanczos`)
  etapas.push("unsharp=5:5:0.55:5:5:0.0")

  const arquivo = `${destino}/${saida}${pedida === LARGURAS[0] ? "" : `-${pedida}`}.webp`
  rodarFfmpeg(ffmpeg, [
    "-i", entrada,
    "-vf", etapas.join(","),
    "-quality", "82",
    "-compression_level", "6",
    arquivo,
  ])
  console.log(
    `  ${arquivo}  ${largura}px` +
      (largura < pedida ? `  (fonte tem ${larguraFonte}px, não ampliei)` : "")
  )
}
