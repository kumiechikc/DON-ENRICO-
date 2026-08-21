# Planilha de operação — instalação

Sistema em Google Apps Script que substitui o caderno: pedidos e controle de estoque
numa planilha só. O site manda o pedido para cá no mesmo clique que abre
o WhatsApp.

Instalação leva ~10 minutos e é feita uma vez.

---

## 1. Criar a planilha

1. Abra <https://sheets.new> e dê um nome ao arquivo (ex.: **Don Enrico — Operação**).
2. Menu **Extensões → Apps Script**. Abre o editor de código numa aba nova.
3. Apague o `function myFunction()` que vem de exemplo.

## 2. Colar os arquivos

No editor, crie um arquivo para cada `.gs` desta pasta (botão **+** ao lado de
"Arquivos" → **Script**), com o **mesmo nome**, e cole o conteúdo:

| Arquivo | O que faz |
|---|---|
| `Config.gs` | nomes de aba, colunas, status, formas de pagamento |
| `Catalogo.gs` | **gerado** do cardápio do site — não edite à mão |
| `Nucleo.gs` | as regras (validação do pedido, rateio de sabores) |
| `Planilha.gs` | leitura e escrita de células |
| `Instalar.gs` | monta e atualiza a estrutura |
| `Pedidos.gs` | criação do pedido e mudança de status |
| `Estoque.gs` | razão de movimentos, reserva e baixa |
| `WebApp.gs` | endpoint que recebe o pedido do site |
| `Menu.gs` | o menu "Don Enrico" dentro da planilha |

Depois, no ícone de engrenagem (**Configurações do projeto**), marque
**"Mostrar arquivo de manifesto appsscript.json"** e substitua o conteúdo dele pelo
`appsscript.json` desta pasta. Ele define o fuso de Porto Alegre e libera o endpoint.

## 3. Montar a estrutura

Volte para a planilha e recarregue a página. Vai aparecer o menu **Don Enrico**.

**Don Enrico → Instalar / atualizar planilha.** Na primeira vez o Google pede
autorização — é o script pedindo permissão para editar a própria planilha.

Pronto: sete abas criadas, com o cardápio inteiro já cadastrado.

## 4. Publicar o endpoint (só se quiser o pedido do site caindo aqui)

No editor do Apps Script: **Implantar → Nova implantação → Tipo: App da Web**.

- **Executar como:** Eu
- **Quem pode acessar:** Qualquer pessoa

Copie a URL que termina em `/exec`. Depois, na planilha, **Don Enrico → Token do site**
e copie o token.

No site, crie o arquivo `.env.local` (ou configure no GitHub Actions):

```
NEXT_PUBLIC_REGISTRO_URL=https://script.google.com/macros/s/.../exec
NEXT_PUBLIC_REGISTRO_TOKEN=<o token da planilha>
```

Sem essas variáveis o site funciona igual — só não registra nada. É o estado de hoje.

> **Sobre o "Qualquer pessoa":** é obrigatório, porque quem chama é o navegador de um
> visitante anônimo. O token fica visível no código do site e serve para filtrar robô,
> não como segredo. A proteção real é o que o endpoint aceita fazer: só cria pedido
> "Novo", com preço recalculado do catálogo. Não lê nada, não altera pedido existente,
> não mexe em estoque. Ver o comentário no topo de `WebApp.gs`.

---

## Como usar no dia a dia

**Pedido que chegou pelo WhatsApp**
`Don Enrico → Novo pedido` abre a linha numerada. Preencha cliente, telefone e data de
entrega. Na aba **Itens**, use o ID do pedido, escolha o SKU na lista e diga quantos
pacotes — produto, unidades, preço e subtotal se preenchem sozinhos.

**Pedido que veio do site**
Já chega na aba Pedidos com status **Novo** e os itens lançados. Falta preencher nome,
telefone e data de entrega — o código `#XXXX` no topo da conversa do WhatsApp é o mesmo
da coluna Código.

**Confirmar**
Mude o Status para **Confirmado**. O sistema reserva as unidades no estoque: o saldo
físico não muda, mas o "Livre" cai. É isso que impede aceitar um pedido para sábado
usando salgado que já está prometido.

**Entregar**
Status **Entregue**. A reserva vira venda e o saldo cai de verdade. Se a data de
entrega estiver vazia, entra a de hoje.

**Produzir / perder**
`Don Enrico → Lançar produção` (ou **Lançar perda**) abre a linha no razão com data e
tipo prontos; escolha o item e digite as unidades.

**Ver a semana**
`Don Enrico → Pedidos dos próximos 7 dias` lista o que tem para entregar, com os itens
de cada pedido — que é a pergunta que o caderno respondia bem.

---

## Quando o cardápio mudar

No repositório do site:

```bash
npm run catalogo        # regera apps-script/Catalogo.gs a partir do menu.ts
npm run check:planilha  # confere as regras e a integridade do catálogo
```

Cole o `Catalogo.gs` novo no editor e rode **Instalar / atualizar planilha**. Pedidos,
itens e movimentos já lançados não são tocados; o estoque mínimo e as correções de
sabor que você tenha feito à mão também ficam.

## O que fica de fora, de propósito

- **Saldo digitado.** Não existe. O saldo é a soma do razão. Para corrigir uma
  contagem, lance `Ajuste +` ou `Ajuste -` — assim dá para achar depois de onde veio a
  diferença.
- **Baixa automática do pacote "Sortidos".** É mistura, não um produto do congelador.
  O sistema avisa na tela e você lança à mão. Descontar de um item adivinhado esconderia
  o problema em vez de mostrá-lo.
- **Cancelar pedido já entregue não estorna o estoque.** Isso é devolução, e devolução
  precisa aparecer como `Ajuste +`, não como uma saída que sumiu.
- **Taxa de maquininha.** O parcelamento é combinado na conversa e a máquina vai na
  entrega, então a planilha não teria como saber a taxa de cada venda. Coluna que fica
  vazia ou errada é pior que coluna nenhuma: alguém acaba somando aquilo achando que é
  real. O que fica é a forma de pagamento e quanto do mês entrou em Pix.
