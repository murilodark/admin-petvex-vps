# Consume Orval Generated Module

## Agente

Use obrigatoriamente:

.codex/agents/agente-codex-front-oli-pets.md

## Variáveis

MODULE_NAME=clients
ENTITY_NAME=Client
ENTITY_NAME_PLURAL=Clients
ENTITY_ROUTE=clients
GENERATED_GROUP=clients

## Prompt

Use obrigatoriamente as instruções do projeto:

- AGENTS.md
- .codex/agents/agente-codex-front-oli-pets.md
- .codex/context/api-patterns.md
- .codex/context/folder-structure.md
- .codex/context/frontend-rules.md
- .codex/context/ui-patterns.md
- .codex/checklists/frontend-quality.md

Objetivo:

Adaptar o módulo `${MODULE_NAME}` para consumir corretamente os arquivos gerados pelo Orval, sem editar arquivos gerados manualmente.

Arquivos gerados pelo Orval:

- src/core/http/generated/endpoints/${GENERATED_GROUP}
- src/core/http/generated/models

Regras obrigatórias:

1. Não editar nenhum arquivo dentro de `src/core/http/generated`.
2. Não criar types manuais para payloads, responses ou entidades que já existam em `src/core/http/generated/models`.
3. Substituir imports locais antigos por imports vindos de `src/core/http/generated/models`.
4. Substituir chamadas HTTP manuais por endpoints gerados pelo Orval.
5. Usar o agrupador gerado pelo Orval quando existir, por exemplo:
   - `get${ENTITY_NAME_PLURAL}()`
   - desestruturar funções como `list${ENTITY_NAME_PLURAL}`, `create${ENTITY_NAME}`, `get${ENTITY_NAME}`, `update${ENTITY_NAME}`, `delete${ENTITY_NAME}`
6. Manter `schemas` locais apenas para validação de formulário frontend.
7. Manter `mappers` apenas se forem necessários para adaptar DTO da API ao formato de UI.
8. Remover arquivos locais obsoletos em:
   - `src/modules/${MODULE_NAME}/types`
   - `src/modules/${MODULE_NAME}/services`
9. Se um service local ainda for necessário, ele deve apenas orquestrar endpoints Orval, nunca usar `api.get`, `api.post`, `api.put` ou `api.delete` diretamente.
10. Atualizar hooks, components e pages do módulo para o novo padrão.
11. Corrigir imports quebrados.
12. Garantir compatibilidade com `ApiResponse<T>` já tratado pelo `orval-mutator`.
13. Não alterar:
    - `src/core/http/api.ts`
    - `src/core/http/interceptors.ts`
    - `src/core/http/errors.ts`
    - `src/core/http/orval-mutator.ts`
    - `orval.config.ts`
14. Não recriar manualmente endpoints já existentes no Orval.
15. Remover código morto e arquivos sem uso.
16. Rodar validação final TypeScript/build.

Fluxo obrigatório:

1. Localizar o grupo gerado:
   - `src/core/http/generated/endpoints/${GENERATED_GROUP}`
2. Identificar as funções exportadas pelo Orval.
3. Identificar os models gerados necessários.
4. Revisar o módulo:
   - `src/modules/${MODULE_NAME}`
5. Substituir services manuais por chamadas Orval.
6. Ajustar hook principal do módulo.
7. Ajustar formulários, listagens, detalhes, toolbar e componentes relacionados.
8. Remover types duplicados.
9. Remover services desnecessários.
10. Executar build.

Comandos finais obrigatórios:

npm run build

Critérios de aceite:

- módulo `${MODULE_NAME}` consumindo endpoints gerados pelo Orval
- nenhum arquivo gerado pelo Orval editado manualmente
- nenhum type duplicado para `${ENTITY_NAME}` fora de `src/core/http/generated/models`
- nenhum service local chamando HTTP manual se existir endpoint Orval equivalente
- componentes e hooks funcionando com os models gerados
- build sem erro