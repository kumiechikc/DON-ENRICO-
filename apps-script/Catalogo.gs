/**
 * ARQUIVO GERADO — não edite à mão.
 *
 * Origem: src/lib/data/menu.ts
 * Comando: node scripts/gerar-catalogo.mjs
 *
 * Mudou preço, sabor ou faixa? Mude no menu.ts, rode o comando e cole este
 * arquivo de volta no projeto do Apps Script. Depois rode "Don Enrico >
 * Instalar / atualizar planilha" para as abas Catálogo, Sabores e Estoque
 * absorverem a mudança sem perder pedido nem movimento já lançado.
 */

const CATALOGO = [
  {
    "sku": "box-degustacao-25",
    "linha": "box-degustacao",
    "produto": "Box Degustação — 25 un",
    "unidades": 25,
    "preco": 19.9,
    "maxSabores": 1
  },
  {
    "sku": "box-degustacao-50",
    "linha": "box-degustacao",
    "produto": "Box Degustação — 50 un",
    "unidades": 50,
    "preco": 39.9,
    "maxSabores": 2
  },
  {
    "sku": "classicos-fritos-50",
    "linha": "classicos-fritos",
    "produto": "Clássicos Fritos — 50 un",
    "unidades": 50,
    "preco": 39.9,
    "maxSabores": 2
  },
  {
    "sku": "classicos-fritos-100",
    "linha": "classicos-fritos",
    "produto": "Clássicos Fritos — 100 un",
    "unidades": 100,
    "preco": 69.9,
    "maxSabores": 2
  },
  {
    "sku": "assados-especiais-50",
    "linha": "assados-especiais",
    "produto": "Assados Especiais — 50 un",
    "unidades": 50,
    "preco": 44.9,
    "maxSabores": 2
  },
  {
    "sku": "assados-especiais-100",
    "linha": "assados-especiais",
    "produto": "Assados Especiais — 100 un",
    "unidades": 100,
    "preco": 79.9,
    "maxSabores": 2
  },
  {
    "sku": "folhados-premium-50",
    "linha": "folhados-premium",
    "produto": "Folhados Premium — 50 un",
    "unidades": 50,
    "preco": 44.9,
    "maxSabores": 2
  },
  {
    "sku": "folhados-premium-100",
    "linha": "folhados-premium",
    "produto": "Folhados Premium — 100 un",
    "unidades": 100,
    "preco": 79.9,
    "maxSabores": 2
  },
  {
    "sku": "selecao-don-enrico-50",
    "linha": "selecao-don-enrico",
    "produto": "Seleção Don Enrico — 50 un",
    "unidades": 50,
    "preco": 59.9,
    "maxSabores": 2
  },
  {
    "sku": "selecao-don-enrico-100",
    "linha": "selecao-don-enrico",
    "produto": "Seleção Don Enrico — 100 un",
    "unidades": 100,
    "preco": 109.9,
    "maxSabores": 2
  },
  {
    "sku": "cong-frito-coxinha-frango",
    "linha": "cong-frito-coxinha-frango",
    "produto": "Coxinha de frango (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-calabresa-cheddar",
    "linha": "cong-frito-calabresa-cheddar",
    "produto": "Calabresa c/ cheddar (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-bolinha-queijo",
    "linha": "cong-frito-bolinha-queijo",
    "produto": "Bolinha de queijo (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-risoles-presunto-queijo",
    "linha": "cong-frito-risoles-presunto-queijo",
    "produto": "Risoles presunto e queijo (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-enrolado-salsicha",
    "linha": "cong-frito-enrolado-salsicha",
    "produto": "Enrolado de salsicha (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 22,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-croquete-requeijao",
    "linha": "cong-frito-croquete-requeijao",
    "produto": "Croquete c/ requeijão (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 27,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-pastelzinho-carne",
    "linha": "cong-frito-pastelzinho-carne",
    "produto": "Pastelzinho de carne (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-pastelzinho-queijo",
    "linha": "cong-frito-pastelzinho-queijo",
    "produto": "Pastelzinho de queijo (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-mini-churros",
    "linha": "cong-frito-mini-churros",
    "produto": "Mini churros (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 27,
    "maxSabores": 1
  },
  {
    "sku": "cong-frito-sortidos",
    "linha": "cong-frito-sortidos",
    "produto": "Sortidos (congelado para fritar) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-esfiha-frango",
    "linha": "cong-assado-esfiha-frango",
    "produto": "Esfiha de frango (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 30,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-esfiha-carne",
    "linha": "cong-assado-esfiha-carne",
    "produto": "Esfiha de carne (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 30,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-empadinha-frango",
    "linha": "cong-assado-empadinha-frango",
    "produto": "Empadinha de frango (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 30,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-empadinha-brocolis",
    "linha": "cong-assado-empadinha-brocolis",
    "produto": "Empadinha de brócolis (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 35,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-enrolado-salsicha-assado",
    "linha": "cong-assado-enrolado-salsicha-assado",
    "produto": "Enrolado de salsicha (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 25,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-pastelzinho-carne-assado",
    "linha": "cong-assado-pastelzinho-carne-assado",
    "produto": "Pastelzinho de carne (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 30,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-mini-pizza-mussarela",
    "linha": "cong-assado-mini-pizza-mussarela",
    "produto": "Mini pizza mussarela (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 35,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-mini-pizza-frango",
    "linha": "cong-assado-mini-pizza-frango",
    "produto": "Mini pizza frango (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 35,
    "maxSabores": 1
  },
  {
    "sku": "cong-assado-mini-pizza-calabresa",
    "linha": "cong-assado-mini-pizza-calabresa",
    "produto": "Mini pizza calabresa (congelado assado) — 50 un",
    "unidades": 50,
    "preco": 35,
    "maxSabores": 1
  }
]

const SABORES = [
  {
    "linha": "box-degustacao",
    "sabor": "Coxinha de frango",
    "item": "frito-coxinha-de-frango"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Bolinha de queijo",
    "item": "frito-bolinha-de-queijo"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Risoles presunto e queijo",
    "item": "frito-risoles-presunto-e-queijo"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Calabresinha c/ cheddar",
    "item": "frito-calabresa-c-cheddar"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Croquete c/ requeijão",
    "item": "frito-croquete-c-requeijao"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Enroladinho de salsicha",
    "item": "frito-enrolado-de-salsicha"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Pastelzinho de carne",
    "item": "frito-pastelzinho-de-carne"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Pastelzinho de queijo",
    "item": "frito-pastelzinho-de-queijo"
  },
  {
    "linha": "box-degustacao",
    "sabor": "Mini churros",
    "item": "frito-mini-churros"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Coxinha de frango",
    "item": "frito-coxinha-de-frango"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Bolinha de queijo",
    "item": "frito-bolinha-de-queijo"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Enrolado de salsicha",
    "item": "frito-enrolado-de-salsicha"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Croquete c/ requeijão",
    "item": "frito-croquete-c-requeijao"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Calabresinha c/ cheddar",
    "item": "frito-calabresa-c-cheddar"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Risoles presunto e queijo",
    "item": "frito-risoles-presunto-e-queijo"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Pastelzinho de carne",
    "item": "frito-pastelzinho-de-carne"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Pastelzinho de queijo",
    "item": "frito-pastelzinho-de-queijo"
  },
  {
    "linha": "classicos-fritos",
    "sabor": "Mini churros",
    "item": "frito-mini-churros"
  },
  {
    "linha": "assados-especiais",
    "sabor": "Enroladinho de salsicha",
    "item": "assado-enrolado-de-salsicha"
  },
  {
    "linha": "assados-especiais",
    "sabor": "Joelho calabresa e queijo",
    "item": "assado-joelho-calabresa-e-queijo"
  },
  {
    "linha": "assados-especiais",
    "sabor": "Esfiha de frango",
    "item": "assado-esfiha-de-frango"
  },
  {
    "linha": "assados-especiais",
    "sabor": "Empadinha de frango",
    "item": "assado-empadinha-de-frango"
  },
  {
    "linha": "assados-especiais",
    "sabor": "Pastelzinho de carne",
    "item": "assado-pastelzinho-de-carne"
  },
  {
    "linha": "assados-especiais",
    "sabor": "Pastelzinho suíço",
    "item": "assado-pastelzinho-suico"
  },
  {
    "linha": "folhados-premium",
    "sabor": "Enroladinho de salsicha",
    "item": "folhado-enrolado-de-salsicha"
  },
  {
    "linha": "folhados-premium",
    "sabor": "Pastel presunto e queijo",
    "item": "folhado-pastelzinho-presunto-e-queijo"
  },
  {
    "linha": "folhados-premium",
    "sabor": "Empadinha de frango",
    "item": "folhado-empadinha-de-frango"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Mini pizza de calabresa",
    "item": "selecao-mini-pizza-calabresa"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Mini pizza de frango",
    "item": "selecao-mini-pizza-frango"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Mini pizza de mussarela",
    "item": "selecao-mini-pizza-mussarela"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Mini pizza milho e queijo",
    "item": "selecao-mini-pizza-milho-e-queijo"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Hamburguinho de presunto e queijo",
    "item": "selecao-hamburguinho-de-presunto-e-queijo"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Croissant de chocolate",
    "item": "selecao-croissant-de-chocolate"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Croissant de presunto e queijo",
    "item": "selecao-croissant-de-presunto-e-queijo"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Pastelzinho de palmito",
    "item": "selecao-pastelzinho-de-palmito"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Empadinha de palmito",
    "item": "selecao-empadinha-de-palmito"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Empadinha de brócolis",
    "item": "selecao-empadinha-de-brocolis"
  },
  {
    "linha": "selecao-don-enrico",
    "sabor": "Tortinha de espinafre",
    "item": "selecao-tortinha-de-espinafre"
  },
  {
    "linha": "cong-frito-coxinha-frango",
    "sabor": "Coxinha de frango",
    "item": "frito-coxinha-de-frango"
  },
  {
    "linha": "cong-frito-calabresa-cheddar",
    "sabor": "Calabresa c/ cheddar",
    "item": "frito-calabresa-c-cheddar"
  },
  {
    "linha": "cong-frito-bolinha-queijo",
    "sabor": "Bolinha de queijo",
    "item": "frito-bolinha-de-queijo"
  },
  {
    "linha": "cong-frito-risoles-presunto-queijo",
    "sabor": "Risoles presunto e queijo",
    "item": "frito-risoles-presunto-e-queijo"
  },
  {
    "linha": "cong-frito-enrolado-salsicha",
    "sabor": "Enrolado de salsicha",
    "item": "frito-enrolado-de-salsicha"
  },
  {
    "linha": "cong-frito-croquete-requeijao",
    "sabor": "Croquete c/ requeijão",
    "item": "frito-croquete-c-requeijao"
  },
  {
    "linha": "cong-frito-pastelzinho-carne",
    "sabor": "Pastelzinho de carne",
    "item": "frito-pastelzinho-de-carne"
  },
  {
    "linha": "cong-frito-pastelzinho-queijo",
    "sabor": "Pastelzinho de queijo",
    "item": "frito-pastelzinho-de-queijo"
  },
  {
    "linha": "cong-frito-mini-churros",
    "sabor": "Mini churros",
    "item": "frito-mini-churros"
  },
  {
    "linha": "cong-frito-sortidos",
    "sabor": "Sortidos",
    "item": ""
  },
  {
    "linha": "cong-assado-esfiha-frango",
    "sabor": "Esfiha de frango",
    "item": "assado-esfiha-de-frango"
  },
  {
    "linha": "cong-assado-esfiha-carne",
    "sabor": "Esfiha de carne",
    "item": "assado-esfiha-de-carne"
  },
  {
    "linha": "cong-assado-empadinha-frango",
    "sabor": "Empadinha de frango",
    "item": "assado-empadinha-de-frango"
  },
  {
    "linha": "cong-assado-empadinha-brocolis",
    "sabor": "Empadinha de brócolis",
    "item": "selecao-empadinha-de-brocolis"
  },
  {
    "linha": "cong-assado-enrolado-salsicha-assado",
    "sabor": "Enrolado de salsicha",
    "item": "assado-enrolado-de-salsicha"
  },
  {
    "linha": "cong-assado-pastelzinho-carne-assado",
    "sabor": "Pastelzinho de carne",
    "item": "assado-pastelzinho-de-carne"
  },
  {
    "linha": "cong-assado-mini-pizza-mussarela",
    "sabor": "Mini pizza mussarela",
    "item": "selecao-mini-pizza-mussarela"
  },
  {
    "linha": "cong-assado-mini-pizza-frango",
    "sabor": "Mini pizza frango",
    "item": "selecao-mini-pizza-frango"
  },
  {
    "linha": "cong-assado-mini-pizza-calabresa",
    "sabor": "Mini pizza calabresa",
    "item": "selecao-mini-pizza-calabresa"
  }
]

const ITENS_ESTOQUE = [
  {
    "id": "assado-empadinha-de-frango",
    "nome": "empadinha de frango",
    "tipo": "assado"
  },
  {
    "id": "assado-enrolado-de-salsicha",
    "nome": "enrolado de salsicha",
    "tipo": "assado"
  },
  {
    "id": "assado-esfiha-de-carne",
    "nome": "esfiha de carne",
    "tipo": "assado"
  },
  {
    "id": "assado-esfiha-de-frango",
    "nome": "esfiha de frango",
    "tipo": "assado"
  },
  {
    "id": "assado-joelho-calabresa-e-queijo",
    "nome": "joelho calabresa e queijo",
    "tipo": "assado"
  },
  {
    "id": "assado-pastelzinho-de-carne",
    "nome": "pastelzinho de carne",
    "tipo": "assado"
  },
  {
    "id": "assado-pastelzinho-suico",
    "nome": "pastelzinho suíço",
    "tipo": "assado"
  },
  {
    "id": "folhado-empadinha-de-frango",
    "nome": "empadinha de frango",
    "tipo": "folhado"
  },
  {
    "id": "folhado-enrolado-de-salsicha",
    "nome": "enrolado de salsicha",
    "tipo": "folhado"
  },
  {
    "id": "folhado-pastelzinho-presunto-e-queijo",
    "nome": "pastelzinho presunto e queijo",
    "tipo": "folhado"
  },
  {
    "id": "frito-bolinha-de-queijo",
    "nome": "bolinha de queijo",
    "tipo": "frito"
  },
  {
    "id": "frito-calabresa-c-cheddar",
    "nome": "calabresa c/ cheddar",
    "tipo": "frito"
  },
  {
    "id": "frito-coxinha-de-frango",
    "nome": "coxinha de frango",
    "tipo": "frito"
  },
  {
    "id": "frito-croquete-c-requeijao",
    "nome": "croquete c/ requeijão",
    "tipo": "frito"
  },
  {
    "id": "frito-enrolado-de-salsicha",
    "nome": "enrolado de salsicha",
    "tipo": "frito"
  },
  {
    "id": "frito-mini-churros",
    "nome": "mini churros",
    "tipo": "frito"
  },
  {
    "id": "frito-pastelzinho-de-carne",
    "nome": "pastelzinho de carne",
    "tipo": "frito"
  },
  {
    "id": "frito-pastelzinho-de-queijo",
    "nome": "pastelzinho de queijo",
    "tipo": "frito"
  },
  {
    "id": "frito-risoles-presunto-e-queijo",
    "nome": "risoles presunto e queijo",
    "tipo": "frito"
  },
  {
    "id": "selecao-croissant-de-chocolate",
    "nome": "croissant de chocolate",
    "tipo": "selecao"
  },
  {
    "id": "selecao-croissant-de-presunto-e-queijo",
    "nome": "croissant de presunto e queijo",
    "tipo": "selecao"
  },
  {
    "id": "selecao-empadinha-de-brocolis",
    "nome": "empadinha de brócolis",
    "tipo": "selecao"
  },
  {
    "id": "selecao-empadinha-de-palmito",
    "nome": "empadinha de palmito",
    "tipo": "selecao"
  },
  {
    "id": "selecao-hamburguinho-de-presunto-e-queijo",
    "nome": "hamburguinho de presunto e queijo",
    "tipo": "selecao"
  },
  {
    "id": "selecao-mini-pizza-calabresa",
    "nome": "mini pizza calabresa",
    "tipo": "selecao"
  },
  {
    "id": "selecao-mini-pizza-frango",
    "nome": "mini pizza frango",
    "tipo": "selecao"
  },
  {
    "id": "selecao-mini-pizza-milho-e-queijo",
    "nome": "mini pizza milho e queijo",
    "tipo": "selecao"
  },
  {
    "id": "selecao-mini-pizza-mussarela",
    "nome": "mini pizza mussarela",
    "tipo": "selecao"
  },
  {
    "id": "selecao-pastelzinho-de-palmito",
    "nome": "pastelzinho de palmito",
    "tipo": "selecao"
  },
  {
    "id": "selecao-tortinha-de-espinafre",
    "nome": "tortinha de espinafre",
    "tipo": "selecao"
  }
]
