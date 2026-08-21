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

Antes de escolher a ferramenta: **hoje o registro é a própria conversa do WhatsApp.**
Ela já tem data, cliente, o que foi pedido e fica no histórico. Com ~5 pedidos por
semana, isso não está quebrado.

O registro passa a valer a pena quando: o volume subir a ponto de perder pedido, ou
quando quisermos relatório (o que vende mais, quem sumiu, de onde vem o cliente).

| Opção | Prós | Contras |
|---|---|---|
| **Só WhatsApp** (hoje) | zero custo, zero manutenção, dono já usa | sem relatório, sem busca, sem visão do mês |
| **Planilha via Apps Script** | dono vê e edita; grátis; fácil de fazer relatório | endpoint fica público no site estático (só acrescenta linha, mas dá para poluir); dado pessoal numa planilha exige cuidado de acesso |
| **Supabase** | banco de verdade, seguro, escala, pronto para a automação | projeto **hiberna após ~1 semana parado** no plano free; dono precisaria de painel feito sob medida |

**Recomendação: não fazer agora.** Registrar pedido só faz sentido junto com a
automação (Pergunta C) — antes disso é duplicar no papel o que já está no WhatsApp.

Quando fizermos, **Supabase**, porque a automação vai precisar de banco de verdade de
qualquer jeito, e manter duas fontes de dado é pior que manter uma.

---

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

**Depois que o site estiver com os dados reais**
4. Planilha lida no build, para o dono editar preço sozinho.
5. Medir de onde vêm os pedidos, para saber onde investir.

**Quando o volume subir (indicador: pedido começar a se perder)**
6. Supabase + registro de pedidos.
7. Agente em modo assistente (sugere, dono envia).

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
