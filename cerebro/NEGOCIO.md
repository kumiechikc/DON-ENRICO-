# O negócio, e a fonte de cada fato

**Só entra aqui o que tem fonte.** Palpite, dedução e "deve ser assim" moram no
`TRAVADO.md`. Um fato errado aqui vira uma promessa errada no site, e quem responde
por ela na conversa do WhatsApp é o dono, não o repositório.

A coluna `Fonte` é obrigatória e conferida por máquina (`npm run check:cerebro`).

## Identidade

| Fato | Valor | Fonte |
|---|---|---|
| Nome | Don Enrico Lanches | Logo impressa nas caixas de entrega |
| Cidade base | Viamão, RS | Dono, por áudio |
| WhatsApp | (51) 99015-6798 | Impresso na caixa e nos encartes |
| Instagram | @donenricolanches | Impresso na caixa |

## Atendimento

| Fato | Valor | Fonte |
|---|---|---|
| Área atendida | Viamão e a região metropolitana de Porto Alegre | Dono, por áudio |
| Entrega | Sim, a empresa entrega | Dono, por áudio |
| Prazo mínimo | 24 horas de antecedência | Dono, por áudio |
| Abaixo de 24 horas | O pedido é avaliado caso a caso, não é recusado nem aceito de antemão | Dono, por áudio |

**Duas armadilhas de redação neste bloco, e as duas já foram evitadas de propósito:**

*"Entrega em 24h" seria mentira.* 24 horas é a antecedência mínima do PEDIDO, não uma
promessa de entrega em 24 horas. São coisas diferentes e a segunda não foi prometida.

*"Sempre dá" viraria garantia.* O dono disse que abaixo de 24 horas sempre deu certo
até hoje. Isso é histórico, não compromisso. No site está escrito como avaliação
("pergunte no WhatsApp: a gente avalia o pedido na hora"), porque num sábado com três
festas a cozinha não pode cumprir a garantia que a frase daria.

## Como vende

| Fato | Valor | Fonte |
|---|---|---|
| Formato | Sempre pacote fechado, nunca unidade avulsa | Encartes |
| Faixas de festa | 50 e 100 unidades | Encartes |
| Box degustação | 25 e 50 unidades, a partir de R$ 19,90 | Encartes |
| Congelados | Vendidos em pacote | Encartes |
| Regra de sabores, 100 unidades | "Máximo dois sabores por cento" | Encarte, texto literal |

A tabela completa de preço e sabor vive em `src/lib/data/menu.ts`, que é a **fonte
única**. Nada de preço é copiado para cá: duas cópias de um preço viram duas verdades
no dia em que uma mudar. Mexeu no `menu.ts`, rode `npm run catalogo` e commite o
`apps-script/Catalogo.gs` junto, senão o CI reprova.

## Fotos que existem, e o que cada uma prova

Cinco fotos chegaram do dono. Três entraram no site, duas ficaram de fora. O motivo
completo, com as medições, está no fim de `src/lib/media/fotos.ts` e resumido em
`BECOS.md`.

| Foto | Onde está | O que ela prova |
|---|---|---|
| Fritos de perto | Box Degustação | O sortido de clássicos que o box é |
| Bandejas de coxinha e croquete | Clássicos Fritos | Dois sabores reais da linha |
| Onze caixas na mesa | Como encomendar | Capacidade de produção, ao lado do prazo |

Continuam sem foto: **Assados Especiais**, **Folhados Premium** e **Seleção Don
Enrico**. Sem foto, o card não mostra bloco de imagem nenhum, em vez de mostrar um
espaço vazio.
