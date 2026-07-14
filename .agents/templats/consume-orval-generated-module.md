# Template — Consumir módulo gerado pelo Orval

Use este template quando um módulo ainda utiliza chamadas HTTP manuais, types duplicados ou integração antiga e precisa passar a consumir o client gerado pelo Orval.

---

## Variáveis

```txt
MODULE_NAME=
ENTITY_NAME=
ENTITY_NAME_PLURAL=
GENERATED_GROUP=
ROUTE_PATH=
```

Exemplo:

```txt
MODULE_NAME=pets
ENTITY_NAME=Pet
ENTITY_NAME_PLURAL=Pets
GENERATED_GROUP=pets
ROUTE_PATH=pets
```

---

## Instruções obrigatórias

Consulte:

- `AGENTS.md`
- `.agents/agents/agente-frnt-app-petvex.md`
- `.agents/context/api-patterns.md`
- `.agents/context/folder-structure.md`
- `.agents/context/frontend-rules.md`
- `.agents/context/ui-patterns.md`
- `.agents/checklists/frontend-quality.md`
- `orval.config.ts`
- código atual de `src/modules/${MODULE_NAME}`
- grupo gerado em `src/core/http/generated/endpoints/${GENERATED_GROUP}`
- models necessários em `src/core/http/generated/models`

A arquitetura e os exports reais do repositório são a fonte da verdade.

---

## Objetivo

Adaptar `src/modules/${MODULE_NAME}` para consumir corretamente endpoints, hooks, query keys e models gerados pelo Orval, removendo somente integrações locais que se tornarem comprovadamente obsoletas.

Preservar layout, textos, comportamento, rotas, permissões e funcionalidades existentes.

---

## Escopo permitido

Principal:

```txt
src/modules/${MODULE_NAME}
```

Alterações adicionais permitidas somente quando estritamente necessárias:

```txt
src/app
src/shared
```

Não alterar infraestrutura HTTP ou geração sem causa raiz e solicitação explícita:

```txt
src/core/http/api.ts
src/core/http/interceptors.ts
src/core/http/errors.ts
src/core/http/orval-mutator.ts
orval.config.ts
src/core/http/generated/**
```

---

## Processo obrigatório

### 1. Auditoria inicial

Antes de editar:

1. listar arquivos do módulo;
2. localizar pages, components, hooks, services, mappers, schemas e types;
3. localizar todas as chamadas HTTP;
4. localizar imports de `api`, Axios, fetch, endpoints manuais e types locais;
5. localizar queries duplicadas;
6. localizar filtragem local de coleções completas;
7. identificar os exports reais do grupo Orval;
8. identificar os models gerados usados em request, response e filtros;
9. verificar se hooks React Query já foram gerados;
10. verificar se o módulo já possui padrão consolidado que deve ser preservado.

Não assumir nomes de funções. Ler os exports reais.

---

### 2. Estratégia de integração

Escolher uma das opções:

#### Opção A — hooks Orval diretos

Usar quando a operação é simples e o módulo já trabalha bem com React Query.

```txt
Page/hook local
→ hook Orval
→ API
```

#### Opção B — service fino

Usar quando existe orquestração, transformação ou compatibilidade necessária.

```txt
Page/hook local
→ service fino
→ função Orval
→ API
```

O service não pode criar chamada manual para endpoint já gerado.

Documentar no resumo qual opção foi adotada.

---

### 3. Models e types

- reutilizar models gerados para request e response;
- remover type local apenas se estiver duplicado e sem uso específico de UI;
- manter types de formulário, filtros, view model e estado visual;
- criar type local somente quando houver necessidade real;
- não substituir segurança de tipos por `any`;
- não criar interface manual copiando o model gerado.

---

### 4. Mappers

Manter ou criar mapper somente quando houver transformação real:

- nullable;
- datas;
- valores monetários;
- enums;
- API para view model;
- form para request;
- nomes de propriedades;
- composição de múltiplos modelos.

Remover mapper que apenas replica propriedades, desde que isso não quebre a arquitetura existente.

---

### 5. Queries e mutations

- usar hooks gerados quando adequados;
- reutilizar query keys geradas;
- usar `enabled` em consultas dependentes;
- evitar query duplicada no pai e filho;
- não buscar novamente dado já disponível;
- invalidar somente recursos relacionados;
- executar invalidação após sucesso;
- preservar estados de loading, error e empty;
- impedir mutation duplicada.

---

### 6. Listagens

- usar filtros e paginação da API;
- não carregar coleção inteira para filtrar localmente;
- não enviar `perPage` por padrão;
- enviar somente parâmetros previstos no model/assinatura gerada;
- usar debounce em busca textual quando necessário;
- preservar metadados de paginação.

---

### 7. Formulários

- manter React Hook Form e Zod quando já utilizados;
- utilizar request model gerado;
- adaptar payload em mapper somente quando necessário;
- preservar valores em erro;
- não fechar modal em 422;
- mapear erros de campo;
- manter feedback geral;
- impedir submit duplicado.

---

### 8. Limpeza controlada

Pode remover:

- endpoint manual substituído;
- service sem uso;
- type duplicado sem função de UI;
- mapper sem transformação;
- import morto;
- código mockado no fluxo real;
- helper órfão.

Antes de remover, buscar uso em todo o projeto.

Não remover arquivos apenas para cumprir uma estrutura idealizada.

---

## Regras de aceite

- [ ] Nenhum arquivo em `src/core/http/generated` foi editado.
- [ ] Nenhum endpoint já gerado continua sendo chamado por URL manual.
- [ ] Nenhum componente visual usa fetch ou Axios.
- [ ] Requests e responses usam models gerados quando disponíveis.
- [ ] Types locais restantes possuem justificativa de UI.
- [ ] Services restantes são finos.
- [ ] Não há chamadas duplicadas.
- [ ] Não há coleção completa filtrada localmente quando a API suporta filtro.
- [ ] `perPage` não foi adicionado sem requisito.
- [ ] Erro 422 preserva formulário/modal.
- [ ] Layout e funcionalidades foram preservados.
- [ ] Código morto comprovado foi removido.
- [ ] `npm run lint` passou.
- [ ] `npm run build` passou.

---

## Comandos

Execute:

```bash
npm run lint
npm run build
```

Execute geração somente se o contrato estiver desatualizado ou a tarefa exigir:

```bash
npm run api:generate
npm run lint
npm run build
```

Não aceite alterações não relacionadas produzidas pela geração sem revisão.

---

## Entrega

Informar:

- estratégia adotada: hooks diretos ou service fino;
- endpoints e models Orval utilizados;
- arquivos criados;
- arquivos alterados;
- arquivos removidos;
- duplicidades eliminadas;
- comandos executados e resultados;
- pendências de contrato da API;
- riscos técnicos.
