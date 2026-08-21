# Sistema de design — Don Enrico Lanches

Registro das decisões visuais e do porquê de cada uma. **Leia antes de mexer no
visual**, principalmente se for mudar cor ou tipografia — várias escolhas aqui parecem
arbitrárias e não são.

---

## A direção: "cartaz de boteco"

A marca é um Don de chapéu com o slogan "o sabor que impõe respeito", e os encartes são
cartaz de rua com tipo pesado. O site precisa soar assim: **confiante, direto,
impresso** — não app de delivery, não restaurante fino.

Uma decisão executada até o fim, com a ousadia concentrada num lugar só e o resto
quieto. Sem gradiente decorativo, sem animação de scroll, sem 3D.

---

## Duas escolhas que parecem erradas e não são

### 1. Fundo claro, não escuro
O site já foi quase-preto com laranja. Foi trocado de propósito.

**Comida frita em fundo escuro lê como gordurosa e mal iluminada.** Toda marca séria de
comida fotografa e apresenta em fundo claro. E as fotos ainda vão chegar — elas vão
ficar muito melhores sobre creme do que sobre preto.

De quebra, "quase-preto + accent ácido" é um dos visuais mais batidos de site gerado
por IA. Fugir dele foi parte do objetivo.

### 2. Archivo Black, não uma serifa elegante
O site já usou Playfair Display SC. É uma serifa de **alta gastronomia** — diz "menu
degustação de sete tempos". A Don Enrico vende salgado de festa a R$ 39,90. A
tipografia estava vestindo terno num negócio de boteco.

Archivo Black tem DNA de tipo de madeira, que é a voz dos encartes reais. Uma
superfamília só (Black para título, Archivo para texto) mantém coesão com dois arquivos
de fonte apenas.

---

## Paleta

Todas as razões abaixo foram **medidas**, não estimadas.

| Token | Valor | Onde usar |
|---|---|---|
| `--bg` | `#FDF7EF` | fundo da página |
| `--surface` | `#FFFFFF` | cards |
| `--surface-2` | `#F6EADB` | faixas alternadas |
| `--fg` | `#241610` | texto (16.48:1 sobre bg) |
| `--fg-muted` | `#6B5648` | texto secundário (6.47:1) |
| `--brand` | `#E8940C` | **só preenchimento** |
| `--brand-deep` | `#9A5B06` | texto e traço em âmbar (5.09:1) |
| `--accent` | `#C1121F` | CTA de conversão |
| `--border` | `#E4D5C3` | divisória decorativa |
| `--border-strong` | `#9D8264` | limite de controle (3.39:1) |

### A regra do âmbar
**`--brand` nunca pode ser texto pequeno nem traço fino sozinho.** Ele alcança só
2.27:1 sobre o creme — reprova o mínimo de 3:1 para componente de UI.

Âmbar entra como **bloco preenchido com `--fg` por cima** (7.24:1, aprovado). Quando
precisar de âmbar em texto ou linha, use `--brand-deep`.

> Já errei isso uma vez neste projeto: pintei os números do "Como encomendar" em
> `--brand` e a suíte reprovou em 2.04:1. O medidor existe justamente para isso.

### A regra do vermelho
`--accent` é **só o momento de ir para o WhatsApp**: CTA do hero, botão de contato,
enviar pedido. Não é a cor de "qualquer botão".

Os botões de "Adicionar" dos cards são `--fg` (escuro). Isso cria hierarquia real:
**escuro = montar o pedido, vermelho = fechar o pedido.** Quando o vermelho estava em
tudo, virou a mesma poluição que o gradiente antigo, só de outra cor.

### Duas bordas, de propósito
`--border` é divisória decorativa e pode ser suave. `--border-strong` é o limite de um
controle clicável e **precisa** de 3:1, porque às vezes é o único indicador de que
aquilo é um botão. Não troque um pelo outro.

---

## Tipografia

- `.type-display` — Archivo Black, caixa alta, `letter-spacing: -0.02em`, `line-height:
  0.95`. Títulos e números grandes.
- `.type-label` — Archivo 700, caixa alta, `letter-spacing: 0.12em`. Sobrelinhas e
  rótulos pequenos.
- Corpo — Archivo normal. Nunca abaixo de 14px, e 16px no texto corrido.

Archivo Black tem só o peso 400: o peso vem do desenho da fonte, não do `font-weight`.

---

## Regras que não se negociam

1. **Zero conteúdo fabricado.** Nada de depoimento, horário, endereço, estatística ou
   selo que não tenha vindo do dono. Onde falta dado, a seção sai ou fica marcada em
   comentário — nunca vira texto inventado na página.
2. **Nada de gradiente decorativo.** Cor chapada.
3. **Nada de emoji como ícone.** Lucide, ou SVG próprio (os ícones de marca do lucide
   foram removidos na v1 — WhatsApp e Instagram são componentes nossos).
4. **Alvo de toque de 44px** em qualquer coisa clicável.
5. **Foco sempre visível.** Anel de 3px, nunca removido.
6. **Sem animação de scroll.** Cartaz impresso não faz fade-in. Transição só como
   resposta a interação (hover, foco).
7. **Medir, não achar.** `npm run check` mede contraste no que o navegador pintou.

---

## Estrutura

`page.tsx` é Server Component. O `SiteShell` é a única fronteira cliente e recebe as
seções por `children`, então o cardápio inteiro continua HTML estático — só carrinho,
seletor de sabores e menu viram JavaScript.

Não transforme uma seção em `"use client"` sem necessidade real de estado.

---

## Como verificar

```bash
npm run check           # responsividade, pedido, contraste, acessibilidade
npm run check -- --shots  # salva capturas em .checks/
npm run lint
GITHUB_PAGES=true npm run build   # o build que realmente vai ao ar
```

Sempre rode o build com `GITHUB_PAGES=true` antes de dar por pronto: o export estático
tem restrições que o `next build` comum não expõe.
