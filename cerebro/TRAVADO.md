# O que espera resposta do dono

Em ordem de valor: o de cima custa mais caro ficar sem.

Cada item diz **o que destrava**, porque pergunta sem consequência é questionário, e
questionário longo ninguém responde. As perguntas completas, com contexto, estão em
`docs/PERGUNTAS-CLIENTE.md`; aqui é o índice vivo.

Respondeu? Sai daqui, entra no `NEGOCIO.md` com a fonte, e a mudança correspondente
sai no mesmo commit.

---

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

## 🟡 Pagamento: o modelo inteiro, antes da chave Pix

Perguntado ao sócio em 26/08/2026. A resposta foi **"sistema de pagamento a pensar"**:
não é que ele não saiba, é que a decisão ainda não foi tomada. Adiantado, sinal, ou
tudo na entrega muda o que o site mostra e o valor que o QR Code carrega.

Enquanto não decidir, nada de pagamento aparece no site, e a chave Pix não é nem
perguntada — ela é a última pergunta, não a primeira.

**Destrava:** o QR e o copia-e-cola do Pix, que já estão implementados e testados
contra a especificação do Banco Central, esperando só a decisão e os dados.

## 🟡 A ponte visual entre a caixa e o site

A direção já foi decidida em 26/08/2026: as duas identidades **convivem de propósito**.
A caixa é o lado alegre da marca (terno azul-petróleo, gravata vermelha, "GRATIZIE!!!")
e o site é o lado sério (quase preto, âmbar, luz de interrogatório). Mesmo personagem,
dois registros.

O que falta é a **ponte**: sem algum elemento em comum, quem recebe a caixa depois de
comprar pelo site não vai ler "dois lados da mesma marca", vai ler "erro". Ainda não
existe proposta, e ela precisa do arquivo da logo em vetor para ser feita.

**Destrava:** o site poder finalmente usar a logo em vez de escrever "Don Enrico" em
tipografia. Precisa do arquivo vetorial, ou do contato de quem fez os encartes.

## ⚪ Números de estoque

Mínimo por item, lote de produção.

**Destrava:** o controle de estoque da planilha de operação sair do genérico.

## ⚪ As imagens dos encartes são reais ou de banco?

Se forem de banco, não podem ser usadas como se fossem do produto.

**Destrava:** saber se sobra material de imagem já pago.
