# Sistema de design — Don Enrico Lanches

Registro das decisões visuais e técnicas, e do porquê de cada uma. **Leia antes de mexer
no visual ou no movimento.** Várias escolhas aqui parecem arbitrárias e não são — foram
tomadas depois de medir, e algumas depois de errar.

---

## A direção: chiaroscuro quente

A marca é um Don de chapéu com o slogan "o sabor que impõe respeito". Isso é um
**personagem de cinema**, não uma padaria. O site trabalha a linguagem de cartaz de
filme de máfia cruzada com boteco brasileiro: sombra quente, luz âmbar rasante, tipo
pesado, grão de filme.

### Por que fundo escuro, se comida frita costuma pedir fundo claro

Esta é a decisão mais contraintuitiva do projeto, e ela já foi tomada nos dois sentidos
neste repositório. O que estraga fritura é fundo escuro **frio e chapado**. Escuro com
**luz quente direcional** é exatamente como fotógrafo de comida ilumina fritura para
marca premium — o dourado ganha brilho contra a sombra.

Ganho concreto e mensurável: na paleta clara anterior o âmbar da marca alcançava 2.27:1
e **não podia ser texto nem traço fino**. Aqui ele é 9.55:1 — vira cor de texto, de
borda e de destaque. A paleta escura devolveu a cor da marca ao vocabulário.

---

## Paleta

Todas as razões abaixo foram **medidas**, não estimadas.

| Token | Valor | Onde usar |
|---|---|---|
| `--bg` | `#120B08` | fundo (sombra quente, nunca preto puro) |
| `--surface` | `#1C110C` | cards |
| `--surface-2` | `#2A1A12` | superfície elevada |
| `--fg` | `#F8EFE3` | texto — 17.13:1 |
| `--fg-muted` | `#B9A08B` | texto secundário — 7.86:1 |
| `--amber` | `#F5A524` | a luz da cena — 9.55:1, pode ser texto |
| `--amber-bright` | `#FFB93D` | anel de foco — 11.38:1 |
| `--red` | `#F25C63` | acento claro — 5.17:1 mesmo sobre surface-2 |
| `--red-deep` | `#C1121F` | fundo de botão (branco por cima = 6.22:1) |
| `--focus-ring` | `#FFB93D` | contorno de foco |

### Hierarquia de ação
- **Creme sobre escuro** (`bg-fg text-bg`) = ação principal do card. Lê como caro.
- **Âmbar** = seleção e destaque.
- **Vermelho** = reservado, quase não aparece.

O vermelho saturado repetido em cinco botões sobre fundo escuro lia como alarme e
brigava com o âmbar. Se voltar a tentação de usar vermelho em botão, lembre-se de que
já foi testado e reprovado visualmente.

### Duas armadilhas de nome
- O token de foco chama-se `--focus-ring`, **não `--ring`**. `--ring` colide com o
  namespace do Tailwind v4: `var(--ring)` resolvia vazio dentro dos utilitários, e uma
  declaração com `var()` inválida é descartada inteira — inclusive com `!important`.
- A regra de foco usa seletores explícitos **e `!important`**, de propósito. O preflight
  do Tailwind aplica `outline: 0 solid` em tudo. Foco visível é garantia de
  acessibilidade, não pode depender de disputa de cascata.

---

## Tipografia

Uma superfamília: **Archivo Black** para display, **Archivo** para texto.

- `.type-display` — caixa alta, `letter-spacing: -0.03em`, `line-height: 0.88`.
- `.type-label` — 700, caixa alta, `letter-spacing: 0.16em`.

### Política de carregamento diferente para cada uma

| Fonte | `display` | Motivo |
|---|---|---|
| Archivo Black (título) | `swap` | ali a fonte **é** a identidade; vale esperar |
| Archivo (corpo) | `optional` | evita o reflow que causava todo o CLS |

Com `swap` no corpo, o parágrafo do hero quebrava numa linha a mais na fonte de
fallback e encolhia 26px quando a real chegava — isso sozinho empurrava 813px de
conteúdo e dava CLS de 0.131. Com `optional` o navegador não troca no meio da sessão.

**Todo título grande precisa de altura reservada.** O `<h1>` do hero tem
`min-h-[1.76em]` = duas linhas × 0.88 de line-height. Sem isso a troca do display
remedia o bloco e desloca a página inteira.

---

## Movimento

`src/lib/motion/` — GSAP (gratuito desde abril de 2025, plugins inclusos), Lenis para
rolagem interpolada.

### A chave mestra
`motionEnabled` no `MotionProvider` decide tudo. É falso quando a pessoa pediu menos
movimento **ou** quando o aparelho tem menos de 4GB de memória ou menos de 4 núcleos.
Quando é falso: nada é registrado, o Lenis não inicia, o shader não monta, cursor e
cortina não renderizam, e o conteúdo aparece direto no estado final.

**Não existe meia animação.** Ou anima direito, ou é estático e perfeitamente legível.

### ScrollTrigger registra no módulo, não no provider
React roda efeitos de baixo para cima: o efeito de um card filho executa **antes** do
efeito do provider. Registrar lá deixava as primeiras revelações chamando
`scrollTrigger` sem o plugin, e o GSAP ignorava a animação avisando no console.

### Nunca use `transition-all`
Ela anima também `outline-width`, o que fazia o anel de foco surgir em 300ms em vez de
instantaneamente. Declare as propriedades: `transition-[color,background-color,border-color,opacity]`.

### O shader é WebGL puro, sem three.js
Havia three.js **mais** React Three Fiber para desenhar um quad com um shader: 1594 KB
de JavaScript. three.js é uma engine de cena — câmeras, luzes, grafo de objetos — e nada
disso era usado. Sessenta linhas de WebGL entregam o mesmo pixel, e o total caiu para
223 KB. O laço também para quando o hero sai da tela.

E não são partículas: partículas de fogo flutuando são o clichê mais reconhecível de
site gerado por IA, custam milhares de draw calls e nunca se parecem com fritura.

### Cursor: camada extra, nunca substituto
O anel segue o ponteiro, mas **o cursor do sistema continua visível**. Trocar o cursor
nativo por um ponto desenhado destrói affordances que a pessoa já conhece, atrapalha
quem tem baixa visão e não sobrevive a JavaScript quebrado.

---

## Ritmo da página

A ordem existe para não virar uma rolagem plana de cards:

`hero → faixa de sabores → cardápio de festa → box → lema → congelados → como encomendar → contato`

A **faixa** e o **lema** não vendem nada: existem para quebrar o compasso. Sem elas o
miolo eram três mil pixels no mesmo ritmo.

No lema, a deriva horizontal vale exatamente metade do excedente, de modo que a rolagem
percorre a frase de ponta a ponta. Com deriva menor as pontas nunca apareciam e ninguém
lia a frase inteira: o efeito ficava bonito e mudo.

---

## Regras que não se negociam

1. **Zero conteúdo fabricado.** Nenhum depoimento, horário, endereço ou estatística que
   não tenha vindo do dono. Onde falta dado, a seção sai ou fica marcada em comentário.
2. **Nada de emoji como ícone.** Lucide, ou SVG próprio (os ícones de marca saíram do
   lucide na v1 — WhatsApp e Instagram são componentes nossos).
3. **Alvo de toque de 44px** em tudo que é clicável.
4. **Foco sempre visível**, anel de 3px, nunca removido.
5. **Medir, não achar.** `npm run check` mede contraste no que o navegador pintou e
   performance em 4G com CPU 4x lenta.

---

## Orçamento de performance

Verificado a cada rodada, em 390px com rede 4G e CPU quatro vezes mais lenta:

| Métrica | Orçamento | Atual |
|---|---|---|
| JavaScript transferido | 320 KB | 223 KB |
| LCP | 4000 ms | ~1020 ms |
| CLS | 0.1 | 0 |

Medir em rede local não mede nada — por isso o estrangulamento.

---

## Como verificar

```bash
npm run check                      # tudo, subindo o servidor sozinho
npm run check -- --url http://localhost:3000 --shots
npm run lint
GITHUB_PAGES=true npm run build    # o build que realmente vai ao ar
```

Sempre rode o build com `GITHUB_PAGES=true` antes de dar por pronto: o export estático
tem restrições que o build comum não expõe — foi assim que a rota da imagem de preview
quebrou por falta de `dynamic = "force-static"`.
