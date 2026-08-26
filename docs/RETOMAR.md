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

Elevar a **coreografia de movimento** do site da Don Enrico. O diagnóstico do dono está
correto e foi confirmado por medição: o site tem **uma única animação**
(`opacity 0→1, y 24→0, 0.8s, power3.out`) repetida em 11 lugares, **zero animação com
scrub**, nenhum parallax, nenhum pin, nenhuma timeline ligada ao progresso do scroll.
O Lenis está instalado e só está pagando pelo feel da roda do mouse.

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

## Em andamento

- [ ] Auditoria dos 5 sites de referência e brief de movimento.

## Próximos passos, em ordem

1. **Rodar `npm run check` inteiro** e registrar o baseline antes de mexer em movimento.
2. **Auditar os 5 sites de referência** e escrever `docs/BRIEF-MOVIMENTO.md`: cada animação
   mapeada a um elemento do site e a uma justificativa. Nada entra por ser bonito.
3. **Sistema de tokens de movimento.** Hoje as durações estão soltas: 150, 200, 250, 300,
   400, 420, 500, 620, 700, 800, 900, 1000ms, com seis eases diferentes e nenhum nome.
4. **Camada de scrub**: parallax, pin, timeline ligada ao progresso. É o que falta de fato.
5. Corrigir os bugs menores levantados na auditoria (ver "Dívida conhecida").
6. Só depois do site: Apps Script pronto para o Hermes, e a apresentação da proposta.

## Dívida conhecida (auditada, não corrigida ainda)

- `intro-curtain.tsx` chama `curtain.remove()` num nó que o React ainda possui → `NotFoundError`
  se o usuário ligar reduced-motion depois que a cortina saiu.
- **Código morto:** `heat-shader.tsx` (~260 linhas) é inalcançável — `hero-section.tsx` só o
  renderiza se não houver clipe, e `lampada` está sempre no manifesto. `sequencia.tsx` +
  `sequencias.ts` nunca são importados. `src/lib/pix/br-code.ts` (completo e testado) não
  tem nenhum consumidor de UI. `class-variance-authority` é dependência com zero uso.
- Âncoras (`href="#festa"`) fazem salto nativo enquanto o Lenis interpola — o Lenis foi
  criado sem a opção `anchors`.
- `marquee.tsx` mede `scrollWidth` antes de a fonte assentar (o corpo usa `display: optional`),
  então a emenda do laço pode sair errada no primeiro carregamento.
- Orçamento de LCP em `scripts/checks/performance.mjs` é `4000ms`, e o comentário ao lado
  diz que acima de 2500ms o Google considera ruim. O orçamento está 60% acima do limiar
  que ele mesmo cita.
- String de botão outline duplicada verbatim 3x; botão âmbar em 4 alturas diferentes
  (3.5 / 3.75 / 3.25 / 3rem). Não existe componente `Button`.
- `docs/INSTAGRAM.md` §3 documenta a paleta CLARA antiga (`#FDF7EF`), que contradiz a
  decisão travada de 2026-08-21. É o único doc visual não reconciliado.

## O que só o dono pode destravar

Além dos 11 itens de `cerebro/TRAVADO.md`, esta rodada acrescentou:

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
