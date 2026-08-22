# A mídia em movimento

Duas coisas moram nesta pasta, e elas são diferentes:

- **Clipes** (`.webm` + `.mp4` + `-poster.webp`) — vídeo que toca sozinho.
- **Sequências** (`.webp`) — uma tira de quadros lado a lado que avança conforme
  a página rola. Quem dá o ritmo é o dedo de quem rola.

Hoje mora aqui o plano 2, **o corte**: uma coxinha se partindo, 4,15s, 338 KB em
VP9 e 300 KB em H.264, com pôster de 52 KB. Ele toca uma vez ao entrar na tela e
para no último quadro.

O caminho das sequências continua pronto e sem uso, verificado com uma tira
sintética de 5 quadros de 274 px e o recorte conferido pixel a pixel.

## Para colocar um clipe no ar

```bash
# 1. comprimir (precisa de ffmpeg no sistema, ou: npm i -D ffmpeg-static)
npm run clipe -- ~/Downloads/veo-lampada.mp4 lampada
npm run clipe -- ~/Downloads/veo-corte.mp4 corte --secao

# cortando o trecho e ajustando a qualidade, quando estourar o orçamento
npm run clipe -- ~/Downloads/veo-corte.mp4 corte --secao --de 2.5 --ate 6.5 --crf 42

# 2. registrar em src/lib/media/clipes.ts com as dimensões que o script reportou

# 3. conferir
npm run check:midia
npm run check
```

## Para colocar uma sequência no ar

```bash
# 1. recortar e remontar com largura exata
npm run sequencia -- ~/Downloads/coxinha-tira.png corte 5

# 2. copiar a entrada que o script imprime para src/lib/media/sequencias.ts

# 3. conferir
npm run check:midia
npm run check
```

O passo de recortar e remontar não é enfeite. A primeira tira que chegou aqui
tinha 1376 px para 5 quadros, e 1376 ÷ 5 = 275,2. Sem número inteiro cada passo
desalinha um pouco mais que o anterior, e no último quadro aparece uma fatia do
vizinho. O script mede o arquivo, recorta cada quadro na posição real e remonta
com largura garantidamente divisível — e o `check:midia` mede o arquivo de novo
para confirmar, porque conferir pelo manifesto seria comparar a anotação com ela
mesma.

## O que decide o peso

**Grão de filme.** Medido: a mesma cena de 6s dá 5.096 KB com grão e 64 KB sem.
Oitenta vezes. Grão é ruído que muda a cada quadro, então o codec perde a
compressão temporal inteira, que é de onde vem toda a economia de vídeo.

Por isso o prompt do Veo pede `clean digital image, no film grain, no noise`, e o
grão entra depois pela camada `.grain` do `globals.css`, que já cobre a página
inteira e custa zero byte.

## Orçamento

| | limite |
|---|---|
| hero | 600 KB |
| clipe de seção | 350 KB |
| soma dos clipes | 2 MB |
| sequência | 250 KB |

O `npm run check` reprova acima disso. Reprova também se com
`prefers-reduced-motion` qualquer vídeo for baixado ou qualquer sequência sair do
último quadro, e se o HTML do servidor não trouxer o último quadro — que é o que
aparece para quem não roda JavaScript.
