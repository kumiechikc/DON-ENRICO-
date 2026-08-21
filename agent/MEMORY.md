# MEMORY.md — O que o agente guarda

Define o que o atendente de WhatsApp lembra entre conversas, por quanto tempo, e o
que ele nunca guarda. Complementa `agent/AGENT.md`.

> **Estado: rascunho.** A implementação depende de escolher o backend
> (ver `docs/ARQUITETURA-BACKEND.md`). Este arquivo define o *contrato* — o que a
> memória precisa conter — independente de onde ela for morar.

---

## 1. Por que memória importa aqui

Sem memória, todo cliente é um estranho. Com memória:

- Quem já comprou não precisa repetir endereço.
- O agente sabe que o cliente sempre pede coxinha e sugere direto.
- O dono descobre quem some há três meses e vale um "oi, sumiu!".
- Encomenda de festa recorrente (aniversário anual, reunião mensal) vira previsível.

Isso é o que separa "robô que responde" de "atendente que conhece o cliente" — e é o
que o negócio ganha de verdade com automação.

---

## 2. Três camadas

### Camada 1 — Conversa atual (efêmera)
Vive só enquanto a conversa acontece. Some depois.

```
{
  intencao: "festa" | "congelado" | "duvida" | "reclamacao",
  pedido_em_montagem: {
    linha, quantidade, sabores[], data_entrega, entrega_ou_retirada, endereco
  },
  o_que_falta: ["data", "endereco"],
  ja_perguntei: ["linha", "sabores"],
  precisa_humano: false
}
```

`ja_perguntei` evita o pior comportamento de robô: perguntar duas vezes a mesma coisa.

### Camada 2 — Cliente (persistente)
Uma linha por telefone. É o CRM de verdade.

| Campo | Exemplo | Para quê |
|---|---|---|
| `telefone` | 5551999998888 | chave |
| `nome` | Maria | tratar pelo nome |
| `enderecos[]` | ["Rua X, 123 — Petrópolis"] | não repetir endereço |
| `primeiro_contato` | 2026-03-12 | tempo de casa |
| `ultimo_pedido` | 2026-08-01 | quem sumiu |
| `total_pedidos` | 7 | cliente fiel |
| `ticket_medio` | R$ 68,40 | quanto vale |
| `sabores_preferidos[]` | ["coxinha", "bolinha de queijo"] | sugerir certo |
| `linha_preferida` | "Clássicos Fritos" | idem |
| `observacoes` | "sempre pede pra entregar antes das 10h" | detalhe que fideliza |
| `restricoes` | "não come camarão" | **crítico — nunca ignorar** |
| `nao_perturbe` | false | respeitar quem pediu para parar |

### Camada 3 — Pedidos (histórico)
Uma linha por pedido fechado. É o que vira relatório para o dono.

```
telefone, data_pedido, data_entrega, linha, quantidade, sabores[],
valor, entrega_ou_retirada, endereco, forma_pagamento,
status: "orcamento" | "confirmado" | "produzindo" | "entregue" | "cancelado",
origem: "site" | "whatsapp" | "instagram" | "indicacao"
```

`origem` responde a pergunta que decide onde investir: **de onde vêm os pedidos que
realmente fecham?** Se o site trouxer 2 pedidos em três meses e o Instagram trouxer 30,
isso muda toda a estratégia.

---

## 3. O que NUNCA guardar

- **CPF, RG, dado bancário, número de cartão.** Não é preciso para vender salgado.
- **Print ou áudio do cliente** além do necessário para resolver aquele pedido.
- **Conversa inteira palavra por palavra**, indefinidamente. Guardar o pedido e os
  fatos úteis, não a transcrição eterna.
- **Localização em tempo real.**
- Qualquer coisa sobre **saúde** além de restrição alimentar declarada — e essa só
  porque evita mandar comida que faz mal.

Regra prática: se vazasse, causaria problema ao cliente? Então não guarde, ou guarde
o mínimo.

---

## 4. Prazos

| Camada | Quanto tempo | Por quê |
|---|---|---|
| Conversa atual | some ao fim | não é preciso manter |
| Cliente | enquanto for cliente ativo | serve para atender melhor |
| Cliente inativo há 2 anos | anonimizar ou apagar | LGPD: dado sem finalidade sai |
| Pedidos | 5 anos | prazo fiscal/contábil usual |
| Quem pediu para apagar | apagar em até 15 dias | direito do titular |

---

## 5. Deveres de LGPD que caem no colo do dono

Isso não é burocracia opcional — a empresa vira controladora de dados pessoais no
momento em que guarda telefone e endereço de cliente em sistema.

- **Finalidade:** os dados servem para atender e entregar pedido. Nada além.
- **Aviso:** o cliente precisa saber que os dados ficam guardados. Uma frase no
  primeiro contato resolve.
- **Acesso e exclusão:** se o cliente pedir os dados ou pedir para apagar, tem que
  ser atendido.
- **Segurança:** quem tem acesso à base? Se for planilha do Google, ela **não pode**
  estar com link público.
- **Marketing:** mandar promoção para quem não pediu é abuso. Só para quem consentiu,
  e sempre com saída fácil.

Frase sugerida para o primeiro contato:

> Guardamos seu nome, telefone e endereço só para organizar e entregar seus pedidos.
> Se quiser que a gente apague, é só pedir.

---

## 6. Ganchos para o agente usar

Situações em que a memória vira atendimento melhor:

**Cliente conhecido volta**
> Oi Maria! Vai de coxinha e bolinha de novo, ou quer variar dessa vez?

**Cliente com endereço salvo**
> Entrego no mesmo endereço da Rua X, 123?

**Cliente com restrição registrada**
→ Antes de sugerir qualquer linha, checar `restricoes`. Se houver, **chamar o dono**
antes de confirmar — o agente não decide sobre alergia.

**Cliente sumido** (só o dono dispara, nunca o robô sozinho)
> Oi Maria, faz tempo! Tá chegando época de festa, quer que eu já reserve?

**Data recorrente detectada** (dois pedidos no mesmo mês em anos seguidos)
→ Sinalizar para o dono, não para o cliente. Ele decide se puxa conversa.

---

## 7. Relatórios que o dono deveria ver

Se a memória existir, isso sai de graça — e é o que justifica montar o sistema:

- Pedidos da semana e do mês, com total faturado
- Qual linha vende mais (e qual dá mais lucro)
- Sabores mais pedidos → o que produzir e o que descontinuar
- Dias da semana com mais pedido → quando estar disponível
- Clientes que mais compram
- Clientes que sumiram
- **De onde vem cada pedido** (site, Instagram, indicação)
- Taxa de conversa que vira pedido — se for baixa, o problema está no atendimento
  ou no preço, e dá para descobrir qual

---

## 8. O que ainda precisa ser decidido

- Onde a memória vive (`docs/ARQUITETURA-BACKEND.md`)
- Se o dono vê isso em planilha, painel web ou só no WhatsApp
- Se o agente escreve na memória sozinho ou só sugere e o dono confirma
- Como o dono corrige um dado errado que o agente gravou
- O que acontece se o agente cair — o atendimento volta 100% para o humano sem perder
  conversa em andamento?
