/**
 * Lógica pura: nada aqui toca em SpreadsheetApp.
 *
 * A separação não é preciosismo. Testar Apps Script clicando na planilha é
 * lento e não deixa rastro; com as regras isoladas em funções puras, elas rodam
 * em Node (`npm run check:planilha`) e uma quebra aparece em segundos, no mesmo
 * lugar onde o resto do projeto já é verificado.
 */

/* ────────────────────────────── catálogo ────────────────────────────── */

function indexarCatalogo(catalogo) {
  const porSku = {}
  for (let i = 0; i < catalogo.length; i++) porSku[catalogo[i].sku] = catalogo[i]
  return porSku
}

function indexarSabores(sabores) {
  const porLinha = {}
  for (let i = 0; i < sabores.length; i++) {
    const s = sabores[i]
    if (!porLinha[s.linha]) porLinha[s.linha] = {}
    porLinha[s.linha][s.sabor] = s.item
  }
  return porLinha
}

/* ─────────────────────────── código do pedido ────────────────────────── */

/*
 * Alfabeto sem 0/O, 1/I/L e 5/S.
 *
 * O código existe para ser lido em voz alta ou copiado da conversa do WhatsApp
 * para a planilha. Confundir zero com ó é o tipo de erro que gera pedido
 * duplicado, e sai barato evitar: 30 símbolos ainda dão 810 mil combinações em
 * quatro casas, muito além do volume desta operação.
 */
var ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRTUVWXYZ23456789'

function gerarCodigo(sorteio) {
  const rnd = sorteio || Math.random
  let saida = ''
  for (let i = 0; i < 4; i++) {
    saida += ALFABETO_CODIGO.charAt(Math.floor(rnd() * ALFABETO_CODIGO.length))
  }
  return saida
}

/* ──────────────────────────── rateio de sabores ──────────────────────── */

/**
 * Divide `total` unidades entre `partes` sabores.
 *
 * Quando não fecha exato (25 unidades em 2 sabores), a sobra vai para os
 * primeiros. É arbitrário, mas precisa ser determinístico: o mesmo pedido
 * lançado duas vezes tem que dar a mesma baixa, senão o estoque não fecha.
 */
function ratearUnidades(total, partes) {
  if (partes <= 0) return []
  const base = Math.floor(total / partes)
  let sobra = total - base * partes
  const saida = []
  for (let i = 0; i < partes; i++) {
    saida.push(base + (sobra > 0 ? 1 : 0))
    if (sobra > 0) sobra--
  }
  return saida
}

/* ─────────────────────── validação do pedido do site ─────────────────── */

/** Tira caracteres de controle e corta o tamanho. Vale para tudo que vem de fora. */
function textoLimpo(valor, limite) {
  if (valor === null || valor === undefined) return ''
  return String(valor)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, limite)
}

/**
 * Recebe o que o site mandou e devolve o pedido do jeito que a planilha aceita.
 *
 * Regra que vale por todas: **o preço nunca vem do cliente.** O site manda SKU
 * e quantidade; o valor sai do catálogo aqui dentro. O endpoint é público — sem
 * isso, qualquer pessoa com o DevTools aberto registra um pedido de mil
 * salgados por um real, e o dono só descobre olhando a planilha.
 */
function normalizarPedido(bruto, catalogo, sabores) {
  const erros = []
  const porSku = indexarCatalogo(catalogo)
  const porLinha = indexarSabores(sabores)

  const entrada = bruto && Array.isArray(bruto.itens) ? bruto.itens : []
  if (entrada.length === 0) erros.push('pedido sem itens')
  if (entrada.length > LIMITES.maxItens) {
    erros.push('pedido com itens demais (' + entrada.length + ')')
    return { erros: erros, itens: [], total: 0 }
  }

  const itens = []
  let total = 0

  for (let i = 0; i < entrada.length; i++) {
    const cru = entrada[i] || {}
    const sku = textoLimpo(cru.sku, 60)
    const produto = porSku[sku]

    if (!produto) {
      erros.push('SKU desconhecido: ' + (sku || '(vazio)'))
      continue
    }

    const pacotes = Math.floor(Number(cru.pacotes))
    if (!isFinite(pacotes) || pacotes < 1 || pacotes > LIMITES.maxPacotes) {
      erros.push('quantidade inválida em ' + sku + ': ' + cru.pacotes)
      continue
    }

    /*
     * Sabores: só os que existem naquela linha, sem repetir e sem passar do
     * máximo da faixa. Sabor repetido não é só sujeira de dado — ele rateia o
     * estoque em duas metades do mesmo produto e desconta certo por acidente,
     * o que esconde o problema em vez de mostrar.
     */
    const permitidos = porLinha[produto.linha] || {}
    const escolhidos = []
    const brutos = Array.isArray(cru.sabores) ? cru.sabores : []

    for (let j = 0; j < brutos.length; j++) {
      const sabor = textoLimpo(brutos[j], 80)
      if (!Object.prototype.hasOwnProperty.call(permitidos, sabor)) {
        erros.push('sabor fora da linha ' + produto.linha + ': ' + sabor)
        continue
      }
      if (escolhidos.indexOf(sabor) === -1) escolhidos.push(sabor)
    }

    /*
     * Mandou sabor e nenhum sobreviveu: o item é descartado, não registrado sem
     * sabor. Registrar mudo seria pior dos dois lados — o cliente pediu um
     * sabor específico e o pedido chegaria em branco, e o estoque não teria de
     * onde descontar. Como item recusado vira observação no pedido, o dono vê o
     * que houve em vez de receber uma linha estranha sem explicação.
     */
    if (brutos.length > 0 && escolhidos.length === 0) {
      continue
    }

    if (escolhidos.length > produto.maxSabores) {
      erros.push(
        'sabores demais em ' + sku + ': ' + escolhidos.length +
          ' (máximo ' + produto.maxSabores + ')'
      )
      continue
    }

    const subtotal = Math.round(produto.preco * pacotes * 100) / 100
    total += subtotal

    itens.push({
      sku: sku,
      linha: produto.linha,
      produto: produto.produto,
      pacotes: pacotes,
      unidades: produto.unidades * pacotes,
      preco: produto.preco,
      subtotal: subtotal,
      sabores: escolhidos,
    })
  }

  return { erros: erros, itens: itens, total: Math.round(total * 100) / 100 }
}

/* ───────────────────────── alocação no estoque ───────────────────────── */

/**
 * Converte os itens do pedido em unidades por produto do congelador.
 *
 * Um item sem sabor escolhido cai no sabor único da linha (é o caso dos
 * congelados). Se a linha não tiver exatamente um sabor, o item entra em
 * `semItem` — a planilha avisa e o dono lança a baixa na mão, o que é bem
 * melhor do que descontar de um produto adivinhado. É por aqui que passa o
 * pacote "Sortidos", que por definição não é um produto só.
 */
function alocarEstoque(itens, sabores) {
  const porLinha = indexarSabores(sabores)
  const unidadesPorItem = {}
  const semItem = []

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i]
    const mapa = porLinha[item.linha] || {}
    let escolhidos = item.sabores || []

    if (escolhidos.length === 0) {
      const unicos = Object.keys(mapa)
      if (unicos.length === 1) escolhidos = unicos
    }

    if (escolhidos.length === 0) {
      semItem.push({
        produto: item.produto,
        unidades: item.unidades,
        motivo: 'sem sabor definido',
      })
      continue
    }

    const fatias = ratearUnidades(item.unidades, escolhidos.length)

    for (let j = 0; j < escolhidos.length; j++) {
      const alvo = mapa[escolhidos[j]]
      if (!alvo) {
        semItem.push({
          produto: item.produto + ' — ' + escolhidos[j],
          unidades: fatias[j],
          motivo: 'sabor sem item de estoque',
        })
        continue
      }
      unidadesPorItem[alvo] = (unidadesPorItem[alvo] || 0) + fatias[j]
    }
  }

  return { unidadesPorItem: unidadesPorItem, semItem: semItem }
}

/* ─────────────────────────────── formato ─────────────────────────────── */

function moeda(valor) {
  const n = Number(valor) || 0
  const partes = n.toFixed(2).split('.')
  const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return 'R$ ' + inteiro + ',' + partes[1]
}

/*
 * O Apps Script ignora este bloco (não existe `module` lá). Ele só serve para
 * os testes em Node carregarem as mesmas funções que rodam na planilha, em vez
 * de uma cópia que envelhece.
 */
if (typeof module !== 'undefined') {
  module.exports = {
    ALFABETO_CODIGO: ALFABETO_CODIGO,
    gerarCodigo: gerarCodigo,
    ratearUnidades: ratearUnidades,
    normalizarPedido: normalizarPedido,
    alocarEstoque: alocarEstoque,
    moeda: moeda,
    textoLimpo: textoLimpo,
  }
}
