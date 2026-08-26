# O que espera resposta do dono

Em ordem de valor: o de cima custa mais caro ficar sem.

Cada item diz **o que destrava**, porque pergunta sem consequência é questionário, e
questionário longo ninguém responde. As perguntas completas, com contexto, estão em
`docs/PERGUNTAS-CLIENTE.md`; aqui é o índice vivo.

Respondeu? Sai daqui, entra no `NEGOCIO.md` com a fonte, e a mudança correspondente
sai no mesmo commit.

---

## 🔴 A regra de sabores por faixa

O encarte diz "máximo dois sabores por cento". Isso é claro para 100 unidades e
**ambíguo para 25 e 50**. O `menu.ts` hoje usa a leitura conservadora: 1 sabor em 25,
2 em 50. É palpite meu, marcado como tal no código.

**Destrava:** o site parar de prometer combinação que a cozinha talvez não aceite. É o
único lugar onde o site pode estar errado sobre o produto neste momento.
**Onde muda:** `maxFlavors` em `src/lib/data/menu.ts`, depois `npm run catalogo`.

## 🔴 Box Degustação é sortido ou o cliente escolhe?

Hoje o site deixa escolher. Se for sortido da casa, a tela de escolha está errada.

**Destrava:** a tela do box, e o que o pedido manda no WhatsApp.

## 🔴 A lista nominal das cidades

O site diz "Viamão e toda a região metropolitana de Porto Alegre", que é verdade
inteira. Os nomes que o dono citou por áudio saíram ambíguos na transcrição e não
foram escritos, de propósito.

**Destrava:** a frase vira a lista, no site e no `areaServed` do JSON-LD, e o Google
passa a mostrar a empresa para as cidades certas.

## 🔴 As fotos das três linhas que faltam

**Assados Especiais**, **Folhados Premium** e **Seleção Don Enrico** não têm foto.
Sem foto, o card não mostra bloco de imagem nenhum.

**Destrava:** três linhas do cardápio que hoje vendem só com texto.
**Vale pedir junto:** os arquivos ORIGINAIS das cinco que já chegaram. Elas vieram
pelo WhatsApp, com cerca de um décimo dos bytes por pixel que a câmera grava, e nenhum
tratamento recupera o que a compressão jogou fora.

## 🔴 Taxa de entrega

Existe? Quanto? Varia por distância? Tem valor de pedido que isenta?

**Destrava:** o cliente saber o preço final antes de chamar no WhatsApp.

## 🟡 Retirada e endereço

Tem retirada? Em que endereço? Pode ir para o site, ou é ponto residencial que o dono
prefere passar só na conversa?

**Destrava:** o `address` completo no JSON-LD, e o perfil no Google Meu Negócio, que
hoje não dá para montar por falta de endereço e horário.

## 🟡 Horário de atendimento

**Destrava:** o `openingHours` do JSON-LD e o Google Meu Negócio. Hoje os dois estão
de fora, porque schema com horário inventado é pior que schema sem horário: o Google
penaliza divergência entre o que a marcação afirma e a realidade.

## 🟡 Quantidade mínima e máxima de pedido

Qual o maior pedido que a cozinha produz de uma vez?

**Destrava:** o site parar de aceitar um pedido que não dá para entregar.

## 🟡 Pagamento: chave Pix, titular e cidade

E: o cliente paga tudo adiantado ou dá sinal? Essa segunda decide o valor do QR Code.

**Destrava:** o QR e o copia-e-cola do Pix, que já estão implementados e testados
contra a especificação do Banco Central, esperando só os dados.

## 🟡 A logo impressa não conversa com a paleta do site

A logo nas caixas de entrega é um terno azul-petróleo com gravata vermelha. O site é
quase preto quente com âmbar. São duas identidades diferentes, e hoje o site escreve
"Don Enrico" em tipografia em vez de usar a logo.

**Destrava:** a decisão de qual das duas é a marca. E o arquivo da logo em vetor, ou o
contato de quem fez os encartes.

## ⚪ Números de estoque

Mínimo por item, lote de produção.

**Destrava:** o controle de estoque da planilha de operação sair do genérico.

## ⚪ As imagens dos encartes são reais ou de banco?

Se forem de banco, não podem ser usadas como se fossem do produto.

**Destrava:** saber se sobra material de imagem já pago.
