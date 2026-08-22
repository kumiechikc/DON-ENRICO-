# Os clipes do filme

Vazio até os planos serem gerados. O caminho inteiro está pronto e foi verificado
com um clipe sintético: 62 KB em VP9, 148 KB em H.264, pôster de 8 KB.

## Para colocar um clipe no ar

```bash
# 1. comprimir (precisa de ffmpeg no sistema, ou: npm i -D ffmpeg-static)
npm run clipe -- ~/Downloads/veo-lampada.mp4 lampada
npm run clipe -- ~/Downloads/veo-corte.mp4 corte --secao

# 2. registrar em src/lib/media/clipes.ts com as dimensões que o script reportou

# 3. conferir
npm run check:midia
npm run check
```

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
| soma de tudo | 2 MB |

O `npm run check` reprova acima disso, e também reprova se com
`prefers-reduced-motion` qualquer vídeo for baixado.
