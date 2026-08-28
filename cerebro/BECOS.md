# Becos sem saída

O que já foi tentado neste projeto e **não** deu certo, com o número que provou.

Um beco anotado vale mais que uma vitória anotada. A vitória está no código, visível
para quem for ler. O beco não está em lugar nenhum: some junto com a sessão, e a
próxima pessoa que tiver a mesma ideia razoável vai gastar as mesmas horas para chegar
no mesmo muro.

Todo item precisa de data e do que foi medido. "Não funcionou" sem número não é um
beco anotado, é uma opinião.

---

## Vídeo e imagem

**2026-08-25 — Correção automática de branco em foto de fritura.**
O script sabe fazer, e ficou desligada nas três fotos publicadas. A regra do "mundo
cinza" assume que a cena é neutra; uma bandeja de salgado frito não é. A correção
deixou as coxinhas pálidas e puxou o fundo escuro para o azul. O dourado daquelas
fotos é o produto, não um defeito da lâmpada.

**2026-08-25 — Uma largura só de imagem, via `next/image`.**
Com `images.unoptimized`, que é o modo obrigatório do export estático, o `next/image`
não gera `srcset`: emite uma origem só, a grande, e o celular baixa o arquivo de
desktop inteiro. **116 KB contra 58 KB** na foto do box. A tag escrita à mão com duas
larguras resolveu.

**2026-08-22 — Prompt de vídeo sem descrever o formato do salgado.**
A primeira geração da coxinha saiu oval, como uma bola. O prompt dizia "coxinha" e o
modelo não sabe o que é pelo nome. Custou uma geração inteira. Hoje o prompt descreve
a silhueta: barriga larga arredondada embaixo afinando para uma ponta, mais os
negativos `Not oval. Not round. Not a ball.`

**2026-08-22 — Prompt de vídeo sem proibir fogo.**
A segunda geração veio com chamas. Localizado medindo o brilho quadro a quadro: subiu
de 96 para 166 entre 4,21s e 5,2s. Cortado em 4,15s, e o prompt ganhou
`No fire. No flames. Steam only, never fire.` Custou outra geração.

**2026-08-22 — `xfade` depois de `trim` + `setpts`.**
Falha com "current rate of 1/0 is invalid". O `trim` destrói a taxa de quadros
constante que o `xfade` exige. Conserto: `fps=24` de novo em cada ramo, depois do
`setpts`.

**2026-08-22 — Costurar o laço do vídeo sem mexer no pôster.**
O `--laco` faz o vídeo começar no segundo D−X, mas o pôster continuava saindo do
segundo 0 do arquivo. A página mostrava uma cena e o vídeo entrava noutra:
**pico de 173 em 255** de diferença. O pôster passou a sair da mesma cadeia de filtro.

**2026-08-22 — Emenda de laço sem fundido.**
YAVG 6,86 e pico 176 em 255 no ponto da emenda: um solavanco visível a cada volta,
para sempre, no topo da página. Com a costura: YAVG 1,4 e pico 83, que é ruído de
compressão.

**2026-08-21 — `mix-blend-screen` para dissolver o preto do clipe do corte.**
Funciona quando o fundo do clipe é preto puro. A cena tem mesa de ardósia e luz de
ambiente, então o blend acendia a mesa numa faixa clara atravessando o quadro. A peça
virou uma fotografia emoldurada, com a mesma borda de uma linha dos cards.

---

## Layout e CSS

**2026-08-23 — `leading-[1.02]` do Tailwind no lema.**
Não aplicou. Utilitário do Tailwind vive em `@layer utilities` e **perde** para CSS
sem camada, e `.type-display` é sem camada. Tentativa seguinte, `style` em linha,
também falhou: o GSAP sobrescreve o atributo `style` durante a revelação. Conserto:
uma classe de verdade no `globals.css`, `.type-display-duas-linhas`.

**2026-08-25 — Trilho vertical desenhado com `position: absolute`.**
Exigia altura calculada à mão, e essa conta passa a mentir no dia em que um passo
virar duas linhas. Virou `border-l` na própria `<ol>`, que começa e termina onde a
lista começa e termina. Precisou de `self-start`: sem isso a lista estica até a altura
da linha da grade e a borda desce duzentos pixels abaixo do último passo.

**2026-08-25 — Prazo e área de entrega com o mesmo peso visual.**
Os dois saíram em âmbar e na mesma escala, lado a lado. Nenhum dos dois lia como o
principal. A área é informação de conferência ("serve pra mim?"), o prazo é o
argumento de venda. Ficou um alto e um baixo.

---

## Ferramental e conferências

**2026-08-25 — Empacotar o site inteiro num arquivo HTML só, para o dono ver.**
O layout saiu exato (7644px), mas a hidratação nunca completava: os pedaços do
Turbopack leem `document.currentScript.getAttribute("src")`, que é nulo quando o
script está embutido. Um arquivo que parece o site e não funciona como o site engana
mais do que ajuda. Abandonado; viraram gravações do Playwright.

**2026-08-23 — Conferência da esteira que só checava se ela se mexia.**
Exigia "andou mais de 5px em 1,5s". Passava folgado com 502 px/s, que é ilegível.
Medir que a coisa se move não é medir se ela está no passo certo. Hoje mede px/s nas
duas larguras e cobra a faixa de 40 a 110.

**2026-08-25 — Conferência de export que lia `src`, `href` e `content`.**
Não lia `srcset`. A variante estreita da foto podia sair sem prefixo, ou nem existir
no export, e o 404 apareceria só em tela pequena — que é onde ninguém confere e onde
estão quase todos os clientes.

**2026-08-25 — Conferência de foto que engolia a própria reprovação.**
Ao apagar o arquivo estreito de propósito para testar, ela passou em silêncio: o
resumo lia o arquivo, o erro derrubava a conferência inteira, e a reprovação que ela
tinha acabado de registrar sumia junto. **Uma conferência que morre parece uma
conferência que não achou nada.**

**2026-08-25 — Esperar o `audit` num PR só de documentação.**
O `design-review.yml` tem filtro de caminhos e não roda em `docs/`, `README` nem
`CLAUDE.md`. Não existe verde para esperar, e a regra escrita mandava esperar. Uma
sessão seguindo a regra ao pé da letra ficaria parada para sempre.

**2026-08-28 — `trigger: document.documentElement` para a barra de progresso da página.**
É o que a intuição pede para "a página inteira", e a barra ficou parada em zero com o
GSAP escrevendo `scale(0, 1)` a cada quadro: viva, atualizando, sempre no mesmo valor.
Medido: `<html>` tem `scrollHeight` **8390** mas `getBoundingClientRect().height` e
`offsetHeight` de **900** — quem rola é o `<body>` (8389,7px). O ScrollTrigger posiciona
por rect, então `start: "top top"` e `end: "bottom bottom"` caíram os dois no scroll 0:
intervalo de comprimento zero, progresso sem para onde andar. `trigger: document.body`
funcionaria e continuaria errado de origem — mede geometria de elemento para responder
uma pergunta que não é sobre elemento nenhum. Conserto: intervalo numérico, `start: 0` e
`end: () => ScrollTrigger.maxScroll(window)`.

**2026-08-28 — As oito suítes passando por cima de uma peça de movimento morta.**
O beco acima passou inteiro pelas oito conferências. `scrub` falha CALADO: o elemento
continua no DOM, com o tamanho certo, sem erro no console, sem estouro horizontal, sem
mexer no contraste, no LCP nem no CLS. Só para de responder à rolagem. Quem achou foi um
olho medindo a página rolada, e um olho não roda no CI. Virou a nona suíte,
`scripts/checks/scrub.mjs`, que mede VALOR (a `scaleX` da barra contra o progresso real
do documento) e não movimento — porque "andou" também passaria numa barra que anda errado.

**2026-08-28 — `pkill -f "next/dist/bin/next start"` nesta máquina.**
É no-op no Windows. O rebuild subiu com a porta 3000 ainda presa (`EADDRINUSE`), o
servidor velho continuou servindo pedaços de outro build, e a página inteira mediu como
morta (`barra=null`, `transladou=0`). Quase virou "regressão". Nesta máquina o encerramento
é `Get-NetTCPConnection -LocalPort 3000 -State Listen | ... Stop-Process -Force`.

---

## Método

**Toda conferência nova deste projeto foi quebrada de propósito antes de ser
confiada, e várias reprovaram nesse teste.** A de contraste pintado tinha dois
defeitos próprios, a da esteira era fraca, a de foto engolia o próprio erro. Teste que
nunca falhou não prova nada: ele é indistinguível de um teste que não testa.

A de `scrub` (2026-08-28) manteve a série: quebrada de propósito com as tolerâncias
invertidas, apareceu um defeito dela mesma. Uma reprovação no celular fazia o desktop
pular a medição inteira, porque a guarda de "elemento não encontrado" olhava o contador
global de falhas em vez de um sinal da própria tela. O relatório sairia falando de uma
tela só, escondendo se o defeito era das duas ou de uma.
