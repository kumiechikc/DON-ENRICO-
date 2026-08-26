# Don Enrico Lanches — contexto completo

> **Este arquivo é gerado. Não edite à mão.**
>
> Ele é a costura de seis arquivos do repositório `kumiechikc/DON-ENRICO-`, cada
> um deles a fonte da sua parte. Editar aqui é escrever numa cópia: a mudança
> some na próxima vez que alguém rodar `npm run contexto`, e até lá as duas
> versões discordam em silêncio.
>
> Para saber de quando é este retrato, veja o histórico do arquivo no repositório.
> Ele não carimba data nem commit aqui dentro, e isso é de propósito: a saída
> precisa ser uma função pura das seis fontes, senão a conferência que garante que
> ela está em dia não teria como passar.

## Para que serve

Levar o projeto inteiro na cabeça para outro lugar: outro repositório, outra
ferramenta, uma sessão de IA que começa do zero, ou uma pessoa que nunca ouviu
falar da Don Enrico.

Sessão de IA perde memória — o contexto antigo é resumido para caber, e o resumo
joga fora justamente o que era barato de anotar e caro de redescobrir, que é o
motivo. Este arquivo é a defesa contra isso.

**Nada aqui foi inventado.** Onde falta informação, está escrito que falta, e a
parte 5 lista tudo que ainda espera resposta do dono. Contexto com buraco honesto
é utilizável; contexto com buraco tapado por palpite contamina tudo que for
construído em cima dele.

## O que tem dentro

1. [A marca, o produto e o retrato do negócio](#marca) — Quem é a Don Enrico, o que ela vende e como atende.
2. [Os fatos, com a fonte de cada um](#negocio) — Só entra aqui o que tem fonte. Palpite mora na parte 5.
3. [As decisões, e o que foi descartado junto](#decisoes) — A metade descartada é a que impede refazer a escolha errada.
4. [Os becos sem saída, com o número que provou](#becos) — O que nenhuma outra fonte tem: o que já foi tentado e falhou.
5. [O que espera resposta, em ordem de valor](#travado) — Cada item diz o que a resposta destrava.
6. [Como o trabalho é feito neste repositório](#trabalho) — O loop de design, as conferências e a regra de entrega.

---

<a id="marca"></a>

## Parte 1 — A marca, o produto e o retrato do negócio

> Fonte: `CONTEXTO.md`. Para mudar qualquer coisa desta parte, mude lá.

## Contexto da marca Don Enrico Lanches

Tudo que se sabe sobre a marca, com a fonte de cada coisa, e uma separação rígida
entre **o que é fato**, **o que é leitura minha** e **o que ninguém respondeu ainda**.

Este arquivo existe para briefar quem chegar: um designer, uma agência, outra sessão
de IA, ou o próprio dono relendo o próprio negócio de fora. Ele não decide nada; quem
decide é `cerebro/DECISOES.md`. Aqui é só o retrato.

**Nada aqui foi inventado para preencher espaço.** Onde falta informação, está escrito
que falta. Um contexto com buraco honesto é utilizável; um contexto com buraco tapado
por palpite contamina tudo que for feito em cima dele.

---

### 1. A marca

#### O nome e o personagem

**Don Enrico Lanches.** Salgados para festa e congelados, por encomenda, em Viamão,
Rio Grande do Sul.

O nome não é um sobrenome de família qualquer: é um **personagem**, e o dono construiu
esse personagem sozinho, antes de qualquer site existir. A prova está impressa na
caixa de entrega, que é material que a empresa já usa:

- a ilustração é um **terno azul-petróleo com gravata vermelha**, sem rosto;
- em cima, **"GRATIZIE!!!"**, italiano abrasileirado, com três exclamações;
- o nome **DON ENRICO** em caixa alta, com **LANCHES** menor, encaixado;
- embaixo, WhatsApp **51 99015 6798** e **@donenricolanches**.

E o lema, que **o dono escreveu**: *"O sabor que impõe respeito."*

**Don. Terno. Gravata. Gratizie. Respeito.** É um chefão italiano, e é uma piada que a
marca faz com afeto, não com medo. Isso não é dedução minha sobre o que a marca
"poderia ser": os cinco elementos vieram do dono, e todos apontam para o mesmo lugar.

#### O que isso significa na prática

O personagem dá à marca uma coisa que quase nenhuma casa de salgados de bairro tem:
**um tom de voz que não é genérico.** A concorrência fala em "qualidade", "carinho",
"feito com amor". A Don Enrico fala em respeito, e faz graça com a própria pompa.

É um ativo, e é o ativo mais barato de usar, porque já existe e já está pago.

---

### 2. O que a empresa vende

Sempre em **pacote fechado**, nunca unidade avulsa. Três formas.

#### Box Degustação
Para provar. **Sortido: a casa monta a combinação**, o cliente não escolhe sabor. Quem
faz questão de um sabor resolve na conversa do WhatsApp.

| Quantidade | Preço |
|---|---|
| 25 unidades | R$ 19,90 |
| 50 unidades | R$ 39,90 |

O que costuma vir: coxinha de frango, bolinha de queijo, risoles presunto e queijo,
calabresinha com cheddar, croquete com requeijão, enroladinho de salsicha, pastelzinho
de carne, pastelzinho de queijo, mini churros.

#### Encomendas para festa — quatro linhas

| Linha | O que é | 50 un | 100 un | Sabores no rol |
|---|---|---|---|---|
| **Clássicos Fritos** | Fritos na hora, os tradicionais | R$ 39,90 | R$ 69,90 | 9 |
| **Assados Especiais** | Assados no forno, sem fritura | R$ 44,90 | R$ 79,90 | 6 |
| **Folhados Premium** | Massa folhada, assada | R$ 44,90 | R$ 79,90 | 3 |
| **Seleção Don Enrico** | Mini pizzas, croissants, empadinhas, tortinhas | R$ 59,90 | R$ 109,90 | 11 |

**Quantos sabores dá para combinar:** 1 em 25 unidades, 2 em 50, 2 em 100. O encarte
só dizia "máximo dois sabores por cento"; o sócio confirmou o resto em 26/08/2026.

A **Seleção Don Enrico** é a linha que leva o nome do personagem, é a mais cara, e é a
que tem mais variedade. É o topo da casa, e o cardápio já diz isso sozinho.

#### Congelados
Pacote de 50 unidades, para o cliente fritar ou assar em casa.

**Para fritar** (10 opções, R$ 22 a R$ 27): coxinha de frango, calabresa com cheddar,
bolinha de queijo, risoles presunto e queijo, enrolado de salsicha, croquete com
requeijão, pastelzinho de carne, pastelzinho de queijo, mini churros, sortidos.

**Assados** (a partir de R$ 30): esfiha de frango, esfiha de carne, e outros.

> A tabela completa e viva está em `src/lib/data/menu.ts`, que é a **fonte única**.
> Nenhum preço é copiado para cá para valer: duas cópias de um preço viram duas
> verdades no dia em que uma mudar.

---

### 3. Como a empresa atende

| | |
|---|---|
| **Onde** | Viamão e toda a região metropolitana de Porto Alegre |
| **Entrega** | Sim |
| **Prazo** | Mínimo de 24 horas de antecedência |
| **Abaixo de 24h** | Avaliado caso a caso. Segundo o dono, até hoje sempre deu |
| **Canal** | WhatsApp (51) 99015-6798 |
| **Instagram** | @donenricolanches |

**Duas frases que o site NÃO diz, e o motivo importa:**

*"Entrega em 24h"* seria mentira. 24 horas é a antecedência mínima do pedido, não uma
promessa de prazo de entrega. São coisas diferentes, e a segunda nunca foi prometida.

*"Sempre dá"* viraria garantia. O dono contou um histórico, não assumiu um
compromisso. Num sábado com três festas, a cozinha não cumpre essa garantia.

---

### 4. Duas identidades, e isso é de propósito

A caixa e o site não se parecem, e a diferença é grande o bastante para alguém achar
que é erro. Não é: foi decidido.

| | A logo impressa | O site |
|---|---|---|
| Cor | Azul-petróleo e vermelho | Quase preto quente e âmbar |
| Registro | Ilustração de terno, cartunesca, alegre | Fotográfico, chiaroscuro, noturno |
| Piada | Explícita ("GRATIZIE!!!") | Contida, na luz de interrogatório |

O site foi construído em chiaroscuro porque salgado frito é comida de noite, de festa
e de bar, e porque o centro seguro para "artesanal brasileiro" é creme com serifa e
terracota, que é o que todo gerador entrega. O clipe do hero é uma coxinha sob luz de
interrogatório numa mesa de metal: **é o personagem do Don levado a sério em cima da
piada que a caixa faz.**

Hoje o site escreve "Don Enrico" em tipografia, **não usa a logo**, porque o arquivo
vetorial nunca chegou.

**Decidido em 26/08/2026: as duas convivem de propósito.** A caixa é o lado alegre da
marca, o site é o lado sério. Mesmo personagem, dois registros. Nem o site puxa para a
logo, nem a logo é redesenhada: material impresso já pago não precisa ser refeito, e o
chiaroscuro é a única coisa que hoje separa o site de qualquer página de salgados
saída de template.

O que falta é a **ponte**. Sem algum elemento em comum entre as duas, quem recebe a
caixa depois de comprar pelo site não vai ler "dois lados da mesma marca", vai ler
"erro". A proposta ainda não existe, e ela precisa do arquivo da logo em vetor, que
nunca chegou.

---

### 5. As fotos

Cinco fotos reais chegaram do dono, por WhatsApp. **Três entraram no site, duas
ficaram de fora**, e as duas recusas foram por motivo medido, não por gosto:

- **Bandeja redonda sortida.** 550x355 pixels e 0,26 byte por pixel, contra 1080 a
  1600 pixels e 0,11 a 0,16 das outras quatro, que é a assinatura de foto de celular
  passada pelo WhatsApp. A cor confirma: laranja saturado e brilho estourado,
  tratamento de banco de imagem. Publicar foto de banco como se fosse do produto é
  propaganda enganosa, e a origem dessa é desconhecida.
- **Mini sanduíches.** É a melhor foto do lote, nítida e bem iluminada, e o item **não
  está no cardápio**. Foto de produto que não se vende é convite para um pedido que a
  cozinha vai ter que recusar.

**Três linhas seguem sem foto nenhuma:** Assados Especiais, Folhados Premium e Seleção
Don Enrico. Sem foto, o card não mostra bloco de imagem, em vez de mostrar espaço
vazio.

**As fotos que existem vieram comprimidas pelo WhatsApp**, com cerca de um décimo dos
bytes por pixel que uma câmera de celular grava. Nenhum tratamento recupera o que a
compressão jogou fora, e o projeto não usa IA generativa para "melhorar" foto de
produto: um modelo que redesenha a coxinha entrega uma coxinha que não é a da casa. O
conserto de verdade é o arquivo original.

---

### 6. O que o site é hoje

Um site de uma página só, que termina num pedido montado e enviado pelo WhatsApp com
os sabores e o total já escritos. Publica em dois lugares a partir do `main`: GitHub
Pages e Vercel.

O que ele já faz, e que o cliente sente sem saber nomear: abre em menos de um segundo
mesmo em 4G com celular fraco, não pula enquanto carrega, funciona inteiro sem
JavaScript, é navegável só pelo teclado, e o texto passa em contraste medido pixel a
pixel em cima do vídeo.

O que ele **não** faz, porque falta informação e não código: não diz endereço, não diz
horário, não tem Pix (o código do Banco Central está pronto e testado, esperando a
chave), e não nomeia as cidades atendidas.

---

### 7. O que ninguém respondeu ainda

Está em `cerebro/TRAVADO.md`, em ordem de valor, com o que cada resposta destrava. Os
três primeiros, que são os que mais custam:

1. **As fotos das três linhas sem imagem**, e os arquivos originais das que já vieram.
2. **A lista nominal das cidades atendidas**, para trocar "região metropolitana" pelos
   nomes, no site e na marcação que o Google lê.
3. **O modelo de pagamento.** Perguntado, e a resposta foi "a pensar": adiantado,
   sinal ou tudo na entrega ainda não está decidido. A chave Pix é a última pergunta
   dessa sequência, não a primeira.

---

### Fontes deste documento

| O que | De onde veio |
|---|---|
| Nome, logo, telefone, Instagram | Impressos na caixa de entrega, em foto do dono |
| Lema | O dono confirmou que é dele |
| Cardápio, preços, sabores | Encartes da empresa, transcritos em `src/lib/data/menu.ts` |
| "Máximo dois sabores por cento" | Texto literal do encarte |
| Cidade, área, entrega, prazo | O dono, por áudio |
| Regra de sabores por faixa | O sócio, em 26/08/2026 |
| Box sortido, e a convivência das duas identidades | O sócio, em 26/08/2026 |
| Medições das fotos | `src/lib/media/fotos.ts` |
| Leitura do personagem (seção 1) | **Interpretação minha**, a partir dos cinco elementos acima |

---

<a id="negocio"></a>

## Parte 2 — Os fatos, com a fonte de cada um

> Fonte: `cerebro/NEGOCIO.md`. Para mudar qualquer coisa desta parte, mude lá.

## O negócio, e a fonte de cada fato

**Só entra aqui o que tem fonte.** Palpite, dedução e "deve ser assim" moram no
`TRAVADO.md`. Um fato errado aqui vira uma promessa errada no site, e quem responde
por ela na conversa do WhatsApp é o dono, não o repositório.

A coluna `Fonte` é obrigatória e conferida por máquina (`npm run check:cerebro`).

### Identidade

| Fato | Valor | Fonte |
|---|---|---|
| Nome | Don Enrico Lanches | Logo impressa nas caixas de entrega |
| Cidade base | Viamão, RS | Dono, por áudio |
| WhatsApp | (51) 99015-6798 | Impresso na caixa e nos encartes |
| Instagram | @donenricolanches | Impresso na caixa |
| Lema | O sabor que impõe respeito | O dono confirmou que a frase é dele |
| Personagem da marca | Um "Don" italiano: terno azul-petróleo, gravata vermelha, "GRATIZIE!!!" | Logo impressa na caixa de entrega |

O nome, o terno, o "Gratizie" e o lema vêm todos do dono e apontam para a mesma
coisa: um chefão italiano, com afeto e não com medo. O retrato completo da marca está
em `CONTEXTO.md`, na raiz.

### Atendimento

| Fato | Valor | Fonte |
|---|---|---|
| Área atendida | Viamão e a região metropolitana de Porto Alegre | Dono, por áudio |
| Entrega | Sim, a empresa entrega | Dono, por áudio |
| Prazo mínimo | 24 horas de antecedência | Dono, por áudio |
| Abaixo de 24 horas | O pedido é avaliado caso a caso, não é recusado nem aceito de antemão | Dono, por áudio |

**Duas armadilhas de redação neste bloco, e as duas já foram evitadas de propósito:**

*"Entrega em 24h" seria mentira.* 24 horas é a antecedência mínima do PEDIDO, não uma
promessa de entrega em 24 horas. São coisas diferentes e a segunda não foi prometida.

*"Sempre dá" viraria garantia.* O dono disse que abaixo de 24 horas sempre deu certo
até hoje. Isso é histórico, não compromisso. No site está escrito como avaliação
("pergunte no WhatsApp: a gente avalia o pedido na hora"), porque num sábado com três
festas a cozinha não pode cumprir a garantia que a frase daria.

### Como vende

| Fato | Valor | Fonte |
|---|---|---|
| Formato | Sempre pacote fechado, nunca unidade avulsa | Encartes |
| Faixas de festa | 50 e 100 unidades | Encartes |
| Box degustação | 25 e 50 unidades, a partir de R$ 19,90 | Encartes |
| Congelados | Vendidos em pacote | Encartes |
| Regra de sabores, 100 unidades | "Máximo dois sabores por cento" | Encarte, texto literal |
| Regra de sabores, todas as faixas | 1 sabor em 25, 2 em 50, 2 em 100 | O sócio, em 26/08/2026 |
| Box Degustação | Sortido: a casa monta. Pedido específico se resolve na conversa | O sócio, em 26/08/2026 |

A tabela completa de preço e sabor vive em `src/lib/data/menu.ts`, que é a **fonte
única**. Nada de preço é copiado para cá: duas cópias de um preço viram duas verdades
no dia em que uma mudar. Mexeu no `menu.ts`, rode `npm run catalogo` e commite o
`apps-script/Catalogo.gs` junto, senão o CI reprova.

### Fotos que existem, e o que cada uma prova

Cinco fotos chegaram do dono. Três entraram no site, duas ficaram de fora. O motivo
completo, com as medições, está no fim de `src/lib/media/fotos.ts` e resumido em
`BECOS.md`.

| Foto | Onde está | O que ela prova |
|---|---|---|
| Fritos de perto | Box Degustação | O sortido de clássicos que o box é |
| Bandejas de coxinha e croquete | Clássicos Fritos | Dois sabores reais da linha |
| Onze caixas na mesa | Como encomendar | Capacidade de produção, ao lado do prazo |

Continuam sem foto: **Assados Especiais**, **Folhados Premium** e **Seleção Don
Enrico**. Sem foto, o card não mostra bloco de imagem nenhum, em vez de mostrar um
espaço vazio.

---

<a id="decisoes"></a>

## Parte 3 — As decisões, e o que foi descartado junto

> Fonte: `cerebro/DECISOES.md`. Para mudar qualquer coisa desta parte, mude lá.

## Decisões, e o que foi descartado junto

Cada entrada tem quatro partes, e a terceira é a que justifica o arquivo existir:
**o que foi decidido**, **por quê**, **o que foi descartado e por quê**, e **o que
faria revisitar**.

"Escolhemos X" não ajuda ninguém: daqui a seis meses alguém olha X, acha estranho, e
troca por Y sem saber que Y já foi olhado e recusado. O `git log` guarda o que mudou;
não guarda o que foi rejeitado.

Entrada nova vai no topo. Toda entrada precisa de data.

---

### 2026-08-26 — O Box Degustação é sortido, e o card para de perguntar sabor

**Decidido.** A casa monta a combinação do Box. O cliente não escolhe, e se fizer
questão de um sabor, resolve na conversa do WhatsApp.

**Por quê.** O sócio confirmou. E o site estava dizendo as duas coisas ao mesmo tempo:
a descrição do card já dizia "sortido dos clássicos fritos" e logo abaixo havia nove
sabores para marcar, com um aviso de "escolha 1 sabor". As duas não podem ser verdade,
e quem lê acredita na que está mais perto do dedo — a errada. O cliente marcava
"coxinha", recebia sortido, e a culpa caía na cozinha.

**Descartado: tirar a palavra "sortido" e manter a escolha.** Era a outra saída para a
mesma contradição, e teria sido escolher a interface em vez do produto. O produto é o
que a cozinha faz.

**Descartado: esconder a lista de sabores.** Sem escolha, os nove nomes ainda são a
resposta para "o que eu vou comer", que é a pergunta que decide a compra. Viraram uma
frase corrida, num `<p>` e não num `<ul>`: um leitor de tela anunciando "lista de nove
itens" prometeria uma escolha que não existe.

**Revisitar se.** A cozinha passar a aceitar escolha no Box. O campo `sortido` no
`menu.ts` liga e desliga isso sozinho.

---

### 2026-08-26 — A caixa e o site convivem como dois registros da mesma marca

**Decidido.** A logo impressa (terno azul-petróleo, gravata vermelha, "GRATIZIE!!!")
continua sendo o lado alegre; o site continua sendo o lado sério, em chiaroscuro. Nem
o site puxa para a logo, nem a logo é redesenhada.

**Por quê.** O sócio escolheu. E é a saída que não joga fora nada: o personagem do Don
é o mesmo nos dois, e material impresso já pago não precisa ser refeito.

**Descartado: o site puxar para a logo.** Mais cor e piada explícita aproximariam o
site da caixa, mas custariam a única coisa que hoje diferencia o site de qualquer
página de salgados gerada por template.

**Descartado: redesenhar a logo.** Mexe em material impresso, que custa dinheiro e não
resolve nada que esteja quebrado.

**O que ficou pendente, e não é pequeno.** Sem um elemento em comum, quem recebe a
caixa depois de comprar pelo site lê "erro", não "dois lados". A ponte visual está no
`TRAVADO.md` e precisa do arquivo vetorial da logo.

---

### 2026-08-26 — A regra de sabores deixa de ser palpite

**Decidido.** 1 sabor em 25 unidades, 2 em 50, 2 em 100. Sem mudança no código: os
números já eram esses.

**Por quê.** O sócio confirmou que a leitura conservadora era a certa. O encarte só
dizia "máximo dois sabores por cento", claro para 100 e ambíguo para as faixas
menores, e o site vinha adivinhando desde o começo.

**O que muda de verdade.** O comentário no `menu.ts` mandava confirmar com o dono e
avisava que aquilo era chute. Um comentário desses envelhece mal: seis meses depois
alguém lê, pensa que ainda é chute, e "conserta" uma regra que estava certa. Agora ele
diz que é regra confirmada, com a data.

**Revisitar se.** A cozinha mudar a regra. É o único número do cardápio que descreve o
que a cozinha aceita, e não o que ela cobra.

---

### 2026-08-26 — O lema é do dono, e o personagem da marca também

**Decidido.** "O sabor que impõe respeito" fica, e passa a constar como fato de marca
com fonte, não como texto de origem incerta.

**Por quê.** O dono confirmou que a frase é dele. Isso resolve a única dúvida que
havia sobre a peça de texto mais visível do site.

**O que isso destravou junto.** O lema deixa de ser uma frase solta e passa a ser a
quarta perna de um personagem que o dono construiu antes de existir site: o nome
"Don", o terno com gravata da logo, o "GRATIZIE!!!" impresso na caixa, e o respeito do
lema. São cinco elementos, todos dele, todos apontando para o mesmo chefão italiano.
O retrato inteiro ficou em `CONTEXTO.md`.

**Continua em aberto, e é outra coisa.** A logo impressa é azul-petróleo com vermelho;
o site é quase preto com âmbar. O personagem é o mesmo, o vestuário visual não. Está
no `TRAVADO.md`.

**Revisitar se.** O dono quiser trocar o lema. A marca é dele.

---

### 2026-08-25 — Merge sem pedir confirmação, com o CI como única barreira

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

### 2026-08-25 — Foto de produto não passa por IA generativa

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

### 2026-08-24 — Área de atendimento entra como região, não como lista de cidades

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

### 2026-08-24 — Escala tipográfica grande é para número que informa

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

### 2026-08-23 — Velocidade da esteira é constante declarada; a duração é derivada

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

### 2026-08-22 — Movimento tem três níveis, não um interruptor

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

### 2026-08-22 — Contraste é medido no pixel pintado, não na cor declarada no CSS

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

### 2026-08-22 — O pôster é o LCP, o vídeo nunca

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

### 2026-08-22 — Manifestos guardam caminho cru; o prefixo entra no componente

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

### 2026-08-21 — Chiaroscuro noir quente, e a fritadeira acesa na sombra

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

---

<a id="becos"></a>

## Parte 4 — Os becos sem saída, com o número que provou

> Fonte: `cerebro/BECOS.md`. Para mudar qualquer coisa desta parte, mude lá.

## Becos sem saída

O que já foi tentado neste projeto e **não** deu certo, com o número que provou.

Um beco anotado vale mais que uma vitória anotada. A vitória está no código, visível
para quem for ler. O beco não está em lugar nenhum: some junto com a sessão, e a
próxima pessoa que tiver a mesma ideia razoável vai gastar as mesmas horas para chegar
no mesmo muro.

Todo item precisa de data e do que foi medido. "Não funcionou" sem número não é um
beco anotado, é uma opinião.

---

### Vídeo e imagem

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

### Layout e CSS

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

### Ferramental e conferências

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

---

### Método

**Toda conferência nova deste projeto foi quebrada de propósito antes de ser
confiada, e várias reprovaram nesse teste.** A de contraste pintado tinha dois
defeitos próprios, a da esteira era fraca, a de foto engolia o próprio erro. Teste que
nunca falhou não prova nada: ele é indistinguível de um teste que não testa.

---

<a id="travado"></a>

## Parte 5 — O que espera resposta, em ordem de valor

> Fonte: `cerebro/TRAVADO.md`. Para mudar qualquer coisa desta parte, mude lá.

## O que espera resposta do dono

Em ordem de valor: o de cima custa mais caro ficar sem.

Cada item diz **o que destrava**, porque pergunta sem consequência é questionário, e
questionário longo ninguém responde. As perguntas completas, com contexto, estão em
`docs/PERGUNTAS-CLIENTE.md`; aqui é o índice vivo.

Respondeu? Sai daqui, entra no `NEGOCIO.md` com a fonte, e a mudança correspondente
sai no mesmo commit.

---

### 🔴 A lista nominal das cidades

O site diz "Viamão e toda a região metropolitana de Porto Alegre", que é verdade
inteira. Os nomes que o dono citou por áudio saíram ambíguos na transcrição e não
foram escritos, de propósito.

**Destrava:** a frase vira a lista, no site e no `areaServed` do JSON-LD, e o Google
passa a mostrar a empresa para as cidades certas.

### 🔴 As fotos das três linhas que faltam

**Assados Especiais**, **Folhados Premium** e **Seleção Don Enrico** não têm foto.
Sem foto, o card não mostra bloco de imagem nenhum.

**Destrava:** três linhas do cardápio que hoje vendem só com texto.
**Vale pedir junto:** os arquivos ORIGINAIS das cinco que já chegaram. Elas vieram
pelo WhatsApp, com cerca de um décimo dos bytes por pixel que a câmera grava, e nenhum
tratamento recupera o que a compressão jogou fora.

### 🔴 Taxa de entrega

Existe? Quanto? Varia por distância? Tem valor de pedido que isenta?

**Destrava:** o cliente saber o preço final antes de chamar no WhatsApp.

### 🟡 Retirada e endereço

Tem retirada? Em que endereço? Pode ir para o site, ou é ponto residencial que o dono
prefere passar só na conversa?

**Destrava:** o `address` completo no JSON-LD, e o perfil no Google Meu Negócio, que
hoje não dá para montar por falta de endereço e horário.

### 🟡 Horário de atendimento

**Destrava:** o `openingHours` do JSON-LD e o Google Meu Negócio. Hoje os dois estão
de fora, porque schema com horário inventado é pior que schema sem horário: o Google
penaliza divergência entre o que a marcação afirma e a realidade.

### 🟡 Quantidade mínima e máxima de pedido

Qual o maior pedido que a cozinha produz de uma vez?

**Destrava:** o site parar de aceitar um pedido que não dá para entregar.

### 🟡 Pagamento: o modelo inteiro, antes da chave Pix

Perguntado ao sócio em 26/08/2026. A resposta foi **"sistema de pagamento a pensar"**:
não é que ele não saiba, é que a decisão ainda não foi tomada. Adiantado, sinal, ou
tudo na entrega muda o que o site mostra e o valor que o QR Code carrega.

Enquanto não decidir, nada de pagamento aparece no site, e a chave Pix não é nem
perguntada — ela é a última pergunta, não a primeira.

**Destrava:** o QR e o copia-e-cola do Pix, que já estão implementados e testados
contra a especificação do Banco Central, esperando só a decisão e os dados.

### 🟡 A ponte visual entre a caixa e o site

A direção já foi decidida em 26/08/2026: as duas identidades **convivem de propósito**.
A caixa é o lado alegre da marca (terno azul-petróleo, gravata vermelha, "GRATIZIE!!!")
e o site é o lado sério (quase preto, âmbar, luz de interrogatório). Mesmo personagem,
dois registros.

O que falta é a **ponte**: sem algum elemento em comum, quem recebe a caixa depois de
comprar pelo site não vai ler "dois lados da mesma marca", vai ler "erro". Ainda não
existe proposta, e ela precisa do arquivo da logo em vetor para ser feita.

**Destrava:** o site poder finalmente usar a logo em vez de escrever "Don Enrico" em
tipografia. Precisa do arquivo vetorial, ou do contato de quem fez os encartes.

### ⚪ Números de estoque

Mínimo por item, lote de produção.

**Destrava:** o controle de estoque da planilha de operação sair do genérico.

### ⚪ As imagens dos encartes são reais ou de banco?

Se forem de banco, não podem ser usadas como se fossem do produto.

**Destrava:** saber se sobra material de imagem já pago.

---

<a id="trabalho"></a>

## Parte 6 — Como o trabalho é feito neste repositório

> Fonte: `CLAUDE.md`. Para mudar qualquer coisa desta parte, mude lá.

## CLAUDE.md — DON ENRICO Website Design Stack

> ## Antes de trabalhar, leia `cerebro/LEIA-PRIMEIRO.md`
>
> São cinco minutos. Este arquivo aqui é carregado sozinho em toda sessão; o
> `cerebro/` não é, e é onde mora o que este arquivo não cabe: os fatos do negócio
> com a fonte de cada um, as decisões com o que foi descartado junto, os becos que
> já foram tentados e não deram certo, e o que está esperando resposta do dono.
>
> Para o retrato da marca inteiro (o personagem, o cardápio, a tensão entre a logo
> impressa e a paleta do site), leia `CONTEXTO.md`, na raiz.
>
> Uma sessão que pula essa leitura refaz trabalho e desfaz decisão. Já aconteceu.
>
> Terminou uma rodada que tomou decisão, esbarrou em beco ou destravou pergunta?
> Atualize o `cerebro/` **no mesmo commit**. `npm run check:cerebro` cobra a forma.

This repository is a **ready-to-use environment that makes Claude Code good at website
design**. When you (Claude) do any UI, web page, landing page, component, or visual-polish
work in a project that uses this stack, follow the workflow below. It combines a *knowledge*
layer (what to build), a *taste* layer (making it distinctive), and a *feedback* layer
(actually seeing the rendered result and fixing it).

### The design loop (follow in order)

1. **PLAN with data — `ui-ux-pro-max`.** Before writing markup, get a concrete design
   system. Run the generator, then pull specifics per surface:
   ```bash
   python3 src/ui-ux-pro-max/scripts/search.py "<product> <industry> <keywords>" --design-system -p "Project"
   python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain style|color|typography|ux|landing|web-vitals
   ```
   Use it for: product-type patterns, color tokens, font pairings, UX anti-patterns,
   landing structure, and Core Web Vitals budgets. Treat its output as the source of truth
   for tokens (color, type, spacing).

2. **COMMIT to an aesthetic — `frontend-design`.** Do not sample the safe center of the
   training distribution. Answer four questions first — *purpose, tone, constraints,
   differentiation* — pick ONE tone and execute it precisely. Avoid the three AI-slop
   defaults (cream + serif + terracotta; near-black + acid accent; hairline broadsheet)
   unless the brief explicitly asks. Spend boldness in **one** signature element; keep the
   rest quiet.

3. **BUILD.** Implement with the chosen tokens. Match the surrounding code's conventions.
   For component-driven stacks, use the **shadcn** MCP to search/add components instead of
   hand-rolling primitives. Use **21st.dev Magic MCP** (`21st`) to generate custom React
   components from prompts, and **shadcn-ui MCP** (`@jpisnice`) for browsing blocks,
   themes, and extended component metadata.

4. **SEE IT — Playwright / Chrome DevTools MCP.** You are not done when the code compiles.
   Open the page in a real browser, screenshot it, read the console, exercise interactive
   states (hover, focus, open menus, submit forms), and resize the viewport. Fix what you
   see — z-index, animation timing, layout shift, overflow. This feedback loop is the whole
   point of the stack; a change you have not looked at is not finished.

5. **REVIEW — `/design-review` (the `design-review` subagent).** Before you call a UI change
   complete, run the design-review subagent. It drives Playwright across mobile to ultrawide
   viewports, checks WCAG 2.1 AA (contrast, focus order, keyboard traps), responsive
   integrity, and interaction states, and returns ranked findings. Fix Blocker/High
   findings before finishing. Also run `/web-design-guidelines` against UI files for a
   compliance check against Vercel's Web Interface Guidelines.

### Quality floor (never ship below this)

- **Responsive:** no horizontal scroll at 375 / 768 / 1024 / 1440 px; content reflows, not shrinks.
- **Accessible:** visible `:focus-visible` on every interactive element; WCAG AA contrast
  (4.5:1 text, 3:1 large text / UI); semantic landmarks; labelled controls; `prefers-reduced-motion` respected.
- **Performant:** stable layout (no CLS from unsized media/fonts), lazy-load below-fold
  images, `font-display: swap`, avoid render-blocking. Check against the `web-vitals` domain.
- **Intentional copy:** active voice, sentence case, name things by what users recognize.

### What's wired in this repo

| Layer | Tool | Where |
|-------|------|-------|
| Knowledge | `ui-ux-pro-max` skill | `.claude/skills/ui-ux-pro-max` + `src/ui-ux-pro-max/` |
| Taste | `frontend-design` skill | install via `/plugin install frontend-design@anthropics/claude-code` |
| Component gen | `shadcn` MCP (official) | `.mcp.json` |
| Component gen | `shadcn-ui` MCP (@jpisnice — blocks, themes) | `.mcp.json` |
| Component gen | `21st` MCP (21st.dev Magic — AI component gen) | `.mcp.json` (needs API key) |
| Visual feedback | `@playwright/mcp` + `chrome-devtools-mcp` | `.mcp.json` |
| Design review | `/design-review` command | `.claude/commands/design-review.md` |
| Design planning | `/design-plan` command | `.claude/commands/design-plan.md` |
| Web guidelines | `web-design-guidelines` skill (Vercel) | `.claude/skills/web-design-guidelines` |
| Accessibility | `a11y-debugging` skill (Chrome DevTools) | `.claude/skills/a11y-debugging` |
| Performance | `debug-optimize-lcp` skill (Chrome DevTools) | `.claude/skills/debug-optimize-lcp` |
| Memory | `memory-leak-debugging` skill (Chrome DevTools) | `.claude/skills/memory-leak-debugging` |
| Standalone audit | `scripts/design-audit.mjs` (multi-viewport screenshots) | `scripts/`, CI in `.github/workflows` |

### Available skills

| Skill | Purpose |
|-------|---------|
| `ui-ux-pro-max` | 84 UI styles, 192 color palettes, 74 font pairings, 98 UX guidelines, 25 chart types |
| `design` | Design guidelines and principles |
| `design-system` | Design system token architecture and component specs |
| `brand` | Branding and identity guidelines |
| `ui-styling` | UI styling patterns and techniques |
| `banner-design` | Banner and hero design patterns |
| `slides` | Presentation and slide design |
| `web-design-guidelines` | Vercel Web Interface Guidelines compliance review |
| `chrome-devtools` | Chrome DevTools usage for debugging |
| `a11y-debugging` | Accessibility debugging with DevTools |
| `debug-optimize-lcp` | Largest Contentful Paint optimization |
| `memory-leak-debugging` | Memory leak detection and fixing |
| `troubleshooting` | General web troubleshooting |

See `docs/STACK.md` for why each tool is here, `docs/SETUP.md` to install, and
`docs/WORKFLOW.md` for a worked end-to-end example.

### Notes

- The `ui-ux-pro-max` data and scripts live at `src/ui-ux-pro-max/`. Run searches with:
  `python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`
- The **21st.dev Magic MCP** needs an API key from https://21st.dev/mcp — set it in
  `.mcp.json` under `env.API_KEY_21ST`, or in your shell environment. See `docs/SETUP.md`.
- The **frontend-design** skill is an Anthropic plugin. Install it inside Claude Code with:
  `/plugin install frontend-design@anthropics/claude-code`

### Entrega: merge automático quando o CI passar

O dono do projeto autorizou merge sem pedir confirmação. Ao terminar uma rodada de
trabalho neste repositório:

1. Commite e faça push na branch `claude/site-quality-design-improvement-ho71kc`.
2. Abra o PR como rascunho, como sempre.
3. **Espere o `audit` do GitHub Actions ficar verde.** Ele é a única barreira: roda
   `npm run check` inteiro (navegador, contraste no pixel, teclado, performance),
   `check:midia`, `check:export`, lint e os dois builds.

   **Ele nem sempre roda, e isso é de propósito.** O `design-review.yml` tem filtro de
   caminhos: PR que só mexe em `docs/`, `README` ou neste arquivo não dispara o
   `audit`, porque nada nesse diff alcança o site. Nesse caso a regra é *nenhum check
   reprovando*, e não *o audit verde* — esperar por um check que não vai existir
   trava a entrega sem proteger nada. Antes de concluir que é esse o caso, confirme
   nos `paths` do workflow que o diff realmente não toca em nada coberto.
4. Com isso e o PR sem conflito, tire o rascunho e **dê o merge**, sem perguntar. O
   Vercel e o GitHub Pages republicam sozinhos a partir do `main`.
5. Se o `audit` reprovar, conserte e faça push de novo. Nunca mergear vermelho, e
   nunca contornar a conferência para conseguir mergear.

#### As duas exceções, e elas não são negociáveis

**Dado de negócio que o dono não confirmou não entra, e portanto não é mergeado.**
Cidade atendida, taxa de entrega, horário, endereço, prazo, chave Pix, regra de
sabores, número de estoque, depoimento. Se uma mudança depende de um desses e ele
não veio por escrito, o PR fica aberto esperando a resposta em vez de ser mergeado.
Merge automático acelera a entrega; ele não vira licença para publicar palpite.

**Mudança que altera o que o site PROMETE ao cliente é avisada antes.** Preço, prazo,
o que está incluso num pacote. O merge pode seguir, mas o recado ao dono vai junto,
porque quem responde por uma promessa errada no WhatsApp é ele.
