# Fotos de produto

Onde as fotos do cliente entram. Enquanto uma linha não tem foto, **nenhum espaço vazio
aparece no site** — o bloco de imagem só existe quando há foto registrada. Nada quebra e a
página não fica com cara de inacabada.

## Como publicar uma foto

```bash
node scripts/tratar-foto.mjs <original> <id> --corte L:A:X:Y
```

O script recorta, corrige o que dá para corrigir e exporta duas larguras em WebP. Depois:

1. registre a foto em `src/lib/media/fotos.ts`, com as dimensões que o script reportou;
2. aponte o `id` no campo `image` da linha, em `src/lib/data/menu.ts`;
3. `npm run check:midia`.

O manifesto existe pelo mesmo motivo do de clipes: as dimensões viram os atributos
`width` e `height` da tag, e são elas que reservam o espaço antes de a imagem chegar. A
conferência mede o ARQUIVO e compara com o que está escrito ali — foi assim que ela pegou
uma altura anotada como 675 num arquivo de 676.

## O que o script NÃO faz

Ele não inventa pixel. Nada de "melhorar com IA": um modelo que redesenha a coxinha
entrega uma coxinha que não é a da casa, e quem pediu confiando na foto recebe outra
coisa. A qualidade máxima da saída é a qualidade da entrada.

Consequência prática: **peça sempre o arquivo original**. Foto que chega pelo WhatsApp já
perdeu metade dos pixels no caminho — as que chegaram assim aqui vieram com 0,11 a 0,16
byte por pixel, quando uma foto de celular sai da câmera com dez vezes isso. Mandar como
"documento" em vez de como "foto" preserva o arquivo, e é de graça.

## Onde a foto aparece hoje

| Local | Id esperado | Proporção | Situação |
|---|---|---|---|
| Box Degustação | `box-degustacao` | 16:9 | no ar |
| Clássicos Fritos | `classicos-fritos` | 16:9 | no ar |
| Assados Especiais | `assados-especiais` | 16:9 | falta |
| Folhados Premium | `folhados-premium` | 16:9 | falta |
| Seleção Don Enrico | `selecao-don-enrico` | 16:9 | falta |
| Como encomendar | `encomenda-pronta` | 16:9 | no ar |

As linhas de **congelados não mostram foto** — são 19 sabores em lista compacta, e
miniatura ali viraria ruído visual e 19 requisições de imagem.

## Formato

- **WebP**, gerado pelo script. Teto de 200 KB na versão grande e 100 KB na estreita.
- Proporção **16:9**. O script não amplia: recorte com menos de 1200 px sai no tamanho
  que tem, porque esticar só espalha o borrão da compressão.

## Antes de publicar

A foto precisa ser **do produto real da Don Enrico**, e a cena precisa bater com a linha
em que ela é pendurada. Trocar de linha para preencher um espaço vazio é prometer um
salgado e entregar outro.

Duas fotos enviadas ficaram de fora por essa regra. O motivo de cada uma está escrito no
fim de `src/lib/media/fotos.ts`.
