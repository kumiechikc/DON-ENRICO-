# Arquitetura — tornar o sistema dinâmico e integrar o WhatsApp

Documento de decisão. **Nada aqui foi implementado.** É o material para escolhermos
juntos o caminho, com custo, risco e esforço de cada opção.

---

## 0. O aviso que vem antes de tudo

> **O número de WhatsApp do dono é o negócio inteiro.**
>
> Hoje 100% das vendas passam por ele. Não existe loja física com movimento, não existe
> e-commerce com checkout, não existe base de e-mail. Se aquele número for banido, a
> empresa para — e não há plano B.
>
> Isso torna **inaceitável** usar bibliotecas não oficiais de automação de WhatsApp
> (Baileys, whatsapp-web.js, e a maioria dos serviços baratos de "API de WhatsApp" que
> se conectam lendo o QR Code). Elas funcionam bem até o dia em que a Meta detecta e
> derruba a conta. Economizar R$ 100/mês arriscando o único canal de venda é uma troca
> ruim em qualquer cenário.
>
> Se formos automatizar, vai ser pela **API oficial** ou não vai ser.

---

## 1. Onde estamos

O site é **Next.js com export estático publicado no GitHub Pages**. Consequências:

- **Não existe servidor.** Nenhum código nosso roda depois do build.
- **Não existe lugar seguro para guardar segredo.** Qualquer chave que o site use fica
  visível no JavaScript para quem abrir o DevTools.
- O cardápio vive em `src/lib/data/menu.ts` — mudar preço hoje é mexer no código.
- O pedido montado no site abre o WhatsApp com a mensagem pronta. **Nada é gravado.**

Isso é barato (custo zero), rápido e não quebra. O limite é: o dono não consegue mexer
em nada sozinho, e nenhum pedido fica registrado fora do WhatsApp.

---

## 2. Três perguntas independentes

Elas costumam ser tratadas como uma só ("preciso de um backend"), mas têm respostas
diferentes e podem ser resolvidas em momentos diferentes.

### Pergunta A — o dono precisa editar o cardápio sozinho?
### Pergunta B — os pedidos precisam ficar registrados fora do WhatsApp?
### Pergunta C — o atendimento vai ser automatizado?

---

## 3. Pergunta A — cardápio editável

| Opção | Como funciona | Custo | Esforço | Risco |
|---|---|---|---|---|
| **Manter no código** (hoje) | você edita `menu.ts` e faz deploy | R$ 0 | — | dono depende de você |
| **Planilha no build** ⭐ | dono edita Google Sheets; um GitHub Action lê a planilha, gera o `menu.ts` e republica | R$ 0 | 1 dia | planilha errada vai pro ar |
| **CMS** (Sanity, Contentful) | painel bonito de edição | R$ 0 a R$ 100/mês | 2–3 dias | mais uma ferramenta para o dono aprender |
| **Banco em tempo real** | site busca preço do banco a cada visita | R$ 0 a R$ 150/mês | 3–4 dias | site fica lento e pode cair |

**Recomendação: planilha lida no build.**

É o encaixe raro em que a solução simples é também a mais robusta:

- O dono edita numa planilha — ferramenta que ele já entende, sem aprender painel novo.
- O segredo de acesso fica **no GitHub Actions**, nunca no navegador. Zero exposição.
- O site continua **100% estático**: rápido, sem servidor para cair, sem custo.
- Se a planilha sumir ou vier errada, o build falha e **o site anterior continua no ar**.

Frequência de mudança de preço numa casa de salgados é de duas a três vezes por ano.
Montar banco em tempo real para isso é usar caminhão para carregar uma sacola.

---

## 4. Pergunta B — registrar pedidos

> **Esta seção mudou de resposta.** Eu tinha recomendado não registrar nada agora, com o
> argumento de que a conversa do WhatsApp já é o registro. Faltava um dado: **o sócio
> anota tudo num caderno.**
>
> Isso vira a conclusão do avesso. Não se trata de criar um trabalho de digitação que
> não existia — ele já digita, no papel, e já pediu planilha. E controle de estoque, que
> é a outra coisa que ele quer, o WhatsApp não tem como dar em hipótese nenhuma: a
> conversa registra o que foi vendido, nunca o que sobrou no congelador.
>
> Com o caderno na conta, a planilha deixa de ser duplicação e passa a ser substituição.
> **Feito e no repositório**, em `apps-script/`.

### O que existe agora

Google Sheets + Apps Script, oito abas:

| Aba | Para quê |
|---|---|
| **Resumo** | faturamento do mês, custo de maquininha, o que repor, o que entregar |
| **Pedidos** | um por linha, com status, pagamento e valor líquido |
| **Itens** | o que tem em cada pedido; preço vem do catálogo, não digitado |
| **Estoque** | saldo, comprometido e livre por produto — tudo calculado |
| **Movimentos** | o razão: produção, reserva, venda, perda, ajuste |
| **Catálogo** | os 29 SKUs, gerados do `menu.ts` do site |
| **Sabores** | qual produto do congelador cada sabor consome |
| **Taxas** | taxa de cada maquininha por forma de pagamento |

**O pedido do site cai direto na planilha.** No mesmo clique que abre o WhatsApp, o
site envia o pedido em segundo plano. A mensagem e a linha da planilha carregam o mesmo
código curto (`#A7K2`), então ligar uma coisa à outra é olhar.

### As três decisões que sustentam isso

**1. Estoque é razão, não célula de saldo.**
Ninguém digita saldo. O saldo é entradas menos saídas, e cada linha diz quando, quanto
e por quê. É o que separa uma planilha de estoque que ainda bate depois de seis meses
de uma que ninguém confia mais — porque alguém "ajustou" um número e não dá mais para
reconstruir de onde veio a diferença.

**2. Reserva na confirmação, baixa na entrega.**
Confirmar não tira salgado do congelador, mas tira da disponibilidade. Sem isso a
planilha diz que há 300 coxinhas livres enquanto 250 já estão prometidas para o sábado,
e o pedido que não tem como entregar é aceito com a planilha aberta na tela.

**3. Preço nunca vem do navegador.**
O site manda SKU e quantidade; a planilha busca o valor no catálogo. O endpoint é
público — tem que ser, quem chama é o visitante — então qualquer valor vindo de lá é
forjável. Mandar só o que dá para verificar do outro lado dispensa confiar no cliente.

### O custo real das maquininhas

O sócio tem várias. A aba **Taxas** guarda a taxa de cada uma por forma de pagamento
(débito, crédito, parcelado), e cada pedido ganha uma coluna **Líquido**. O Resumo
mostra quanto do mês foi embora em taxa.

Vale medir antes de opinar: a diferença entre a melhor e a pior costuma passar de dois
pontos percentuais, e máquina parada normalmente tem aluguel mensal. Com o número na
tela, dá para decidir qual usar e quais devolver — hoje isso é palpite.

### O que continua fora

- **Pagamento pelo site.** Pix direto (0%) na conversa e maquininha que ele já tem.
- **Supabase.** Só quando existir automação de WhatsApp precisando de webhook. Enquanto
  o operador for humano, planilha é a ferramenta certa: ele já sabe usar.

## 5. Pergunta C — automatizar o atendimento

Aqui está o dinheiro e o risco.

### Caminho oficial — WhatsApp Cloud API (Meta)

**Como é:** número registrado na plataforma da Meta, mensagens entram e saem por API,
nosso agente responde. Oficial, estável, sem risco de banimento.

**O que exige:**
- Conta Meta Business **verificada** (documento da empresa — precisa de CNPJ).
- Um número de telefone que **deixa de funcionar no app do WhatsApp Business**. Ou o
  dono migra o número atual (e perde o app no celular), ou usa um número novo (e perde
  o histórico e os contatos que já têm o número salvo).
- Um servidor de verdade rodando 24h para receber os webhooks — o GitHub Pages não serve.

**Custo:** a Meta cobra por mensagem, com faixa gratuita mensal de conversas iniciadas
pelo cliente. No volume da Don Enrico hoje, provavelmente fica na faixa gratuita ou
perto disso. **Confirmar a tabela vigente antes de decidir** — a Meta mudou o modelo de
cobrança mais de uma vez nos últimos anos e qualquer número que eu escrevesse aqui
envelheceria rápido.

**A pegadinha que decide tudo:** o dono está disposto a **abrir mão do app do WhatsApp
Business no celular** naquele número? Para quem atende pessoalmente e gosta de ver a
conversa, isso costuma ser um "não". Vale perguntar antes de qualquer linha de código.

### Caminho não oficial — não vamos por aqui
Já explicado na seção 0. Risco de perder o canal único de venda.

### Caminho intermediário — assistência sem automação ⭐
O agente **não responde sozinho**. Ele:
- lê o pedido que chegou do site e monta o registro,
- sugere a resposta e o dono envia com um toque,
- avisa o dono de pedido que ficou sem resposta,
- gera o relatório do mês.

Mantém o WhatsApp Business normal no celular, risco zero, e resolve boa parte da dor
("não perder pedido") sem a complicação toda.

**Recomendação: começar por aqui.** Automação completa só depois que o volume justificar
e o dono topar migrar o número.

---

## 6. Caminho sugerido, em ordem

**Agora (não custa nada e destrava tudo)**
1. Responder o questionário do cliente — sem os dados, nada avança.
2. Fotos dos produtos.
3. Google Meu Negócio (grátis, e é como aparecer no mapa quando buscam salgados).

**Feito**
- Planilha de operação com pedidos, estoque e taxas (`apps-script/`, instalação no
  README de lá). Falta o sócio instalar e cadastrar as maquininhas.

**Depois que o site estiver com os dados reais**
4. Cardápio editável pela própria planilha, lido no build do site — a aba Catálogo já
   existe, falta o Action que a lê e regera o `menu.ts`.
5. Medir de onde vêm os pedidos, para saber onde investir.

**Quando o volume subir (indicador: pedido começar a se perder)**
6. Agente em modo assistente (sugere, dono envia), lendo a planilha.
7. Supabase, se e quando a automação exigir webhook.

**Só se o dono topar migrar o número**
8. Cloud API oficial e atendimento automatizado de verdade.

---

## 7. O que preciso saber para fechar isso

- O dono tem **CNPJ**? (Sem isso, a API oficial nem começa.)
- Ele topa **perder o app do WhatsApp Business** no número atual?
- Ele mexe em **planilha** com conforto?
- Existe **orçamento mensal** para infraestrutura, ou tem que ser tudo grátis?
- Quem vai **manter** isso depois — você, ou precisa funcionar sozinho?

A última é a mais importante. Sistema que precisa de manutenção e não tem quem mantenha
vira problema maior que o que resolvia.
