# RETOMAR — estado de execução

> Leia este arquivo PRIMEIRO ao retomar. Ele existe para que uma sessão nova entre no
> talo sem refazer descoberta. Atualize-o a cada passo concluído, no mesmo commit.
>
> Depois deste, leia `cerebro/LEIA-PRIMEIRO.md` — ele manda no projeto; este arquivo
> só diz onde a execução parou.

## Onde estamos

**Branch de trabalho:** `feat/site-premium`, criada a partir de `origin/main` (`a1c4031`).

**Por que essa branch existe:** o working tree estava em `claude/client-dev-skills-setup-qpu4yi`,
uma branch **órfã** (sem ancestral comum com `main`) que continha só o stack de design e
**zero arquivos únicos** — tudo nela já existia em `main`. O site real (67 commits) está em
`main`. A migração não perdeu nada. As 12 imagens de `img/` que estavam staged vieram junto.

## Objetivo desta rodada

Elevar a **coreografia de movimento** do site da Don Enrico.

**O diagnóstico foi refeito linha a linha em 2026-08-27, e a versão anterior dele estava
errada.** Estava escrito aqui que o site tinha "uma única animação repetida em 11 lugares".
Isso descreve uma camada, não o site: são **15 tweens GSAP distintos** em seis famílias
(revelação por scroll, título cinético por caractere, botão magnético, anel de cursor,
cortina de entrada, esteira de sabores que inverte com a direção do scroll). O site não é
pobre de movimento — ele é **incoerente**: cada peça foi decidida sozinha, com o próprio
número, e nenhuma conversa com a rolagem.

O que se confirmou, e é o buraco real: **`scrub` não aparece uma vez no código, e `pin`
também não.** Os três arquivos que tocam `ScrollTrigger` usam-no só como detector de
entrada em viewport. O Lenis está pagando só pelo toque da roda do mouse. E nada disso tem
nome: 14 durações distintas e 8 curvas de easing, sendo que **4 curvas foram herdadas por
omissão** (tween sem `ease` cai no default do GSAP) e as 26 transições CSS usam a curva do
Tailwind porque ninguém declarou nada.

O inventário completo, com arquivo:linha, está em [`docs/BRIEF-MOVIMENTO.md`](BRIEF-MOVIMENTO.md) §1.

Escopo: **apenas Don Enrico**. A gráfica fica para depois.

## Decisões desta rodada (tomadas por Claude, marcadas para revisão do dono)

| # | Decisão | Por quê | Como corrigir se errado |
|---|---|---|---|
| D1 | **Não adicionar three.js**, apesar de o dono ter pedido | `cerebro/DECISOES.md` (2026-08-21) já rejeitou three.js com número medido: three.js + R3F para desenhar um quad = **1594 KB**; WebGL puro = mesmos pixels, total **223 KB**. O orçamento é 320 KB. Entraria estourando 5x, e o pedido do dono é "não ter cara de IA" — que é o mesmo motivo da rejeição original. | O dono reafirmar. Aí entra, e o orçamento de `scripts/checks/performance.mjs` sobe junto, conscientemente. |
| D2 | Referências visuais = os 5 sites das próprias bibliotecas | Confirmado pelo dono: gsap.com, inspira-ui.com, lenis.dev, threejs.org, animejs.com. | — |
| D3 | AbacatePay atrás de interface trocável | Escolha do dono. Gateway ainda não decidido. | — |
| D4 | Banco: Neon (Postgres) para teste/validação | Escolha do dono. Supabase MCP não conecta nesta máquina. Neon é Postgres puro, então o schema migra sem reescrita. | — |

## Feito

- [x] Branch `feat/site-premium` criada a partir de `origin/main`.
- [x] **Bug de perda de venda corrigido** em `src/components/cart/cart-drawer.tsx`.
      O código do pedido era sorteado por `useState(gerarCodigoPedido)`, cujo inicializador
      roda uma vez por MONTAGEM — e o `CartDrawer` é renderizado pelo `SiteShell` o tempo
      todo (fechado devolve `null`, mas nunca desmonta). Resultado: um código por
      carregamento de página. Quem mandava um pedido, adicionava mais itens e mandava de
      novo reenviava o mesmo código, e o `WebApp.gs` descartava o segundo pedido como
      clique repetido (`repetido: true`), sem gravar. O sorteio agora acontece na
      transição para aberto, durante a renderização (não em efeito), porque o código
      precisa estar certo no primeiro quadro pintado — ele vai dentro do href do WhatsApp.

- [x] **A suíte de verificação estava inteiramente morta no Windows.** Duas falhas de
      portabilidade, ambas invisíveis no CI porque ele roda em `ubuntu-latest`:
      1. `scripts/check-site.mjs` chamava `spawn("npm", ["run", "dev"])`. No Windows o npm
         é `npm.cmd` e o `spawn` do Node só resolve o `PATHEXT` com `shell: true` — dava
         `ENOENT` e **nenhuma das 8 suítes chegava a rodar**. Passou a chamar o binário
         local do Next pelo Node (`process.execPath` + `node_modules/next/dist/bin/next`).
         `shell: true` não serviria: o cmd.exe entraria como intermediário e matar o shell
         deixaria o next-server vivo segurando a porta. Chamando direto, ele é filho de
         primeiro grau e o `proc.kill()` alcança.
      2. `scripts/checks/midia.mjs` fazia `import()` de caminho absoluto. O carregador de
         módulos lê `c:\...` como esquema de URL e recusa. Passou a usar `pathToFileURL`,
         que é o mesmo padrão que `scripts/design-audit.mjs` já usava.
      Varredura feita no resto de `scripts/` — não há mais nenhum caso do mesmo tipo.
- [x] `npm install` na branch nova (`node_modules` é gitignored e não veio junto).
- [x] **Crash latente do `IntroCurtain` corrigido.** O `onComplete` da timeline chamava
      `curtain.remove()`, desanexando um nó que o React ainda considerava seu. Como
      `motionEnabled` é reativo (o `MotionProvider` assina `prefers-reduced-motion` ao
      vivo), quem ligasse "reduzir movimento" depois da cortina ter saído fazia o
      componente renderizar `null` e o React tentar remover um filho que já não estava
      lá — `NotFoundError: Failed to execute 'removeChild'`. A saída passou a ser uma
      renderização normal, via estado, então a árvore do React nunca discorda do DOM.

## Baseline medido (servidor de desenvolvimento, após as correções)

| Suíte | Resultado |
|---|---|
| Responsividade e console | 375/768/1024/1440 sem estouro horizontal, console limpo |
| Fluxo do pedido | passa — código sorteado, sem preço no envio, pedido misto confere |
| Contraste WCAG AA | 0 reprovações |
| Contraste sobre vídeo | 12 textos medidos no pixel, celular e desktop |
| Acessibilidade e teclado | 87 paradas, sem laço, todas visíveis com anel de 3px |
| Performance | LCP 1672ms (orçamento 4000), CLS 0 (orçamento 0.1) |
| Site sem JavaScript | 8390px, preços e WhatsApp presentes, 0 elemento invisível |
| Clipes de vídeo | 867 KB de 2048; fotos 591 KB de 700 |

## Orçamento real, medido contra produção

O número de JavaScript do servidor de desenvolvimento (899 KB) não vale nada — ele serve
módulos sem empacotar. Medido de verdade, com `npm run build` seguido de
`node node_modules/next/dist/bin/next start` e a suíte apontada para `http://localhost:3000`:

| Métrica | Medido | Orçamento | Folga |
|---|---|---|---|
| JavaScript transferido | **217 KB** | 320 KB | **103 KB** |
| LCP (CPU 4x lenta, 4G) | 1640 ms | 4000 ms | — |
| CLS | 0 | 0.1 | — |
| Mídia (clipes) | 867 KB | 2048 KB | 1181 KB |
| Fotos | 591 KB | 700 KB | 109 KB |

**103 KB é o teto de tudo que a camada de movimento pode custar.** GSAP e Lenis já estão
dentro dos 217 KB, então usar mais recursos deles custa quase zero — é onde está o ganho
barato. Qualquer biblioteca nova precisa justificar cada KB contra esse número.

Para referência do que já foi rejeitado por peso: three.js + R3F para desenhar um único
quad custava 1594 KB. Não cabe, e não é perto de caber.

Todas as 8 verificações passam contra produção, não só contra desenvolvimento.

## A rodada de movimento, até aqui

Preparação e diagnóstico fechados. O que falta é escrever movimento novo — nenhuma linha
de `scrub` foi escrita ainda.

- [x] **Baseline reconferido nesta árvore (2026-08-27):** as 8 verificações passam.
      LCP 2692ms de 4000, CLS 0, 87 paradas de teclado sem laço, esteira a 70 px/s.
      (O número de JS do servidor de desenvolvimento, 899 KB, não vale — o real é 217 KB,
      medido contra `build` + `start`.)
- [x] **Inventário de movimento completo**, com arquivo:linha → `docs/BRIEF-MOVIMENTO.md` §1.
- [x] **Sistema de tokens de movimento** (`src/lib/motion/tokens.ts` + o bloco de
      `globals.css`), com as 14 durações e 8 curvas migradas para dois arquivos com nome, em
      três camadas (primitivo → semântico → componente). **Nenhum milissegundo mudou** — a
      migração só tirou os números de dentro dos componentes e transformou as quatro curvas
      herdadas por omissão em curvas declaradas. Conferido por `npm run check:movimento`,
      que compara `tokens.ts` contra o levantamento congelado de antes da migração e reprova
      se um tempo mudar sem que alguém atualize os dois lados de propósito. Verde: 34 tokens
      batem, 26 de 26 transições CSS declaram duração e curva, nenhum tempo solto no código.
- [x] **Auditoria dos 5 sites de referência** → `docs/BRIEF-MOVIMENTO.md` §2. Playwright,
      1440x900, 7 paradas de rolagem por site, com captura e levantamento de DOM em cada.
      Os três achados que mudaram o plano estão em §2.6; o maior é que **coerência é ter
      menos curvas, não mais** — lenis.dev move 421 elementos com uma curva só, e essa curva
      (easeOutExpo) já é a que o nosso Lenis e o nosso título do hero usam.
- [x] **§3 fechada**: três peças entram (M1 barra de progresso, M2 profundidade no hero,
      M3 unificação de curva), seis recusadas com o motivo escrito, e uma mandada para o
      `TRAVADO.md` porque é decisão de produto e não técnica.

## Próximos passos, em ordem

1. ~~Rodar `npm run check` inteiro e registrar o baseline.~~ Feito, verde.
2. ~~Auditar os 5 sites de referência e fechar §2 e §3.~~ Feito.
3. ~~Sistema de tokens de movimento.~~ Feito, conferido por `check:movimento`.
4. **Implementar M1 e M2** (`docs/BRIEF-MOVIMENTO.md` §3.2) — é a primeira vez que `scrub`
   entra no código; hoje ele não aparece em uma linha sequer. Pequenas de propósito.
   As duas armadilhas já levantadas, para não redescobrir: **o pôster do hero é o elemento
   de LCP**, então M2 mede LCP antes e depois e não liga `will-change` antes do primeiro
   quadro; e transladar a camada do hero revela a borda de baixo, então a folga de escala
   se calcula a partir do deslocamento máximo, não se chuta.
5. **M3, a unificação de curva** — é a única das três que muda comportamento, então ela
   também muda o levantamento congelado de `check-movimento.mjs`, e essa mudança nos dois
   lados é o que registra a decisão no diff.
6. Corrigir os bugs menores levantados na auditoria (ver "Dívida conhecida").
7. Só depois do site: Apps Script pronto para o Hermes, e a apresentação da proposta.

## Dívida conhecida (auditada, não corrigida ainda)

- **Âncoras vs. Lenis — cuidado, tem armadilha.** O Lenis é criado sem a opção `anchors`,
  então clicar num link de seção faz salto nativo enquanto o Lenis interpola. A correção
  óbvia (`anchors: true`) **quebraria a acessibilidade**: o Lenis dá `preventDefault` no
  clique, e o link "Pular para o conteúdo" (`href="#conteudo"`, `site-shell.tsx:25`)
  depende do comportamento nativo para **mover o foco**, não só para rolar. A suíte
  `checks/a11y.mjs` verifica exatamente isso — que o primeiro Tab cai no skip link e que
  ele funciona. Âncoras existentes: `#conteudo` (skip link, precisa de foco), `#festa`
  (`hero-section.tsx:191` e `cart-drawer.tsx:96`) e `#` (logo, `navbar.tsx:44`).
  A correção certa roteia só as âncoras de seção pelo `lenis.scrollTo`, exclui o skip link,
  e move o foco no fim da rolagem. Fica para a rodada de movimento, não antes.
- **Código morto, com as distinções que importam:**
  - `class-variance-authority` — dependência com zero uso. Morta de verdade.
  - **`@gsap/react` (`useGSAP`) — segunda dependência morta**, achada em 2026-08-27: está no
    `package.json` (`^2.1.2`) e não é importada em nenhum arquivo de `src/`. Todo o código
    usa `useEffect` + `gsap.context()` ou limpeza manual. Ou a camada de movimento nova
    adota o `useGSAP` (que resolve limpeza sozinho), ou a dependência sai. Ficar como está,
    não.
  - `heat-shader.tsx` (~260 linhas) está **inativo, não inalcançável**: `hero-section.tsx:94`
    só o monta se não houver clipe, e `lampada` está no manifesto hoje. É o plano B do fundo
    do hero. Remover é decisão de produto, não faxina.
  - `sequencia.tsx` + `sequencias.ts` nunca são importados, mas `sequencias.ts:45` é um array
    vazio **de propósito** ("a tira do corte ainda não chegou em arquivo"). É a única
    infraestrutura de scrub por quadros que já existe pronta — decidir na rodada de
    movimento se ela vira a base do scrub ou some. Não apagar antes disso.
  - `src/lib/pix/br-code.ts` (completo e testado) não tem consumidor de UI — está esperando
    os dados do Pix, que estão no `TRAVADO.md`. Não é morto, é bloqueado.
- `SplitText` é registrado dinamicamente (`use-split-text.ts:47`) e sustenta o título do
  hero. Vale declarar a dependência explicitamente antes de apoiar mais coisa nele.
- Âncoras (`href="#festa"`) fazem salto nativo enquanto o Lenis interpola — o Lenis foi
  criado sem a opção `anchors`.
- `marquee.tsx` mede `scrollWidth` antes de a fonte assentar (o corpo usa `display: optional`),
  então a emenda do laço pode sair errada no primeiro carregamento.
- Orçamento de LCP em `scripts/checks/performance.mjs` é `4000ms`, e o comentário ao lado
  diz que acima de 2500ms o Google considera ruim. O orçamento está 60% acima do limiar
  que ele mesmo cita.
- String de botão outline duplicada verbatim 3x; botão âmbar em 4 alturas diferentes
  (3.5 / 3.75 / 3.25 / 3rem). Não existe componente `Button`.
- ~~`docs/INSTAGRAM.md` §3 documenta a paleta CLARA antiga (`#FDF7EF`).~~ **Corrigido em
  2026-08-27:** §3 agora traz os valores reais do `globals.css` e explica por que o fundo
  escuro é decisão e não descuido (escuro *frio e chapado* é que estraga fritura; o âmbar
  não passava de 3:1 na paleta clara e é 9,55:1 nesta).

## O que só o dono pode destravar

Além dos 13 itens de `cerebro/TRAVADO.md` — um deles acrescentado por esta rodada: **se
uma seção pode ficar parada enquanto o resto rola**, o que deixa a página entre 3k e 5k px
mais longa e é decisão de produto, não técnica —, esta rodada acrescentou:

- **`DATABASE_URL` do Neon** — criar em neon.tech ou Vercel > Storage. Depois disso não é
  preciso MCP nenhum: migrations rodam com SQL puro.
- **Vercel está no plano Hobby, que proíbe uso comercial.** O site é de cliente pagante.
  Exige Pro (~US$ 20/mês). Custo recorrente que hoje não está na conta dos R$ 2.000 com
  manutenção inclusa.

## Sobre retomar automaticamente quando o limite de token voltar

Peça do dono: *"no segundo que voltar, resetar a minha janela de token. Já volte no talo."*

**O que não dá:** quando o limite estoura, a sessão para de executar. Não existe processo
meu rodando para acordar sozinho — um agendamento feito de dentro morre junto com a sessão.
Prometer isso seria mentira. Nesta mesma sessão o limite já estourou uma vez e matou duas
transcrições que rodavam em segundo plano.

**O que dá, e é o que este arquivo resolve:** o custo real de um limite estourado não é o
tempo parado, é a redescoberta. Com este arquivo atualizado, a sessão nova lê e continua —
sem reexplorar o repositório, sem refazer decisão, sem repetir beco.

**Como retomar, na prática:** abra uma sessão nova no diretório do projeto e diga
*"leia docs/RETOMAR.md e continue"*.
