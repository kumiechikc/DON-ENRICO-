# Don Enrico Lanches

Site de encomendas da Don Enrico Lanches — salgados para festa e congelados, em Porto
Alegre. O cliente monta o pedido escolhendo linha, quantidade e sabores, e a mensagem
sai pronta no WhatsApp da empresa.

**No ar:** https://kumiechikc.github.io/DON-ENRICO-

## Rodar

```bash
npm install
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run check` | responsividade, fluxo do pedido, contraste e acessibilidade |
| `npm run check -- --shots` | idem, salvando capturas em `.checks/` |
| `npm run lint` | ESLint |
| `npm run build` | build de produção |
| `GITHUB_PAGES=true npm run build` | **o build que realmente vai ao ar** |

Sempre valide com a variável `GITHUB_PAGES` antes de dar algo por pronto: o export
estático tem restrições que o build comum não expõe.

## Como está montado

Next.js 16 (App Router) com export estático no GitHub Pages. Não há servidor nem banco:
o cardápio vive em `src/lib/data/menu.ts` e o pedido é montado no navegador.

```
src/app/           páginas, tokens de CSS, sitemap, robots, imagem de preview
src/components/    seções, cards de produto, carrinho, layout
src/lib/data/      o cardápio — fonte única de preço e sabor
src/lib/cart/      carrinho e geração da mensagem de WhatsApp
scripts/checks/    a suíte de verificação
```

## Antes de mexer

- **`docs/DESIGN.md`** — o sistema de design e o motivo de cada escolha. Várias parecem
  arbitrárias e não são (o âmbar não pode ser texto, o vermelho tem função específica).
- **`docs/PERGUNTAS-CLIENTE.md`** — o que ainda falta saber do dono. Boa parte do que o
  site não mostra está ausente de propósito.

**Regra que vale mais que todas:** nada de conteúdo fabricado. Nenhum depoimento,
horário, endereço, prazo ou estatística entra sem ter vindo do dono. Onde falta dado, a
seção sai ou fica marcada em comentário para preencher depois.

## Pendências

- Fotos dos produtos e a logo em arquivo (todos os espaços estão com bloco reservado)
- Respostas do Bloco 1 de `docs/PERGUNTAS-CLIENTE.md`: regra de sabores, prazo de
  encomenda, entrega, horário e pagamento
- A regra "máximo dois sabores por cento" é ambígua para 25 e 50 unidades; os valores em
  `menu.ts` são leitura conservadora e precisam de confirmação

## Planejado, não implementado

`docs/ARQUITETURA-BACKEND.md` (cardápio editável, registro de pedidos, automação),
`agent/AGENT.md` e `agent/MEMORY.md` (atendente de WhatsApp), `docs/INSTAGRAM.md`
(perfil e captação).
