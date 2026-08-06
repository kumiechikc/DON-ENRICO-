# Fotos de produto

Coloque as fotos aqui e aponte o caminho em `src/lib/data/menu.ts` (campo `image`).
Enquanto o campo estiver vazio, o site mostra um placeholder da marca — nada quebra.

Como publicar uma foto:

1. Salve o arquivo como `public/produtos/<id>.jpg` (use o mesmo `id` do item em `menu.ts`).
2. Em `menu.ts`, adicione `image: "/produtos/<id>.jpg"` ao item.

Formato recomendado: JPG ou WebP, fundo limpo, no máximo ~300 KB por foto.
Proporção: 16:9 para as categorias de festa, 4:3 para os congelados e para o box.

## Arquivos esperados

| Onde aparece | id / arquivo |
|---|---|
| Box Degustação | `box-degustacao.jpg` |
| Encomendas para festa | `classicos-fritos.jpg`, `assados-especiais.jpg`, `folhados-premium.jpg`, `selecao-don-enrico.jpg` |
| Congelados para fritar | `coxinha-frango.jpg`, `calabresa-cheddar.jpg`, `bolinha-queijo.jpg`, `risoles-presunto-queijo.jpg`, `enrolado-salsicha.jpg`, `croquete-requeijao.jpg`, `pastelzinho-carne.jpg`, `pastelzinho-queijo.jpg`, `mini-churros.jpg`, `sortidos.jpg` |
| Congelados assados | `esfiha-frango.jpg`, `esfiha-carne.jpg`, `empadinha-frango.jpg`, `empadinha-brocolis.jpg`, `enrolado-salsicha-assado.jpg`, `pastelzinho-carne-assado.jpg`, `mini-pizza-mussarela.jpg`, `mini-pizza-frango.jpg`, `mini-pizza-calabresa.jpg` |
| Seção "Sobre" | `sobre.jpg` (o caminho fica em `src/components/sections/sobre-section.tsx`) |
