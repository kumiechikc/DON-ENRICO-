/*
 * Tokens de movimento — o vocabulário de tempo e curva do site.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * POR QUE ISTO EXISTE
 *
 * O levantamento de 2026-08-27 (`docs/BRIEF-MOVIMENTO.md` §1.3) achou 14 durações
 * distintas e 8 curvas de easing espalhadas como literais no ponto de uso, e
 * nenhuma com nome. Pior que a dispersão: QUATRO DESSAS CURVAS NÃO FORAM
 * ESCOLHIDAS. Eram tweens sem `ease` declarado, caindo no `power1.out` que o GSAP
 * usa por omissão. Metade da linguagem de movimento do site tinha sido herdada,
 * não decidida.
 *
 * Este arquivo não muda um único milissegundo. Ele dá nome ao que já existe, e
 * torna explícito o que era implícito. É a condição para a rodada seguinte
 * (parallax e timeline ligada à rolagem) poder decidir tempo em vez de sortear.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRÊS CAMADAS, E A TERCEIRA SÓ ENTRA QUANDO A SEGUNDA MENTIRIA
 *
 *   primitivo  → o valor cru, nomeado pelo próprio valor (como `--color-blue-600`)
 *   semântico  → a intenção ("reação", "revelação", "retorno ao repouso")
 *   componente → só quando o número é exclusivo de uma peça e um nome de
 *                intenção daria a entender que ele vale para o site inteiro
 *
 * A regra da terceira camada é a que mais importa aqui. O anel do cursor segue o
 * ponteiro em 0,42s e o botão magnético em 0,5s — mesma intenção, números
 * diferentes. Unificar os dois seria mudar o comportamento, o que esta rodada
 * proíbe. Então cada um recebe um token de componente, com a diferença
 * registrada por escrito: ela vira uma decisão a tomar, em vez de uma
 * inconsistência a descobrir de novo daqui a três meses.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O LADO CSS É OUTRO ARQUIVO, DE PROPÓSITO
 *
 * As 26 transições CSS do site vivem em `src/app/globals.css`, porque o Tailwind
 * precisa das variáveis em `:root` para gerar as utilidades. GSAP fala segundos,
 * CSS fala milissegundos: uma fonte só teria de converter em tempo de execução,
 * e o preço seria uma dependência de JavaScript para pintar um hover.
 *
 * As duas fontes são conferidas uma contra a outra por
 * `scripts/check-movimento.mjs`, que reprova se divergirem.
 */

// ─── Camada 1 — primitivos ───────────────────────────────────────────────────
//
// Nomeados pelo valor. Ninguém importa daqui direto num componente: eles existem
// para a camada semântica apontar. Se um número novo precisar entrar, ele entra
// aqui primeiro, e aí se pergunta que intenção ele serve.

const SEGUNDOS = {
  s025: 0.25,
  s030: 0.3,
  s035: 0.35,
  s040: 0.4,
  s042: 0.42,
  s050: 0.5,
  s062: 0.62,
  s070: 0.7,
  s080: 0.8,
  s090: 0.9,
  s100: 1.0,
  s110: 1.1,
} as const

/*
 * As curvas, escritas como o GSAP as espera.
 *
 * `power1Out` está aqui por um motivo específico: ele é o default do GSAP, e era
 * o que quatro tweens usavam sem saber. Nomear o default é o que transforma
 * omissão em escolha — daqui em diante, quem usar essa curva usou porque quis.
 */
const CURVA = {
  /** Default do GSAP. Desaceleração suave, quase neutra. */
  power1Out: "power1.out",
  /** Desaceleração média. */
  power2Out: "power2.out",
  /** Aceleração média — para quem sai de cena. */
  power2In: "power2.in",
  /** Desaceleração acentuada. É o que dá sensação de peso. */
  power3Out: "power3.out",
  /** Freada muito forte no fim. Bom para tipografia. */
  expoOut: "expo.out",
  /** Acelera e freia forte nas duas pontas. Painel grande. */
  expoInOut: "expo.inOut",
  /** Passa do alvo e volta. Amplitude 1, período 0,35. */
  elasticSuave: "elastic.out(1, 0.35)",
  /** Sem curva. Só para laço infinito, onde qualquer easing pulsaria. */
  linear: "none",
} as const

// ─── Camada 2 — semânticos ───────────────────────────────────────────────────

/**
 * Durações por intenção. É daqui que a maior parte do site consome.
 */
export const DURACAO = {
  /** Troca de estado discreta: opacidade, escala, cor. */
  reacao: SEGUNDOS.s030,
  /** Algo saindo de cena. Sai sempre mais rápido do que entrou. */
  saida: SEGUNDOS.s025,
  /** Conteúdo entrando por rolagem, em cascata entre irmãos. */
  revelacaoCascata: SEGUNDOS.s070,
  /** Conteúdo entrando por rolagem, bloco único. */
  revelacao: SEGUNDOS.s080,
  /** Tipografia cinética: o título caindo caractere a caractere. */
  carimbo: SEGUNDOS.s100,
} as const

/**
 * Curvas por intenção. Duas intenções podem apontar para a mesma curva — é
 * exatamente para isso que a camada semântica existe: `entrada` e `estado`
 * hoje valem a mesma coisa, mas trocar uma delas amanhã não deve arrastar a
 * outra junto.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * M3 — A UNIFICAÇÃO DE CURVA (2026-08-28, `docs/BRIEF-MOVIMENTO.md` §3.2)
 *
 * Três intenções convergiram para `expo.out`: `entrada` e `acompanhamento`
 * vinham de `power3.out`, e `estado` vinha de `power1.out` — que era o default
 * do GSAP, herdado por omissão em quatro tweens.
 *
 * O motivo veio medido, não de gosto. A auditoria das cinco referências (§2.6,
 * lição 1) achou o contrário do que se esperava: COERÊNCIA É TER MENOS CURVAS,
 * NÃO MAIS. lenis.dev move 421 elementos com uma curva só. O site tinha oito
 * para quinze tweens, e metade delas ninguém escolheu.
 *
 * `expo.out` foi a escolhida porque o site JÁ FALA ESSA LÍNGUA em dois lugares
 * que ninguém questiona: é a curva do título do hero (`carimbo`) e é, escrita à
 * mão como função, a curva do próprio Lenis (`LENIS.easing` — a exponencial
 * `1.001 − 2^(−10t)` é `expo.out`). Ou seja, a rolagem inteira do site já
 * desacelera assim. Alinhar o resto a ela é fazer as peças concordarem com o
 * gesto que já governa tudo, em vez de eleger uma curva nova.
 *
 * O que NÃO mudou: nenhuma duração. M3 troca curva e só.
 *
 * `power1Out`, `power2Out`, `power2In` e `power3Out` continuam declarados na
 * camada primitiva de propósito. Três deles ainda sustentam a cortina de
 * entrada, e apagar `power1Out` apagaria junto o registro de que ele era o
 * default herdado — que é a metade da história que explica por que M3 existiu.
 */
export const EASE = {
  /** Conteúdo aparecendo: revelação por rolagem, bloco de apoio. */
  entrada: CURVA.expoOut,
  /** Elemento seguindo o ponteiro em tempo real. */
  acompanhamento: CURVA.expoOut,
  /** Volta ao repouso depois que o ponteiro sai. */
  retorno: CURVA.elasticSuave,
  /** Troca de estado discreta: opacidade, escala, cor. */
  estado: CURVA.expoOut,
  /** Tipografia cinética. */
  carimbo: CURVA.expoOut,
  /** Laço infinito. */
  continuo: CURVA.linear,
} as const

/**
 * Cascatas. O `each` é o intervalo entre irmãos; o `teto` limita o total para
 * que uma lista longa não deixe o último item parecendo esquecido.
 */
export const CASCATA = {
  /** Entre irmãos de uma revelação por rolagem. */
  irmaos: 0.06,
  /** Teto do total de uma cascata de irmãos. */
  irmaosTeto: 0.48,
  /** Entre caracteres do título. Curto: é carimbo caindo, não máquina de escrever. */
  caracteres: 0.022,
} as const

/**
 * Deslocamentos de entrada, em pixels. Pequenos de propósito: acima de ~30px a
 * revelação lê como deslize e não como aparição, e o olho persegue o movimento
 * em vez de ler o texto.
 */
export const DESLOCAMENTO = {
  /** Revelação de bloco único. */
  revelacao: 24,
  /** Revelação em cascata — um pouco maior, a cascata dilui a distância. */
  revelacaoCascata: 28,
} as const

// ─── Camada 3 — componentes ──────────────────────────────────────────────────
//
// Só o que é exclusivo de uma peça. Cada bloco abaixo justifica por que o número
// não subiu para a camada semântica.

/**
 * Rolagem interpolada.
 *
 * A curva é exponencial escrita à mão e não uma das primitivas acima porque o
 * Lenis pede uma FUNÇÃO de progresso, não uma string do GSAP. São vocabulários
 * diferentes; fingir que são o mesmo criaria uma conversão que ninguém pediu.
 */
export const LENIS = {
  duracao: SEGUNDOS.s110,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
} as const

/**
 * Anel que segue o ponteiro.
 *
 * `duracaoSeguir` é 0,42s aqui e 0,5s no botão magnético. Mesma intenção, dois
 * números — herdado, não decidido. Fica registrado como componente até alguém
 * medir qual dos dois está certo; unificar agora seria mudar comportamento numa
 * rodada que só dá nome ao que existe.
 */
export const CURSOR = {
  duracaoSeguir: SEGUNDOS.s042,
  /** Quanto o anel cresce sobre algo acionável. */
  escalaSobreAlvo: 1.9,
} as const

/**
 * Botão magnético. Ver a nota em `CURSOR` sobre `duracaoSeguir`.
 */
export const MAGNETICO = {
  duracaoSeguir: SEGUNDOS.s050,
  duracaoRetorno: SEGUNDOS.s070,
  /** Deslocamento máximo, em pixels. Pequeno para o alvo não fugir do ponteiro. */
  forcaPadrao: 10,
} as const

/**
 * Cortina de entrada.
 *
 * As três curvas são exclusivas dela. `power2.out`/`power2.in` na marca e
 * `expo.inOut` na subida formam um gesto único — subir semanticamente daria a
 * entender que valem para qualquer painel, e não valem: nada mais no site cobre
 * a tela inteira.
 */
export const CORTINA = {
  duracaoMarcaEntra: SEGUNDOS.s035,
  duracaoMarcaSai: SEGUNDOS.s025,
  duracaoSubida: SEGUNDOS.s062,
  easeMarcaEntra: CURVA.power2Out,
  easeMarcaSai: CURVA.power2In,
  easeSubida: CURVA.expoInOut,
} as const

/**
 * Hero. Os atrasos são a coreografia da dobra: o título carimba, e o bloco de
 * apoio entra meio segundo depois, quando o olho já terminou de ler o título.
 * São relações entre duas peças da mesma tela — não existe "atraso padrão".
 */
export const HERO = {
  atrasoTitulo: SEGUNDOS.s035,
  atrasoApoio: SEGUNDOS.s090,
  duracaoApoio: SEGUNDOS.s090,
  deslocamentoApoio: 26,
  /** Espera antes de montar o shader, em milissegundos. Não disputa CPU com a hidratação. */
  esperaShaderMs: 450,
  /*
   * A taxa da camada de fundo do hero contra a rolagem da página (M2).
   *
   * 0,5 é "meia taxa": a camada anda na tela com metade da velocidade do
   * conteúdo, então ela desce 0,5px dentro da seção para cada 1px que a página
   * sobe. Não é gosto — é o número que separa profundidade de distração. Acima
   * disso o olho passa a perseguir o fundo em vez de ler o título; abaixo, o
   * efeito não se lê como camada e vira só um tremor.
   *
   * Este é o único token de RELAÇÃO do arquivo: os outros são tempos e
   * distâncias, e este é uma proporção entre dois movimentos. Ele mora aqui e
   * não em `hero-section.tsx` porque a folga de escala que impede a camada de
   * revelar borda é calculada a partir dele — separar os dois deixaria alguém
   * mexer na taxa sem saber que a folga depende dela.
   */
  taxaParallax: 0.5,
} as const

/**
 * Esteira de sabores.
 *
 * A velocidade em px/s continua declarada em `marquee.tsx`, junto da medição que
 * a justifica — separar o número do parágrafo que prova por que ele é 70 e não
 * 500 tornaria os dois piores. O que mora aqui é só o tempo da inversão.
 */
export const ESTEIRA = {
  duracaoInversao: SEGUNDOS.s040,
} as const
