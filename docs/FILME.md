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

| # | Plano | Onde | Duração | Modo |
|---|---|---|---|---|
| 1 | A lâmpada | hero | 6s | loop |
| 2 | O corte | Clássicos Fritos | 5s | uma vez |
| 3 | A esteira | Encomendas para Festa | 8s | loop |
| 4 | O freezer | Congelados | 6s | loop |
| 5 | A entrega | contato / rodapé | 8s | loop |

**Comece pelo 2.** É o que dá mais fome, e serve para confirmar o peso de um clipe real
antes de gastar as outras quatro gerações. Se só um for feito, é esse.

### 1. A lâmpada (hero)

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

### 2. O corte (Clássicos Fritos) — comece por aqui

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
No hands. No text. No plate. No table. No people.
```

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

#### O que o primeiro arquivo de verdade ensinou

O clipe que voltou do Flow tinha 8s, 1280×720, H.264, sem marca d'água. **Sem grão** —
medi a variação temporal numa faixa preta e deu 0,02, ou seja, os prompts limpos
funcionaram. Ainda assim estourou:

| | VP9/WebM | H.264/MP4 |
|---|---|---|
| 8s inteiros, CRF 40/30 | 683 KB | 605 KB |
| 8s inteiros, CRF 44/34 | 492 KB | 386 KB |
| **4s de ação, CRF 42/32** | **314 KB** | **266 KB** |

O peso não era defeito: era vapor, farofa voando e a textura da farinha, que é conteúdo
real. Mas **metade do clipe não tinha ação nenhuma** — 2,5s de coxinha quase parada no
começo e 1,5s de vapor à deriva no fim. Cortar essa metade resolveu quase tudo, e ainda
deixou o plano melhor: agora ele começa no instante em que a quebra começa.

Por isso o script ganhou as opções de corte:

```bash
npm run clipe -- arquivo.mp4 corte --secao --de 2.5 --ate 6.5 --crf 42
```

`--de` e `--ate` cortam em segundos, `--crf` é um botão só de qualidade (o H.264
acompanha dez pontos abaixo). O pôster sai do primeiro quadro **do trecho**, não do
arquivo original.

> **Antes de cortar, ache onde está a ação.** Uma grade de contato responde em um
> comando:
>
> ```bash
> ffmpeg -i arquivo.mp4 -vf "fps=2,scale=320:-1,tile=4x4" -frames:v 1 grade.jpg
> ```
>
> Dá 16 quadros de meio em meio segundo. Os que forem iguais ao vizinho são os que você
> corta.

#### O preto da cena e o preto da página

Medido: o preto do vídeo fica em Y≈17, que é o preto de vídeo (16) e não o preto do CSS.
O fundo da página é `#120b08`. Colar o retângulo do vídeo em cima disso deixaria uma
borda visível.

A saída é `mix-blend-screen` no contêiner: a cena é um objeto claro sobre preto, e no
modo screen o preto some contra o fundo. Medido na tela, a diferença entre dentro e fora
do retângulo ficou em **2 de 255** por canal — invisível. Máscara de borda foi testada
antes e é pior: come as pontas do salgado junto.

E **sem `preencher`**: espremer 16:9 numa faixa larga dá zoom no meio do quadro e joga
fora a composição, que é o que a cena tem de melhor.

### 4. Registrar no manifesto

Em `src/lib/media/clipes.ts`, com as dimensões que o script reportou:

```ts
export const clipes: Clipe[] = [
  {
    id: "corte",
    descricao: "Uma coxinha se parte ao meio e o recheio escorre",
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
<div className="mx-auto mb-12 w-full max-w-4xl px-4 sm:px-6 mix-blend-screen">
  <CinemaLoop clipe="corte" />
</div>
```

Testado no navegador em 390, 768, 1024 e 1440: sem rolagem lateral, CLS zero, LCP de
1,0 s contra o build de produção, e com movimento reduzido nenhum byte de vídeo é pedido.

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
2. **Aparelho fraco e movimento reduzido não baixam vídeo nenhum.** O `<video>` nem é
   montado, então o navegador não tem o que pedir. Quem está no Android de entrada
   economiza o download inteiro e vê o pôster, que é uma imagem boa.
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
