# AGENTS.md

## Agente principal

Usar como referência principal:


.codex/agents/agente-codex.md


---

## Contextos obrigatórios

Antes de alterar arquitetura, módulos, services, páginas ou componentes, considerar:


.codex/context/api-patterns.md
.codex/context/folder-structure.md
.codex/context/frontend-rules.md
.codex/context/ui-patterns.md


---

## Tasks disponíveis

Usar os templates em:


.codex/tasks/


Principais tasks:


api-integration.md
cleanup-architecture.md
create-crud.md
create-form.md
create-module.md
create-page.md
create-service.md
create-table.md
refactor-module.md


---

## Checklist obrigatório

Validar alterações com:


.codex/checklists/frontend-quality.md


---

## Arquitetura oficial


src/
├── app/
├── config/
├── core/
├── layouts/
├── modules/
├── shared/
└── styles/


---

## Regra principal

O frontend é API-driven e deve consumir exclusivamente a API Laravel real.

Nunca usar:


mocks
db
simulateNetwork
apiConfig.useMocks
local-storage como fonte fake
fallback fake


---

## Fluxo de dados


API Laravel → Service → Mapper → Front Type → UI


---

## Estrutura padrão de módulo


src/modules/{module}/
├── components/
├── hooks/
├── mappers/
├── pages/
├── schemas/
├── services/
├── store/
├── types/
├── utils/
└── index.ts


---

## Regras rápidas

* Não usar `fetch` ou `axios` diretamente em componentes.
* Toda comunicação HTTP deve passar por `src/core/http`.
* Services ficam dentro do módulo.
* Components específicos ficam em `modules/*/components`.
* Components globais ficam em `shared/ui`.
* Pages devem ser orquestradoras.
* Mappers tratam conversão API → Front.
* Types da API e da UI devem ser separados quando necessário.
* Campos nullable devem ter fallback seguro.
* Evitar `any`.
* Remover imports mortos.
* Preservar layout e comportamento atual em refatorações.
