/**
 * Endpoint que recebe o pedido montado no site.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O que este endpoint é, e o que ele não é
 *
 * O site é estático (GitHub Pages): não existe servidor nosso, e qualquer chave
 * que o site use está visível no JavaScript para quem abrir o DevTools. Então o
 * token abaixo **não é segurança** — ele filtra robô que varre a internet
 * disparando POST em qualquer URL, e nada além disso.
 *
 * A segurança de verdade está em outro lugar: o que este endpoint aceita fazer.
 * Ele só acrescenta um pedido com status "Novo", com preço recalculado do
 * catálogo e SKU conferido. Não lê nada, não altera pedido existente, não mexe
 * em estoque. O pior caso de abuso é linha de lixo na aba Pedidos, que o dono
 * apaga. Estoque e dinheiro só se movem quando ele confirma na planilha.
 *
 * Essa é a troca deliberada: em vez de fingir proteger um segredo que não tem
 * como ser secreto, limitar o estrago de quem passar por ele.
 * ─────────────────────────────────────────────────────────────────────────────
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respostaJson_({ ok: false, erro: 'corpo vazio' })
    }
    if (e.postData.contents.length > LIMITES.maxCorpoBytes) {
      return respostaJson_({ ok: false, erro: 'corpo grande demais' })
    }

    let corpo
    try {
      corpo = JSON.parse(e.postData.contents)
    } catch (erro) {
      return respostaJson_({ ok: false, erro: 'JSON inválido' })
    }

    const esperado = PropertiesService.getScriptProperties().getProperty('TOKEN_SITE')
    if (esperado && String(corpo.token || '') !== esperado) {
      return respostaJson_({ ok: false, erro: 'token inválido' })
    }

    /*
     * Mesmo código chegando de novo é o mesmo pedido, não um novo.
     *
     * Acontece de verdade: o cliente clica em "Enviar pelo WhatsApp", volta
     * para a aba do site e clica outra vez. Sem esta conferência o dono vê dois
     * pedidos idênticos e não tem como saber se são duas festas ou um clique
     * repetido.
     */
    const codigo = codigoValido_(corpo.codigo)
    const jaExiste = codigo ? pedidoPorCodigo_(codigo) : null
    if (jaExiste) {
      return respostaJson_({ ok: true, id: jaExiste.id, codigo: codigo, repetido: true })
    }

    const pedido = normalizarPedido(corpo, CATALOGO, SABORES)
    if (pedido.itens.length === 0) {
      return respostaJson_({ ok: false, erro: 'nenhum item válido', detalhes: pedido.erros })
    }

    const gravado = gravarPedido_(pedido, {
      origem: 'Site',
      status: STATUS.novo,
      codigo: codigo,
      cliente: textoLimpo(corpo.cliente, 80),
      telefone: textoLimpo(corpo.telefone, 30),
      /*
       * Item recusado vira observação em vez de erro que derruba o pedido.
       *
       * Se o site mandar oito itens e um estiver fora do catálogo, registrar os
       * sete e anotar o oitavo é melhor que perder o pedido inteiro: o cliente
       * já está indo para o WhatsApp com a mensagem na mão, e é lá que o dono
       * fecha o que faltou.
       */
      obs: pedido.erros.length > 0 ? 'Conferir: ' + pedido.erros.join('; ') : '',
    })

    return respostaJson_({ ok: true, id: gravado.id, codigo: gravado.codigo })
  } catch (erro) {
    /*
     * Nunca devolver a mensagem crua de exceção: ela pode carregar nome de aba,
     * fórmula e caminho interno. O detalhe fica no log do Apps Script, que é
     * onde ele serve para alguma coisa.
     */
    console.error(erro)
    return respostaJson_({ ok: false, erro: 'falha ao registrar' })
  }
}

/** Confere se o código veio no formato certo; senão deixa a planilha sortear. */
function codigoValido_(bruto) {
  const c = String(bruto || '').toUpperCase()
  if (c.length !== 4) return ''
  for (let i = 0; i < c.length; i++) {
    if (ALFABETO_CODIGO.indexOf(c.charAt(i)) === -1) return ''
  }
  return c
}

/** Sinal de vida, para conferir o deploy sem precisar montar um pedido. */
function doGet() {
  return respostaJson_({
    ok: true,
    servico: 'Don Enrico — registro de pedidos',
    skus: CATALOGO.length,
  })
}

function respostaJson_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON
  )
}

/* ─────────────────────────── configuração ───────────────────────────── */

/**
 * Mostra (criando se não existir) o token que o site precisa enviar.
 */
function mostrarTokenDoSite() {
  const props = PropertiesService.getScriptProperties()
  let token = props.getProperty('TOKEN_SITE')
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '').slice(0, 24)
    props.setProperty('TOKEN_SITE', token)
  }
  SpreadsheetApp.getUi().alert(
    'Token do site',
    'Coloque este valor em NEXT_PUBLIC_REGISTRO_TOKEN no site:\n\n' +
      token +
      '\n\nEle fica visível no código do site — é filtro contra robô, não segredo.',
    SpreadsheetApp.getUi().ButtonSet.OK
  )
}
