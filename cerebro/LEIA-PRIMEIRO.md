# Cérebro da Don Enrico

**Se você é uma sessão nova, comece por aqui. São cinco minutos de leitura e eles
evitam refazer trabalho que já foi feito e desfazer decisão que já foi tomada.**

Este não é um manual do código. O código se explica sozinho, e o que ele não explica
está nos comentários dele. Aqui mora o que o código **não** consegue guardar:

| Arquivo | O que guarda | Quando ler |
|---|---|---|
| [`NEGOCIO.md`](NEGOCIO.md) | Os fatos do negócio, e a fonte de cada um | Antes de escrever qualquer coisa que o cliente vai ler |
| [`DECISOES.md`](DECISOES.md) | O que foi decidido, por quê, e o que foi descartado junto | Antes de mudar algo que já está do jeito que está |
| [`BECOS.md`](BECOS.md) | O que já foi tentado e não deu certo, com o número que provou | Antes de tentar um caminho que parece óbvio |
| [`TRAVADO.md`](TRAVADO.md) | O que espera resposta do dono, em ordem de valor | No começo de toda rodada |

Fora daqui, na raiz, mora o [`CONTEXTO.md`](../CONTEXTO.md): o retrato da marca por
extenso, para briefar quem chegar de fora. Ele não decide nada — quem decide é o
`DECISOES.md`. Ele conta.

## Por que isto existe

Sessão de IA perde memória. O contexto antigo é resumido para caber, e o resumo joga
fora exatamente o que era mais barato de anotar e mais caro de redescobrir: o motivo.

O sintoma tem nome e já aconteceu neste projeto: o dono perguntou se eu lembrava de
uma ideia que tínhamos combinado, e eu não lembrava. Não estava em lugar nenhum — nem
no código, nem nos documentos, nem no histórico. Tinha ficado só na conversa, e
conversa evapora.

Um `git log` guarda o que mudou. Ele não guarda o que foi **descartado**, que é a
metade que impede alguém de refazer a escolha errada seis meses depois.

## As três regras deste diretório

**1. Fato de negócio sem fonte não entra.** Cada linha do `NEGOCIO.md` diz de onde
veio: encarte, áudio do dono, foto da caixa. Se não dá para dizer a fonte, o lugar
daquilo é o `TRAVADO.md`, não aqui. Esta regra é conferida por máquina no
`npm run check:cerebro`.

**2. Decisão sem o descartado é meia decisão.** "Escolhemos X" não ajuda ninguém.
"Escolhemos X, descartamos Y porque Z" impede a próxima pessoa de tentar Y de novo.

**3. Isto se atualiza junto com o trabalho, não depois.** Um cérebro desatualizado é
pior que nenhum, porque ele mente com cara de autoridade. Terminou uma rodada que
tomou decisão, esbarrou em beco ou destravou pergunta? Atualiza aqui no mesmo commit.
