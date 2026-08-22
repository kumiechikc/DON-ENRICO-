# O site vira filme

Direção de arte, prompts prontos e passo a passo para colocar os clipes de vídeo no ar.

O encanamento **já está pronto e mergeado**. O que falta são os clipes.

---

## A ideia

Não é "botar um vídeo no hero". É a página inteira virar um **filme fatiado**: cada
seção ganha o seu plano de 6 a 8 segundos, todos na mesma fotografia. Você rola e o
filme avança. O site deixa de ser catálogo e vira carretel.

Isso não é capricho. O Veo entrega no máximo 8 segundos por geração — em vez de brigar
com o limite tentando remendar um filme longo, a estrutura da página absorve ele. Cinco
clipes de 8 segundos é exatamente o que a ferramenta faz bem.

### A direção: interrogatório

A marca é um Don de chapéu com "o sabor que impõe respeito". Isso é cinema de máfia, não
padaria. A piada se monta sozinha, e ninguém no ramo está fazendo:

> **Um salgado sob a luz do interrogatório. E ele confessa.**

Todos os planos são a mesma cena de crime: mesa escura, uma fonte de luz âmbar, fumaça.
É a paleta que o site já usa (`--bg: #120b08`, `--amber: #f5a524`), então o vídeo e o CSS
vão parecer a mesma peça em vez de duas coladas.

---

## ⚠️ A regra que decide o peso: NADA DE GRÃO

Medido aqui, mesma cena de 6 segundos a 1280×720, só mudando o grão de filme:

| | VP9/WebM | H.264/MP4 |
|---|---|---|
| com grão | 5.096 KB | 176 KB |
| **sem grão** | **64 KB** | 152 KB |

**Oitenta vezes.** Grão é ruído que muda a cada quadro por definição, então o codec perde
a compressão temporal inteira — que é de onde vem toda a economia de vídeo.

Os prompts abaixo **já pedem imagem limpa**. Não acrescente "film grain", "35mm",
"analog" nem "vintage": qualquer um deles traz o grão de volta e estoura o orçamento.

O grão do site vem depois, de graça, pela camada `.grain` do `globals.css` — ruído SVG
fixo que cobre a página inteira, inclusive o vídeo. De quebra fica igual entre as seções
com clipe e as sem.

---

## Os cinco planos

| # | Plano | Onde | Duração | Modo | Estado |
|---|---|---|---|---|---|
| 1 | A lâmpada | hero | 7,2s | loop | **no ar** |
| 2 | O corte | abertura do cardápio | 4,15s | uma vez | **no ar** |
| 3 | A esteira | Encomendas para Festa | 8s | loop | a gerar |
| 4 | O freezer | Congelados | 6s | loop | a gerar |
| 5 | A entrega | contato / rodapé | 8s | loop | a gerar |

**O 1 e o 2 estão no ar.** O 2 serviu para o que devia: confirmar que um clipe de verdade
cabe no orçamento, e ensinar as duas correções que agora estão nos prompts de todos (o
formato da coxinha e a proibição de fogo). O 1 chegou já com as correções aplicadas e
passou de primeira. Faltam três.

### 1. A lâmpada (hero) — feito

Uma lâmpada pendurada balança devagar sobre uma mesa de metal. No cone de luz, sozinha:
uma coxinha. A luz varre. Fumaça atravessa. **Nada mais acontece** — a contenção é a
piada. O balanço é cíclico, então o loop fecha sem corte visível.

> **Espaço negativo obrigatório.** O título "SALGADOS PARA FESTA" ocupa a metade esquerda
> no desktop e o terço inferior no celular. A lâmpada e o salgado ficam à **direita**, e o
> canto inferior esquerdo fica escuro e vazio. Sem isso o texto some em cima da imagem, e
> a única coisa que importa no hero deixa de ser legível.

```
Cinematic noir product shot. A single bare bulb on a long cord swings slowly
above a dark scratched metal table. Directly under the cone of warm amber light:
one golden Brazilian coxinha (teardrop-shaped fried snack), alone, casting a long
hard shadow. Thin smoke drifts through the light beam. Slow subtle camera push-in.
Deep shadows, high contrast chiaroscuro, shallow depth of field.
Clean digital image, no film grain, no noise.
The LEFT HALF of the frame stays dark and empty. Interrogation room mood.
No text. No people. No hands. No plates. No cheese. No color other than amber and
deep warm brown.
```

### 2. O corte (abertura do cardápio) — feito

Macro extremo. A coxinha se parte ao meio. A casquinha estilhaça em câmera lenta, o
recheio escorre, o vapor sobe contra a luz. Sem contexto, sem mesa, só textura.

Toca uma vez ao entrar na tela e para no último quadro. Em laço, a quebra repetida vira
desenho animado em vez de cinema.

> **A primeira geração saiu com o formato errado, e a culpa era do prompt.** A versão
> anterior dizia só "a golden fried Brazilian coxinha breaks apart in the middle", e o
> Veo devolveu um oval simétrico, tipo bolinho ou croquete — não uma coxinha. O modelo
> não sabe o formato pelo nome, e "breaks apart in the middle" ainda empurra para uma
> peça simétrica que abre no meio. O prompt abaixo descreve a silhueta e diz onde a
> quebra acontece. Se voltar redondo de novo, some com a palavra "coxinha" e descreva só
> a forma: é o nome que puxa o modelo para a média das imagens erradas.

```
Extreme macro slow motion. A single golden fried Brazilian coxinha, teardrop
shaped: a wide rounded belly at the bottom narrowing to one sharp pointed tip at
the top, like a small chicken drumstick. It splits open along its length, from
the pointed tip down, and the two halves lean apart. Both halves keep the
teardrop silhouette, wide at the base, pointed at the top. The crisp golden
breadcrumb crust shatters into visible crumbs. Creamy shredded chicken and melted
requeijão filling stretches and slowly falls. Hot steam rises against a hard amber
rim light. Pitch black background. 1000fps look, razor shallow depth of field.
Clean digital image, no film grain, no noise.
Not oval. Not round. Not a ball. Not a sphere. Not symmetric left to right.
No fire. No flames. No burning. Steam only, never fire.
No hands. No text. No plate. No people.
```

> **A segunda geração acertou a forma e inventou fogo.** No meio do clipe saía uma
> labareda de dentro da coxinha. Ninguém pediu: o modelo juntou "hot steam", "hard amber
> rim light" e "1000fps" e concluiu chama. Para um negócio de comida isso lê como
> queimado, e não é o que acontece quando você parte um salgado. Daí as negativas de
> fogo acima, e o `No table` saiu porque o Veo põe a superfície de qualquer jeito e ela
> ficou boa: ardósia escura, que combina com a página.

### 3. A esteira (Encomendas para Festa)

Travelling lateral lento e contínuo sobre uma bandeja lotada. Luz âmbar rasante. Foco
raso passeando de um salgado para o outro. Mostra volume, que é o que a linha de festa
vende.

```
Slow continuous lateral tracking shot across a large tray packed with assorted
golden Brazilian party snacks: coxinhas, risoles, small croquettes, mini pastéis.
Raking warm amber light from the left, deep shadows, black background.
Rack focus drifting from one snack to the next. Steam. Anamorphic,
shallow depth of field. Constant speed, no acceleration.
Clean digital image, no film grain, no noise.
No hands. No people. No text. No white plates. No bright kitchen.
```

### 4. O freezer (Congelados)

Porta de freezer abre e o ar gelado desce em névoa. **A luz de dentro é âmbar, não azul**
— é a subversão que amarra a seção mais fria do cardápio à paleta da marca.

```
A freezer door slowly opens in a dark room. Cold white fog rolls down and
outward across the floor. Inside, warm amber light glows on stacked clear
packages of frozen Brazilian snacks. The contrast between cold fog and warm
amber light is the subject. Slow push-in. Cinematic, high contrast.
Clean digital image, no film grain, no noise.
No people. No hands. No text. No blue light. No supermarket.
```

### 5. A entrega (contato / rodapé)

Noite, chuva no asfalto, farol de carro. Uma mão passa a caixa pela janela. Goodfellas de
salgado. Fecha o filme onde o site pede a ação.

```
Night, heavy rain on wet asphalt. Car headlights cut through the rain from
behind. A hand passes a plain cardboard box through a car window. Warm amber
light spills from inside the box. Steam mixes with rain. Slow motion, cinematic
noir, anamorphic lens flare, deep blacks.
Clean digital image, no film grain, no noise.
No faces. No text. No logos. No neon. No city skyline.
```

### Bloco de continuidade — colar no fim de TODOS

O Veo não guarda memória entre gerações. Sem isto, os cinco parecem cinco filmes
diferentes:

```
Consistent look across shots: single warm amber key light (#F5A524), deep warm
brown shadows (#120B08), no cool tones anywhere, anamorphic shallow depth of
field, no camera shake, clean digital image, no film grain, no noise.
Every coxinha is teardrop shaped: wide rounded base narrowing to one pointed tip,
like a small chicken drumstick. Never oval, never round, never a ball.
No fire, no flames, no burning anywhere. Steam only.
```

A linha do formato está aqui e não só no plano 2 de propósito: coxinha aparece em quatro
dos cinco planos, e o erro de forma aconteceu uma vez. Repetir a descrição custa uma
linha e evita gastar geração à toa.

---

## O que pedir para a ferramenta

| Item | Valor | Por quê |
|---|---|---|
| Proporção | 16:9 no hero, 4:5 nas seções | O hero é largo; as seções são lidas no celular |
| Resolução | 1080p ou mais | Dá margem para cortar e ainda ficar nítido |
| Duração | 5 a 8s | Limite do Veo, e o certo para loop |
| Áudio | tanto faz, eu removo | O navegador bloqueia autoplay com som |
| Marca d'água | **não pode ter** | Ver abaixo |

> **A marca d'água do plano gratuito.** O Veo Lite entrega 480p **com marca**. Marca
> d'água de IA no hero de um negócio real fica pior do que não ter vídeo nenhum, e cortar
> no enquadramento é aposta — nem sempre ela fica num canto fixo. São cinco clipes: o
> caminho honesto é assinar **um mês**, gerar tudo, cancelar. Sai mais barato que o
> estrago.

---

## Passo a passo

### 1. Gerar o plano 2 (o corte)

Cola o prompt do corte no Flow, junto com o bloco de continuidade. Baixa o arquivo.

### 2. Me mandar o arquivo

Anexa aqui no chat, ou joga numa pasta do Drive compartilhada com
`vinicius.silva@viamao.ifrs.edu.br` (é a conta que está conectada nesta sessão, não o
gmail).

### 3. Eu comprimo e mostro o número

```bash
npm run clipe -- arquivo-do-flow.mp4 corte --secao
```

Gera três arquivos em `public/cinema/` e **reprova sozinho** se passar do orçamento,
dizendo o que tentar e em que ordem:

| arquivo | o que é |
|---|---|
| `corte.webm` | VP9, o que quase todo mundo baixa |
| `corte.mp4` | H.264, para quem não tem VP9 |
| `corte-poster.webp` | o primeiro quadro, que é o LCP da seção |

Precisa de `ffmpeg` no sistema, ou `npm i -D ffmpeg-static`.

#### O que os arquivos de verdade ensinaram

Dois clipes voltaram do Flow antes de um entrar no site. Os dois com 8s, 1280×720, sem
marca d'água, e **sem grão** — medi a variação temporal numa faixa preta e deu 0,02, ou
seja, os prompts limpos funcionaram desde o começo.

**O primeiro** tinha o formato errado (oval, tipo bolinho) e foi descartado. Ainda assim
mediu o peso:

| | VP9/WebM | H.264/MP4 |
|---|---|---|
| 8s inteiros, CRF 40/30 | 683 KB | 605 KB |
| 8s inteiros, CRF 44/34 | 492 KB | 386 KB |
| 4s de ação, CRF 42/32 | 314 KB | 266 KB |

**O segundo** acertou a forma e é o que está no ar. Tinha uma labareda entre 4,21s e
5,2s; cortando antes dela sobra o arco inteiro da quebra, e o clipe fecha o orçamento no
CRF padrão:

```bash
npm run clipe -- arquivo.mp4 corte --secao --ate 4.15
# 338 KB webm, 300 KB mp4, pôster de 52 KB
```

O peso não é defeito: é vapor, farofa voando e a textura da farinha, que é conteúdo real.
Mas **quase sempre metade do clipe não tem ação nenhuma**, e é ela que paga a conta.
Cortar essa metade também deixa o plano melhor, porque ele passa a começar no instante em
que a coisa acontece.

> **Antes de cortar, ache onde está a ação — e onde está o defeito.** Uma grade de contato
> responde em um comando:
>
> ```bash
> ffmpeg -i arquivo.mp4 -vf "fps=2,scale=320:-1,tile=4x4" -frames:v 1 grade.jpg
> ```
>
> Dá 16 quadros de meio em meio segundo. E quando o defeito é de brilho (chama, estouro,
> flash), dá para achar o segundo exato medindo em vez de olhar:
>
> ```bash
> ffmpeg -i arquivo.mp4 -vf "fps=4,crop=260:300:510:60,signalstats,metadata=print" \
>   -f null - 2>&1 | grep -E "pts_time|YAVG"
> ```
>
> Foi assim que a chama apareceu como um pico de 96 para 166 entre 4,21s e 5,2s.

#### Laço que fecha: a costura

Um clipe de `loop` só fecha sem pulo se o último quadro for igual ao primeiro, e material
gerado nunca é — fumaça é caótica, não repete. Medido no plano da lâmpada, a diferença
entre o primeiro e o último quadro:

| | YAVG | pico |
|---|---|---|
| como veio do Flow | 6,86 | 176 |
| **costurado com 0,8s** | **1,40** | **83** |

O que sobra é ruído de compressão. A costura não aproxima, ela constrói: corta o rabo do
clipe e funde por cima da cabeça, de modo que `saída(0)` e `saída(fim)` são literalmente o
mesmo quadro do original. O preço é 0,8s de duração.

```bash
npm run clipe -- arquivo.mp4 lampada --laco 0.8
# 449 KB webm, 405 KB mp4, pôster de 28 KB — orçamento do hero é 600 KB
```

> **A costura quebrou o pôster, e eu só vi porque fui medir.** Com ela o vídeo passa a
> começar no segundo D−X, mas o pôster continuava saindo do segundo 0 do arquivo:
> diferença de pico 173 em 255. A página mostraria uma cena e o vídeo entraria noutra, com
> um pulo na hora de tocar. O pôster agora sai do mesmo caminho de filtro do vídeo.

Detalhe de ffmpeg que custou uma tentativa: o `xfade` recusa entrada sem taxa de quadros
constante, e o `trim` + `setpts` zera a base de tempo. Sem repor `fps=24` depois de cada
`trim`, o filtro nem monta — "current rate of 1/0 is invalid".

#### Flutuando, emoldurado ou de fundo: depende do que a cena tem

Isto decide como o clipe entra na página, e a resposta muda conforme o plano.

**Cena sem cenário** (o salgado no vazio preto): `mix-blend-screen` no contêiner. A cena é
um objeto claro sobre preto, e no modo screen o preto some contra o fundo — sobra o
salgado flutuando no escuro, sem borda de retângulo nenhuma. Medido na tela, a diferença
entre dentro e fora ficou em **2 de 255** por canal. Máscara de borda foi testada antes e
é pior: come as pontas do salgado junto.

**Cena com cenário** (mesa, chão, luz de ambiente): moldura de uma linha, `border
border-border`, a mesma dos cards do cardápio. É o caso do corte. A mesa de ardósia mede
Y≈70 contra Y≈19 do fundo, e no modo screen ela acenderia numa faixa clara atravessando o
quadro. Com cenário a cena é uma fotografia, e fotografia se emoldura.

**Cena de fundo, com texto por cima** (o hero): `preencher`, e aí o assunto é outro —
legibilidade. Ver abaixo.

Nos dois primeiros casos, **sem `preencher`**: espremer 16:9 numa faixa larga dá zoom no
meio do quadro e joga fora a composição, que é o que a cena tem de melhor.

#### Texto sobre vídeo: o que o hero custou

Botar o clipe no hero quebrou a legibilidade, e o número é feio:

| Onde | Contraste medido | Exigido |
|---|---|---|
| índice de preços, celular | **1,01 a 1,51** | 4,5 |
| eyebrow "Porto Alegre", celular | **1,33** | 4,5 |
| índice de preços, desktop | **2,75 a 3,80** | 4,5 |

O véu do hero tinha sido calibrado para o shader, que é escuro à direita. O clipe não é: a
mesa de metal reflete a luz e ocupa a metade de baixo do quadro, onde o conteúdo pousa.

**E `npm run check` passou.** A conferência de contraste que existia lê a cor de fundo
declarada no CSS subindo a árvore até achar algo opaco — atrás do texto tem vídeo, e CSS
não sabe disso. Ela achava `#120b08` e concluía 9,5:1.

Três consertos, nessa ordem:

1. **O índice de preços saiu do hero.** Era a única coisa em cima do lado claro do clipe, e
   repetia linha por linha o que os cards do cardápio mostram logo abaixo. Uma
   simplificação de verdade, não uma perda.
2. **Véu de baixo para cima**, com as paradas escolhidas por medição e não por gosto: todo
   o texto do hero fica abaixo de 60% da altura (a seção é `justify-end`), então o véu é
   forte até ali e cai rápido acima, que é onde a lâmpada mora.
3. **Enquadramento no celular.** Em 390×844 o `object-cover` escala o clipe para 1500×844:
   a altura fecha exata e só a largura sobra, então o corte é horizontal e `object-top` não
   faria nada. Com a lâmpada em x≈800 de 1280, a conta dá 66% — conferido na tela em 375,
   390 e 430.

E a ferramenta que faltava: **`scripts/checks/contraste-pintado.mjs`**, que mede o
contraste contra o PIXEL, não contra o CSS. Ela pinta o texto de `transparent`, captura, e
amostra o fundo real de cada linha de texto. Roda no celular e no desktop, dentro do
`npm run check`.

> **Dois erros meus que ela mesma pegou.** Primeiro escondi o texto com
> `visibility: hidden`, o que apaga também o fundo do próprio elemento — um botão âmbar
> passou a ser medido contra a página atrás dele e acusou 1,00:1 estando perfeito.
> Segundo, media a caixa do ELEMENTO: um `<p>` é bloco e atravessa 1184px até a lâmpada,
> então acusava 2,11:1 num texto de 375px que está em 9,58:1. A medida certa é a do nó de
> texto, com `Range.getClientRects()`, que dá um retângulo por linha desenhada.

### 4. Registrar no manifesto

Em `src/lib/media/clipes.ts`, com as dimensões que o script reportou:

```ts
export const clipes: Clipe[] = [
  {
    id: "corte",
    descricao:
      "Uma coxinha se parte ao meio e mostra o frango desfiado por dentro, com vapor subindo",
    largura: 1280,
    altura: 720,
    modo: "unico",
  },
]
```

Registrar aqui é o que põe o clipe no ar. Com a lista vazia, o site funciona exatamente
como hoje e nenhum byte de vídeo é pedido.

A descrição diz **o que a imagem mostra**, não qual item do cardápio ela é. A cena tem
frango desfiado e queijo derretido puxando — isso é o croquete c/ requeijão, não a
coxinha de frango, que são linhas diferentes e preços diferentes. Nomear o produto errado
aqui é prometer no site uma coisa e entregar outra na porta.

### 4b. Onde ele entra na página

"Clássicos Fritos" não é uma seção: é o primeiro card dentro de `FestaSection`. O lugar
do plano é **acima do título da seção**, como cartela de abertura do cardápio — o
visitante chega da faixa de sabores, encontra a quebra, e só então a página pede uma
decisão.

```tsx
// src/components/sections/festa-section.tsx, antes do <SectionHeading>
<div className="mx-auto mb-14 max-w-6xl px-4 sm:px-6 lg:px-8">
  <div className="max-w-3xl">
    <CinemaLoop clipe="corte" className="border border-border" />
  </div>
</div>
```

**A largura e o alinhamento não são chute.** Na largura total do cardápio a peça ocupava
dois terços da tela no desktop e empurrava o título inteiro para fora: quem descia do
hero levava uma tela cheia de vídeo antes de qualquer informação. Centralizada, brigava
com o título, que é alinhado à esquerda. Compartilhando a margem esquerda com ele, as
duas viram a mesma peça. No celular nada disso muda, porque lá a coluna já é mais
estreita que o limite.

Testado no navegador em 390, 768, 1024 e 1440: sem rolagem lateral, CLS zero, LCP de
1,0 s e 224 KB de JavaScript contra o build de produção, e com movimento reduzido nenhum
byte de vídeo é pedido.

> **O caminho do arquivo precisa do prefixo do site.** No GitHub Pages o site mora em
> `/DON-ENRICO-/`, e o Next NÃO prefixa caminho escrito à mão para `public/`. Por isso o
> componente passa por `arquivoPublico()` (`src/lib/caminho-publico.ts`) antes de montar
> o `src`. O manifesto guarda o caminho cru de propósito, porque é lido direto pelo Node
> nas conferências. Quem garante que ninguém esquece é o `npm run check:export`, que lê o
> HTML exportado e reprova caminho sem prefixo ou apontando para arquivo inexistente.

### 5. Conferir

```bash
npm run check:midia   # arquivos, orçamento, dimensões — responde em um segundo
npm run check         # navegador, incluindo a conferência de movimento reduzido
```

### 6. Se o número fechar, gerar os outros quatro

Com o bloco de continuidade em todos, para parecerem o mesmo filme.

---

## O encanamento que já existe

Tudo abaixo está mergeado e testado. Não precisa mexer.

| Arquivo | O que faz |
|---|---|
| `scripts/comprimir-clipe.mjs` | Transforma o arquivo do Flow nos três do site, com as receitas medidas |
| `src/components/media/cinema-loop.tsx` | O componente que toca o clipe |
| `src/lib/media/clipes.ts` | O manifesto — fonte única, hoje vazio |
| `scripts/checks/midia.mjs` | Conferência estática e de navegador |
| `public/cinema/` | Onde os arquivos moram |

### As quatro regras do componente

1. **O pôster é o LCP, o vídeo nunca.** O pôster é imagem estática que já vem no HTML; o
   vídeo entra depois, por cima. Se o vídeo fosse o elemento principal, o LCP sairia de
   ~900 ms para o tempo de baixar megabytes no 4G — e LCP é o que decide se a pessoa
   espera ou fecha a aba.
2. **Movimento reduzido não baixa vídeo nenhum. Aparelho fraco baixa.** O `<video>` nem é
   montado quando a pessoa pediu menos movimento no sistema, então o navegador não tem o
   que pedir.

   > **Esta regra já esteve errada, e o dono do site foi quem percebeu.** A primeira
   > versão tratava aparelho fraco igual a movimento reduzido: uma chave só, ou anima
   > tudo ou nada. Medido, um aparelho reportando 2 núcleos ou 2 GB não pedia vídeo
   > nenhum — ou seja, o Android de entrada, que é boa parte do público, ficava sem a
   > peça principal da página.
   >
   > O motivo original da trava era o shader WebGL, que é caro de verdade. Vídeo não é a
   > mesma coisa: todo celular dos últimos dez anos decodifica H.264 em hardware, e um
   > `<video>` de fundo custa menos que o shader que ele substituiu.
   >
   > Hoje são três níveis. Aparelho fraco perde Lenis, ScrollTrigger e shader, e **fica
   > com o vídeo**. Só a preferência declarada tira tudo — porque isso é pedido da
   > pessoa, e o resto é palpite sobre a máquina dela.
   >
   > O `npm run check` abre uma aba fingindo 2 núcleos e 2 GB e cobra que o vídeo seja
   > pedido, para a regra não voltar sozinha.
3. **Só carrega ao entrar na tela**, e pausa ao sair. Cinco clipes decodificando junto
   esquenta o celular e come bateria por um fundo que ninguém está olhando.
4. **Proporção declarada sempre.** Sem largura e altura a página pula quando o vídeo
   chega, e o CLS — hoje zero — estoura.

O hero cai em três níveis: **clipe** quando existir, senão o **shader de calor**, senão o
**gradiente em CSS**, que funciona até sem JavaScript.

### Orçamento

| | limite |
|---|---|
| hero | 600 KB |
| clipe de seção | 350 KB |
| soma de tudo | 2 MB |

O `npm run check` reprova acima disso, e também reprova se com `prefers-reduced-motion`
qualquer vídeo for baixado. A conferência olha **requisição, não DOM**: o download é o que
custa os megabytes do cliente no 4G, e pode acontecer sem nenhum `<video>` visível.

---

## Sobre o HeyGen

É ferramenta de **avatar falante** — porta-voz, não comida.

Avatar de IA fingindo ser gente num negócio familiar real é exatamente a cara de IA que a
gente passou o projeto removendo; foi por isso que os depoimentos inventados saíram.

Tem um uso que **não** é desonesto: o **Don Enrico** não é uma pessoa, é o personagem da
logo. Um Don animado falando é legítimo porque ninguém confunde com gente de verdade. Mas
sincronia labial em cima de logo ilustrada raramente fica boa, e avatar genérico da
biblioteca fica pior que nada.

**Fora do site. Se for usar, é no Instagram** — lá vídeo falado funciona e o custo de
errar é um post, não a primeira impressão da marca.

---

## As fotos dos produtos

Caminho separado e independente deste. `public/produtos/` está pronto e testado: salvar o
arquivo e apontar `image:` no `menu.ts`. Hoje todo card mostra o bloco da marca no lugar
da foto, e é o maior buraco visual do site.
