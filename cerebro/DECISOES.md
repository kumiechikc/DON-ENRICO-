# Decisões, e o que foi descartado junto

Cada entrada tem quatro partes, e a terceira é a que justifica o arquivo existir:
**o que foi decidido**, **por quê**, **o que foi descartado e por quê**, e **o que
faria revisitar**.

"Escolhemos X" não ajuda ninguém: daqui a seis meses alguém olha X, acha estranho, e
troca por Y sem saber que Y já foi olhado e recusado. O `git log` guarda o que mudou;
não guarda o que foi rejeitado.

Entrada nova vai no topo. Toda entrada precisa de data.

---

## 2026-08-25 — Merge sem pedir confirmação, com o CI como única barreira

**Decidido.** Terminada uma rodada: commit, PR em rascunho, espera o `audit`, tira o
rascunho e mergeia. Sem perguntar ao dono.

**Por quê.** O dono pediu. O gargalo era ele abrir o GitHub e clicar, e o trabalho
ficava pronto e parado.

**Descartado: o auto-merge do próprio GitHub.** Seria melhor, porque não depende de
uma sessão estar acordada. Mas exige "Allow auto-merge" ligado nas configurações do
repositório e uma regra de proteção no `main` para ter o que esperar. As duas coisas
são do dono, e não estavam ligadas.

**Descartado: mergear sem conferência.** O `audit` continua sendo barreira absoluta.
Duas exceções ficaram escritas no `CLAUDE.md`: mudança que depende de dado de negócio
não confirmado fica no PR aberto, e mudança no que o site promete vai com aviso.

**Revisitar se.** O dono ligar o auto-merge do GitHub, ou pedir para voltar a aprovar
manualmente.

---

## 2026-08-25 — Foto de produto não passa por IA generativa

**Decidido.** O tratamento de foto (`scripts/tratar-foto.mjs`) só mexe nos pixels que
já existem: recorte, cor, ruído, redução, foco. Nada de gerar pixel novo.

**Por quê.** Um modelo que redesenha a coxinha entrega uma coxinha que não é a da
casa. Quem pediu confiando na foto recebe outra coisa, e isso tem nome: propaganda
enganosa.

**Descartado: upscaler generativo**, que era o que o dono tinha sugerido, por achar as
fotos ruins. Ele estava certo sobre a qualidade e o caminho continua sendo pedir o
arquivo original: as cinco fotos chegaram com cerca de um décimo dos bytes por pixel
que uma câmera de celular grava, porque passaram pelo WhatsApp.

**Descartado: a correção de branco automática**, que o script sabe fazer e ficou
desligada. A regra do "mundo cinza" assume cena neutra; bandeja de fritura não é. A
correção roubou o dourado junto com o defeito, e o dourado ali é o produto.

**Revisitar se.** Chegarem os arquivos originais, sem o WhatsApp no meio.

---

## 2026-08-24 — Área de atendimento entra como região, não como lista de cidades

**Decidido.** O site diz "Viamão e toda a região metropolitana de Porto Alegre".

**Por quê.** É verdade inteira e cobre tudo que o dono descreveu.

**Descartado: a lista nominal de cidades.** O dono citou nomes num áudio, e a
transcrição saiu ambígua. Nome de cidade é dado de negócio: declarar uma cidade que a
empresa não atende faz o Google mostrar o negócio para quem ele não pode servir, o
telefone tocar à toa, e o cliente ficar bravo. Errar para menos custa menos que errar
para mais.

**Revisitar se.** O dono mandar a lista por escrito. Aí a frase vira a lista, no site
e no `areaServed` do JSON-LD.

---

## 2026-08-24 — Escala tipográfica grande é para número que informa

**Decidido.** Os numerais `01 / 02 / 03` em contorno saíram do "Como encomendar". A
escala grande daquela seção passou a ser do prazo.

**Por quê.** Numerar passo a passo não diz nada que a ordem da lista já não diga, e é
uma das assinaturas mais reconhecíveis de página gerada por IA. "24 horas" é
informação que o cliente precisa; "01" é enfeite com cara de rótulo.

**Descartado: manter os numerais e só diminuí-los.** Diminuir um enfeite não o
transforma em conteúdo.

**Descartado também, na mesma rodada:** três rótulos em caixa alta (festa, congelados,
contato) e o "Ver o cardápio ↓" do hero, que apontava para o mesmo destino do botão
trinta pixels acima.

**Revisitar se.** Nada previsto. A regra geral fica: escala grande é recurso caro,
gasta em informação.

---

## 2026-08-23 — Velocidade da esteira é constante declarada; a duração é derivada

**Decidido.** `PIXELS_POR_SEGUNDO = 70` em `marquee.tsx`, e a duração sai dessa conta.

**Por quê.** Antes a duração era fixa em 28 segundos e a velocidade saía do tamanho do
trilho. Consequência: desktop corria a 502 px/s e celular a 336, e acrescentar um
sabor no cardápio acelerava a faixa sem ninguém decidir isso. Texto em movimento fica
legível entre 40 e 90 px/s.

**Descartado: só baixar o número da duração.** Resolveria o sintoma daquele dia e
deixaria o defeito de fundo, que é a velocidade ser acidente do conteúdo.

**Revisitar se.** Alguém reclamar que está lenta demais. A faixa cobrada pela
conferência é 40 a 110.

---

## 2026-08-22 — Movimento tem três níveis, não um interruptor

**Decidido.** O `MotionProvider` classifica em `completo`, `leve` e `nenhum`, e expõe
três respostas: `motionEnabled` (Lenis, ScrollTrigger, shader), `videoEnabled` (o
`<video>`) e `lacosLeves` (transform em laço na GPU).

**Por quê.** Um booleano só tratava tudo como igualmente caro, e não é. Decodificar
H.264 acontece em hardware; um `transform` em laço roda na GPU; o que custa de verdade
é Lenis e ScrollTrigger. Com um interruptor só, o celular de entrada ficava sem a peça
principal da página e o dono relatou, com razão, que "está só uma imagem".

**Descartado: desligar tudo no aparelho fraco.** Era o comportamento anterior, e foi
exatamente o defeito relatado.

**Revisitar se.** Aparecer aparelho onde o vídeo trava. A classificação usa
`deviceMemory` e `hardwareConcurrency`, que o Safari não expõe.

---

## 2026-08-22 — Contraste é medido no pixel pintado, não na cor declarada no CSS

**Decidido.** `scripts/checks/contraste-pintado.mjs` pinta o texto de `transparent`,
tira captura, e amostra o pior pixel sob cada linha de texto.

**Por quê.** A conferência antiga sobe a árvore do DOM até achar uma cor opaca. Atrás
do texto do hero tem vídeo, e CSS não sabe disso: ela achava `#120b08` e concluía
9,5:1 enquanto o texto real estava em **1,01:1** no celular.

**Descartado: `visibility: hidden` para esconder o texto.** Apaga também o fundo do
próprio elemento, e um botão âmbar passava a ser medido contra a página atrás dele.
Acusou 1,00:1 num botão perfeito.

**Descartado: medir a caixa do elemento.** Um parágrafo de 1184px de largura mistura
três linhas que caem em pedaços diferentes do vídeo. O certo é `Range.getClientRects()`,
que dá um retângulo por linha desenhada.

**Revisitar se.** Entrar fundo animado em outra seção. A conferência acha as seções
por `[data-clipe]`; peça nova precisa dessa marca.

---

## 2026-08-22 — O pôster é o LCP, o vídeo nunca

**Decidido.** O `CinemaLoop` renderiza uma imagem estática no HTML e sobe o vídeo por
cima depois, quando ele estiver pronto e a peça estiver realmente sendo vista.

**Por quê.** Se o vídeo fosse o elemento principal, o LCP passaria de ~900ms para o
tempo de baixar megabytes no 4G. LCP é a métrica que decide se a pessoa espera ou
fecha a aba.

**Descartado: tocar assim que a peça se aproxima.** Havia 200px de antecedência, que
servem para BAIXAR. O clipe do corte toca uma vez e para no último quadro: num celular
rolando devagar ele acabava antes de a pessoa chegar, e o dono relatou "uma foto
estática" — era o último quadro, parado. Hoje são dois observadores: um com folga para
baixar, outro sem folga para tocar.

**Revisitar se.** Entrar clipe que não seja nem laço nem tiro único.

---

## 2026-08-22 — Manifestos guardam caminho cru; o prefixo entra no componente

**Decidido.** `clipes.ts` e `fotos.ts` guardam `/cinema/x.webm`. O prefixo do GitHub
Pages entra em `arquivoPublico()`, num lugar só.

**Por quê.** O `assetPrefix` do Next cobre apenas `_next/`. Caminho escrito à mão em
`public/` não recebe prefixo nenhum e responde 404 em produção, onde o site mora em
`/DON-ENRICO-/`. E o Node lê esses manifestos direto no `check:midia`, então eles não
podem importar nada com alias `@/`.

**Descartado: importar o prefixo dentro do manifesto.** Quebrou o `check:midia` duas
vezes, primeiro pelo alias e depois pela extensão faltando.

**Revisitar se.** O site ganhar domínio próprio na raiz. Aí o prefixo vira vazio e
nada mais muda.

---

## 2026-08-21 — Chiaroscuro noir quente, e a fritadeira acesa na sombra

**Decidido.** Fundo quase preto quente (`#120B08`), âmbar como único acento, Archivo
Black em escala grande, e a luz vindo de baixo como fritadeira acesa.

**Por quê.** Salgado frito é comida de noite, de festa, de bar. O centro seguro da
distribuição para "artesanal brasileiro" é creme com serifa e terracota, e é o que
todo gerador entrega.

**Descartado: o creme com serifa.** Não porque seja feio, mas porque é o default
reconhecível, e o pedido do dono era justamente não ter cara de site feito por IA.

**Descartado: three.js para o shader de calor.** Trazia a cena 3D inteira (câmeras,
luzes, grafo, carregadores) para desenhar um retângulo. WebGL puro fez o mesmo e zerou
o CLS.

**Revisitar se.** A marca ganhar identidade visual formal. A logo impressa nas caixas
é azul e vermelha, o que **não** conversa com esta paleta — ver `TRAVADO.md`.
