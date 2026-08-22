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

```
Extreme macro slow motion. A golden fried Brazilian coxinha breaks apart in the
middle. The crisp golden crust shatters into visible crumbs. Creamy shredded
chicken and melted requeijão filling stretches and slowly falls. Hot steam rises
against a hard amber rim light. Pitch black background. 1000fps look, razor
shallow depth of field. Clean digital image, no film grain, no noise.
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
```

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
