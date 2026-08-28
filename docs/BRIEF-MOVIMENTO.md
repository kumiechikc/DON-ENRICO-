# Brief de movimento

> Este documento decide o que o site da Don Enrico anima, e por quê. A regra que o
> governa é uma só: **nada entra por ser bonito.** Cada movimento aqui aponta para um
> elemento existente e para uma razão que sobrevive à pergunta "e se não tivesse?".
>
> Ele nasce de duas medições, não de gosto: o inventário do que o site já faz (§1) e a
> auditoria das cinco referências que o dono escolheu (§2).

## 1. O que o site já faz, medido

### 1.1 A primeira correção: o diagnóstico anterior estava errado

O `RETOMAR.md` dizia que o site tem "uma única animação repetida em 11 lugares". Isso
descreve **uma** das camadas, não o site. O levantamento linha a linha achou **15 tweens
GSAP distintos**, em seis famílias:

| Família | O que é | Onde |
|---|---|---|
| Revelação por scroll | `opacity 0→1`, `y 24→0`, 0.8s `power3.out` | `use-reveal.ts:77` — esta sim é a repetida |
| Título cinético | `yPercent 118→0` por caractere, 1.0s `expo.out`, stagger 22ms | `use-split-text.ts:80` |
| Botão magnético | `x`/`y` via `quickTo` 0.5s `power3.out`; retorno `elastic.out(1,0.35)` 0.7s | `magnetic-button.tsx:43` |
| Anel do cursor | `x`/`y` 0.42s; escala 1↔1.9 no alvo interativo | `cursor-follower.tsx:30` |
| Cortina de entrada | marca entra 0.35s, sai 0.25s, cortina sobe 0.62s `expo.inOut` | `intro-curtain.tsx:54` |
| Esteira de sabores | `x` linear infinito a 70 px/s, e o `timeScale` **inverte** conforme a direção do scroll | `marquee.tsx:71` |

Corrigir isso importa porque muda a conclusão. O site **não** é pobre de movimento: ele
tem peças caras e bem feitas. O que ele não tem é **coerência** — cada peça foi decidida
sozinha, com o seu próprio número, e nenhuma delas conversa com a rolagem.

### 1.2 O que de fato falta, e é greenfield

Confirmado por varredura: **`scrub` não aparece uma vez sequer no código. `pin`, também
não.** Os três arquivos que tocam `ScrollTrigger` — `motion-provider.tsx`, `use-reveal.ts`,
`marquee.tsx` — usam-no só como detector de entrada em viewport e de direção de rolagem.

Existe **uma** exceção parcial, e ela é a prova de que o caminho funciona neste site: a
esteira do `marquee.tsx:87` lê a direção do scroll e inverte o sentido da faixa. É a
única peça hoje em que rolar a página *muda* o que se vê, em vez de apenas *disparar* algo.

O Lenis (`motion-provider.tsx:115`, `duration: 1.1`, easing exponencial próprio,
`syncTouch: false`) está pagando só pelo toque da roda do mouse. Ele existe para ser a
base de uma camada de scrub, e não há camada de scrub.

### 1.3 Os números soltos

Catorze durações distintas, sem nome:

| Duração | Vezes | Duração | Vezes |
|---|---|---|---|
| 150ms | 10 | 500ms | 4 |
| 200ms | 1 | 620ms | 1 |
| 250ms | 2 | 700ms | 3 |
| 300ms | 14 | 800ms | 1 |
| 350ms | 1 | 900ms | 1 |
| 400ms | 1 | 1000ms | 1 |
| 420ms | 2 | 1100ms | 1 (Lenis) |

São 14, não 12 como estava anotado: faltavam 350ms (`intro-curtain.tsx:56`) e os 1100ms
do Lenis. E oito curvas de easing em GSAP — `power3.out` (7x), o default implícito
`power1.out` (4x, por omissão e não por escolha), `elastic.out(1,0.35)`, `power2.out`,
`power2.in`, `expo.inOut`, `expo.out`, `none` — mais a curva exponencial escrita à mão do
Lenis, mais o `cubic-bezier(0.4, 0, 0.2, 1)` que o Tailwind aplica, indistintamente, às
**26 transições CSS** do site: nenhuma delas declara `ease-*`.

Duas leituras saem daí, e a segunda é a que dói:

1. **Nada disso tem nome.** Não existe `--ease-*`, não existe `--duration-*`, não existe
   constante JS exportada. Tudo é literal no ponto de uso. O `globals.css` tokeniza cor e
   tipografia com cuidado (`:root` + `@theme inline`, `globals.css:19-63`) e não tokeniza
   tempo nenhum.
2. **Quatro curvas foram escolhidas por omissão.** Os quatro tweens sem `ease` declarado
   caem no `power1.out` do GSAP por default. E as 26 transições CSS usam a curva do
   Tailwind porque ninguém disse nada. Metade da linguagem de movimento deste site não foi
   decidida; foi herdada.

### 1.4 As restrições que o movimento novo tem de respeitar

Levantadas junto, e nenhuma é negociável:

- **CLS é zero hoje, e isso foi caro.** Toda mídia reserva espaço por `aspect-ratio` ou
  `width`/`height` (`cinema-loop.tsx:146`, `product-image.tsx`). O pôster é o LCP e o vídeo
  sobe por cima (decisão de 2026-08-22). Qualquer pin ou parallax que mexa em altura
  reintroduz CLS e reprova na conferência.
- **Nenhuma seção tem altura fixa.** Só o hero está ancorado ao viewport
  (`min-h-[100svh]`, `hero-section.tsx:75`); as outras oito são fluidas — padding vertical
  mais conteúdo. `pin: true` exige altura de scroll determinística, então pinar exige
  escolher uma seção e dar altura a ela de propósito, não sair pinando.
- **O `MotionProvider` tem três níveis, não um interruptor** (decisão de 2026-08-22).
  `motionEnabled` (completo) libera Lenis, ScrollTrigger e shader; `videoEnabled` libera o
  `<video>`; `lacosLeves` libera laço de `transform` na GPU. Movimento novo ligado a scroll
  entra atrás de `motionEnabled`, e precisa de um estado final correto quando ele é falso —
  não "sem animação", e sim **a página inteira legível e no lugar**.
- **`prefers-reduced-motion` é assinado ao vivo** (`useSyncExternalStore` +
  `matchMedia(...).addEventListener`, `motion-provider.tsx:57`). Quem ligar "reduzir
  movimento" com a página aberta muda o estado na hora. Já cobrou um bug: a cortina de
  entrada removia o próprio nó do DOM e quebrava o React nesse exato caminho.
- **O orçamento é 103 KB.** Medido contra produção: 217 KB de 320. GSAP e Lenis já estão
  dentro dos 217, então usar mais recursos deles custa quase zero — é onde está o ganho
  barato. Biblioteca nova justifica cada KB contra esse número. three.js já foi recusado
  duas vezes, com número: 1594 KB para desenhar um quad.

### 1.5 Achados colaterais, para a dívida

- **`@gsap/react` (`useGSAP`) está no `package.json` e não é importado em lugar nenhum.**
  Segunda dependência morta confirmada, ao lado de `class-variance-authority`. Todo o
  código usa `useEffect` + `gsap.context()` ou limpeza manual. Decidir entre adotar o
  `useGSAP` na camada nova ou remover a dependência — as duas resolvem; ficar como está, não.
- `SplitText` é registrado dinamicamente (`use-split-text.ts:47`) e usado no título do hero.
  É plugin do clube da GSAP, hoje liberado; vale registrar a dependência explicitamente
  antes de apoiar mais coisa nele.
- `sequencia.tsx` + `sequencias.ts` são infraestrutura de scrub por quadros **pronta e não
  plugada** (`sequencias.ts:45` é um array vazio, à espera da tira do corte). Antes de
  marcar como código morto, decidir: é a base natural de um scrub de verdade, ou some.
- `heat-shader.tsx` só monta se o clipe `lampada` sumir do manifesto. Está inativo, não
  inalcançável — a distinção importa para decidir se remove.

---

## 2. As cinco referências

### 2.0 Como foi medido, e o que a medição não vê

Playwright em Chromium sem cabeça, viewport 1440x900. Em cada site: sete paradas de
rolagem (0% a 100%, de sexto em sexto), 700ms de espera em cada uma para o movimento
assentar, e em cada parada uma captura de tela mais um levantamento do DOM — bibliotecas
presentes no `window`, todo elemento com `position: sticky` ou `fixed`, todo elemento com
`transform` diferente de `none` (com a `transition` computada junto), todo elemento com
`will-change`, e a contagem de uma lista de seletores que denunciam técnica
(`[class*="pin"]`, `[class*="parallax"]`, `canvas`, `path[stroke-dasharray]`). Fora do
laço, o cabeçalho foi medido no topo e de novo depois de 400px de rolagem, para separar
"encolhe" de "esconde".

Três limites, ditos antes dos resultados para que ninguém os leia como mais do que são:

1. **A lista de transformados satura em 60 por parada.** Onde aparece 60, o número não é
   uma contagem — é o teto. Serve como amostra do que se move, nunca como censo.
2. **Biblioteca empacotada como módulo não aparece no `window`.** Foi o caso de três dos
   cinco. "Nada detectado" quer dizer "nada global", não "nada usado".
3. **Sete paradas discretas não veem a curva entre elas.** Elas provam que um valor mudou
   com a rolagem; não provam com que interpolação. Onde abaixo se afirma taxa (meia, um
   terço), a afirmação vem da razão entre valores medidos na mesma parada, que é
   comparação legítima — não de inferir a curva.

### 2.1 gsap.com — o pin industrial, e um CSS deliberadamente mudo

GSAP 3.15.0 com **ScrollTrigger e ScrollSmoother** ativos; `SplitText` e `Draggable` não
carregados na home. 9.769px de rolagem. Cinco elementos com `pin` na classe.

O cabeçalho é o achado limpo: fixo, **127px no topo e 127px depois de rolar** — a altura
não muda —, e o que muda é `matrix(1, 0, 0, 1, 0, 0)` virando `matrix(1, 0, 0, 1, 0, -50)`.
Ele **se esconde 50px para cima, e não encolhe**. A distinção é a razão de o site não ter
reflow ao rolar: transladar não custa layout, mudar altura custa.

O vocabulário de transição CSS é de uma pobreza que é escolha, não descuido: **uma
duração** (0,15s, 42 ocorrências) e **uma curva** (`cubic-bezier(0.755, 0.05, 0.855, 0.06)`,
o easeInQuart, 28 ocorrências), e as duas servem só aos menus suspensos. Tudo que responde
à rolagem é GSAP; o CSS cuida de hover e mais nada. Zero erros de console.

### 2.2 inspira-ui.com — a única parallax em camadas do conjunto, e ela usa inteiros

Nada no `window` (Nuxt, tudo em módulo). 9.734px. Quatro `canvas`. Três elementos fixos.

O que esta referência tem e nenhuma outra tem: **três camadas de fundo transladando em y a
taxas travadas entre si.** Três `<div class="absolute top-0 left-0 h-[2000px] w-full">`
medidos na mesma parada de rolagem:

| Camada | y medido | Razão |
|---|---|---|
| 1 | -733,88 px | 733,88 ÷ 1 |
| 2 | -366,94 px | 733,88 ÷ 2 |
| 3 | -244,63 px | 733,88 ÷ 3 |

As taxas não foram sorteadas: são o mesmo deslocamento dividido por 1, 2 e 3. E as camadas
têm **2000px de altura declarada** num viewport de 900 — a folga que permite transladar
sem revelar borda. As duas coisas juntas são a receita inteira, e é uma receita que cabe
em transform puro.

Colateral: o site tem `animate-marquee` (uma esteira, como a nossa) e `animate-ripple-circle`
(círculos escalando 0,99 → 0,93 → …). A esteira deles não inverte com a direção da rolagem;
a nossa inverte.

### 2.3 lenis.dev — a referência mais próxima do que falta, e a lição de vocabulário

Lenis no `window`. **37.261px de rolagem** — quase quatro vezes o nosso site. **Dez
elementos fixos ou sticky ao mesmo tempo.** É a página que mais ensina, por duas razões
separadas.

**Primeira: é um catálogo do que "ligar transform ao progresso" significa na prática.**
Quatro elementos mudaram de transform ao longo da rolagem, e cada um é um padrão nomeável:

| Elemento | O que faz | Valores medidos |
|---|---|---|
| `scrollbar__inner` | barra de progresso da rolagem | scaleX 0 → 0,171 → 0,342 → … |
| `home__zoom` | zoom preso ao progresso, como corte de cena | scale 1 → 1,14 → 4 |
| `home__enter h3` | o texto cresce até engolir a tela | scale 0 → 0,47 → 10 |
| `home__first h2` | título subindo a taxa própria | y 0 → -11,99 → -254,13 |

E os sticky dizem o resto: `home__sticky h2` grudado a 297px do topo,
`horizontal-slides__inner` (uma seção que rola na horizontal), `feature-cards__sticky`.

**Segunda, e é a que muda o nosso plano: o vocabulário é quase de uma curva só.** Das
declarações de easing medidas nas transições, **421 são `cubic-bezier(0.19, 1, 0.22, 1)`**
e 12 são uma segunda curva (`cubic-bezier(0.455, 0.03, 0.515, 0.955)`, o easeInOutQuad).
As durações formam escada com razão visível: 0,075 / 0,15 / 0,225 são múltiplos de 0,075;
depois 0,4 / 0,45 / 0,6 / 1,2 / 1,5 / 1,85 / 2,05, com **0,6s dominando** (197 ocorrências).

`cubic-bezier(0.19, 1, 0.22, 1)` é a escrita em CSS do **easeOutExpo**. Guarde o nome: ele
volta em §3.

### 2.4 threejs.org — não contribui, e dizer isso é o resultado

**900px de altura de rolagem.** A home é um quadro estático com painel lateral de exemplos;
o movimento mora dentro de cada exemplo, atrás de um clique. Zero elementos com transform
mudando ao rolar, zero técnica de rolagem para auditar.

Isto está escrito com todas as letras porque o dono escolheu este site, e a tentação de
extrair uma lição de onde não há nenhuma é exatamente como um brief começa a mentir.
threejs.org é um **catálogo de exemplos**, e é provavelmente por isso que ele entrou na
lista — não pela coreografia da home. O que ele demonstraria já foi decidido e recusado
duas vezes por peso (D1, e `cerebro/DECISOES.md` de 2026-08-21).

### 2.5 animejs.com — uma seção pinada por assunto

21.142px. **Vinte e um elementos fixos simultâneos** e quarenta com `will-change`. O padrão
está escrito nos próprios nomes de classe: `feature-section-demo fixed-section
color-getting-started`, depois `color-animation`, `color-turquoise`, `color-utils`,
`color-svg`. **Uma seção pinada por recurso**, cada uma com a sua cor.

A captura confirma a leitura: a demonstração ocupa a tela e fica parada enquanto a coluna
de texto à esquerda passa por ela. Também: 39 `path[stroke-dasharray]` (desenho de linha
progressivo), seis `canvas`, três classes com `stagger`.

O custo do padrão está no primeiro número: 21.142px para cinco assuntos. Pinar cobra
altura, e cobra em milhares de pixels.

### 2.6 As três lições que sobrevivem à auditoria

**1. Coerência é ter MENOS curvas, não mais.** É o oposto do que o nosso §1.3 sugeria
consertar. lenis.dev move 421 coisas com uma curva; nós movemos 15 tweens com oito, quatro
delas herdadas por omissão. E o alvo já está dentro de casa: a curva que domina lenis.dev
é o easeOutExpo — que é **a mesma curva que o nosso Lenis já usa** (`tokens.ts`,
`LENIS.easing` é `1.001 - 2^(-10t)`, o easeOutExpo escrito em JavaScript), a mesma família
do `expo.out` que já carimba o título do hero e do `expo.inOut` que já sobe a cortina. Não
falta escolher uma curva. Falta parar de usar as outras sete onde elas não foram decididas.

**2. O que os quatro sites com rolagem fazem, e nós não, é ligar transform ao progresso —
e todos fazem isso só com `transform` e `opacity`.** Nenhum dos casos medidos toca em
altura, largura, `top` ou `margin`. É por isso que eles pinam sem reflow, e é a regra que
nos deixa fazer o mesmo sem reprovar na conferência de CLS. Não é "mais animação": é a
mesma quantidade de movimento, presa à rolagem em vez de disparada por ela.

**3. Pin é recurso de leitura, e o preço dele é altura.** animejs pina para a demonstração
ficar parada enquanto a explicação passa; lenis pina para trocar de cena. Os dois deram
altura de propósito, e por isso medem 21k e 37k px. O nosso site mede 8.390px e não tem
uma seção com altura fixa fora do hero. **Pinar aqui alonga a página** — é decisão de
produto, não ajuste de CSS.

---

## 3. O que entra, mapeado a elemento e justificativa

### 3.1 A regra de corte

Cada linha de 3.2 responde a "e se não tivesse?" com uma perda concreta para quem compra
salgado, não para quem admira site. O que não respondeu está em 3.3, e está lá com o motivo
— um brief que só lista o que entra esconde metade do trabalho.

Duas restrições valem para tudo o que segue, e vêm de §1.4: **só `transform` e `opacity`**
(a conferência de CLS é feita por máquina e o site está em zero), e **estado final correto
com `motionEnabled` falso** — não "sem animação", e sim a página inteira legível e no lugar.

### 3.2 O que entra

| # | Elemento | O que faz | A perda se não tivesse | Custo |
|---|---|---|---|---|
| **M1** | Barra de progresso no `navbar.tsx` (já é fixo) | `scaleX` de 0 a 1 preso ao progresso do documento, `transform-origin: left` | O site é um cardápio único de 8.390px, sem paginação e sem índice. Quem rola não tem como saber se falta um terço ou se acabou. É a única peça desta lista que responde a uma pergunta que o cliente faz de verdade — "isso ainda vai longe?" | 0 KB. Um ScrollTrigger com `scrub`. Fixo, fora do fluxo: CLS impossível |
| **M2** | Camada 1 do hero (o gradiente que embrulha o `CinemaLoop`), `hero-section.tsx:80` | `y` a **meia taxa** da rolagem, com folga de escala para não revelar borda | O hero é a única tela com mídia sangrando, e hoje ela sai de cena rígida, como um cartaz sendo puxado. Meia taxa dá profundidade sem que o olho persiga o movimento em vez de ler o título | 0 KB. Transform puro dentro de um container que já é `overflow-hidden` |
| **M3** | Unificação de curva: `EASE.entrada`, `EASE.acompanhamento` e `EASE.estado` convergem para `expo.out` | Troca de curva, nenhuma troca de duração | Hoje metade da linguagem de movimento do site foi herdada, não decidida (§1.3). lenis.dev prova que coerência vem de reduzir. E a curva alvo já é a do nosso próprio Lenis e do nosso próprio título — o site já fala essa língua em três lugares e outra língua nos outros doze | 0 KB. Muda uma linha por token em `tokens.ts` |

**M1 e M2 são a "camada de scrub" do passo 4 do `RETOMAR.md`.** Elas são pequenas de
propósito: `scrub` e `pin` não existem hoje em uma linha sequer do código, e a primeira
rodada de uma técnica nova deve ser a que se consegue conferir inteira.

Duas notas de implementação que a auditoria produziu e que não podem se perder:

- **M2 esbarra no LCP.** O pôster do hero **é** o elemento de LCP (decisão de 2026-08-22).
  `will-change: transform` nele antecipa composição e pode mexer na métrica, que tem
  orçamento conferido por máquina. A implementação mede LCP antes e depois, e não liga
  `will-change` antes do primeiro quadro pintado.
- **M2 precisa de folga, ou revela vazio.** Transladar a camada 1 dentro de `min-h-[100svh]`
  mostra a borda de baixo. inspira-ui resolve com 2000px de altura num viewport de 900
  (§2.2); aqui o equivalente é escala de folga na camada, calculada a partir do deslocamento
  máximo — não um `1.15` chutado.

### 3.3 O que fica de fora, e por quê

| Recusado | Vem de | Por que não |
|---|---|---|
| `scrub` na revelação de texto de leitura | o instinto óbvio depois de §2.3 | Texto preso ao progresso fica **meio opaco quando a rolagem para no meio**. Nas referências, o que é scrubado é tipografia de display gigante (lenis) ou demonstração (animejs) — **nunca parágrafo**. O nosso `use-reveal` cobre 11 lugares, quase todos texto para ler. Fica disparado, como está |
| Deriva horizontal na `StatementSection` | lenis.dev, §2.3 | **Já foi tentado e revertido**, com o motivo escrito em `statement-section.tsx:14-33`: a frase saía com 2696px numa tela de 1440 e ficava cortada dos dois lados em qualquer momento da travessia. Reabrir isso é refazer um beco |
| Rolagem horizontal em uma seção | `horizontal-slides__inner`, §2.3 | Cobra altura em milhares de pixels (§2.6, lição 3) e o site é um cardápio, não uma apresentação. O custo cai sobre o cliente que só quer ver o preço do cento |
| Zoom de cena (scale 1 → 4) | `home__zoom`, §2.3 | Serve para trocar de cena numa página que tem cenas. A nossa tem seções de catálogo, e uma delas engolir a tela atrapalha quem está comparando dois pacotes |
| Desenho de linha em SVG | 39 paths em animejs, §2.5 | Não há SVG de linha no site. Entraria como enfeite atrás de um elemento inventado para justificá-lo — que é exatamente a inversão que este documento existe para impedir |
| Qualquer coisa de three.js | threejs.org, §2.4 | D1, e duas rejeições anteriores com número medido: 1594 KB para desenhar um quad, contra 103 KB de orçamento inteiro |

### 3.4 A decisão que é do dono, não minha

**A seção pinada (o padrão de animejs, §2.5) não entra nem sai por decisão técnica — ela
alonga a página, e isso é produto.**

Se o `festa` ou o `congelados` for pinado para que a foto do produto fique parada enquanto
a lista de sabores passa, a página cresce de 8.390px para algo entre 11k e 13k. Para quem
está decidindo entre o cento de 25 e o de 50, mais rolagem entre ele e o preço é custo.
Para quem chegou pelo Instagram e está passeando, é o que faz o produto parecer cuidado.

Não dá para decidir isso a partir do código, e nenhuma das cinco referências responde: as
cinco vendem biblioteca para quem programa, e nenhuma vende comida para quem tem festa no
sábado. Vai para `cerebro/TRAVADO.md`.
