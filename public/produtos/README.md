# Fotos de produto

Onde as fotos do cliente entram. Enquanto não há foto, **nenhum espaço vazio aparece no
site** — o bloco de imagem só é renderizado quando existe arquivo apontado. Nada quebra
e a página não fica com cara de inacabada.

## Como publicar uma foto

1. Salve o arquivo em `public/produtos/` usando o `id` do item como nome.
2. Em `src/lib/data/menu.ts`, adicione `image: "/produtos/<arquivo>"` ao item.
3. Rode `npm run check` e confira.

Exemplo:

```ts
{
  id: "classicos-fritos",
  image: "/produtos/classicos-fritos.jpg",
  name: "Clássicos Fritos",
  ...
}
```

## Onde a foto aparece hoje

| Local | Arquivos esperados | Proporção |
|---|---|---|
| Encomendas para festa | `classicos-fritos`, `assados-especiais`, `folhados-premium`, `selecao-don-enrico` | 16:9 |
| Box Degustação | `box-degustacao` | 16:9 |

As linhas de **congelados não mostram foto** — são 19 sabores em lista compacta, e
miniatura ali viraria ruído visual e 19 requisições de imagem. Se um dia quisermos,
é preciso voltar o campo `image` em `FlavorPack` junto com o componente que o lê.

## Formato

- **JPG ou WebP**, no máximo ~300 KB por foto (é celular em 4G do outro lado).
- Proporção **16:9**, mínimo 1200px de largura.
- Fundo limpo, luz natural. O guia de como fotografar está em
  `docs/PERGUNTAS-CLIENTE.md`, item 2.2.

## Antes de publicar

As fotos precisam ser **dos produtos reais da Don Enrico**. Se forem de banco de
imagens, não podem ir para o site como se fossem do produto — é propaganda enganosa e
pode dar problema de direito autoral. Essa pergunta está no item 2.3 do questionário e
ainda não foi respondida.
