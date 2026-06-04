# Refactor Module API-driven

## Variáveis

MODULE_NAME=clients
ENTITY_NAME=Client
ENTITY_NAME_PLURAL=Clients
ENTITY_ROUTE=clients

## Prompt

Use obrigatoriamente as instruções do projeto:

- AGENTS.md
- .codex/agents/agente-codex-front-oli-pets.md
- .codex/context/api-patterns.md
- .codex/context/folder-structure.md
- .codex/context/frontend-rules.md
- .codex/context/ui-patterns.md
- .codex/tasks/refactor-module.md
- .codex/tasks/create-page.md
- .codex/tasks/create-table.md
- .codex/tasks/create-form.md
- .codex/tasks/create-service.md
- .codex/checklists/frontend-quality.md

Refatore completamente o módulo `${MODULE_NAME}` para o padrão arquitetural API-driven, modular e com reaproveitamento obrigatório dos componentes globais existentes em `src/shared/ui`.

## Escopo

```txt
src/modules/${MODULE_NAME}
````

## Objetivo

* Reorganizar o módulo `${MODULE_NAME}`.
* Reduzir `${ENTITY_NAME_PLURAL}Page.tsx`.
* Separar responsabilidades.
* Usar somente API Laravel real.
* Usar mapper/type API quando necessário.
* Reaproveitar componentes globais existentes.
* Preservar layout visual, textos e comportamento atual.
* Não alterar funcionalidades.
* Não criar mocks.
* Não criar fallback fake.
* Não adicionar bibliotecas.

## Estrutura esperada

```txt
src/modules/${MODULE_NAME}/
├── components/
│   ├── ${ENTITY_NAME}DeleteContent.tsx
│   ├── ${ENTITY_NAME}DetailsContent.tsx
│   ├── ${ENTITY_NAME}Form.tsx
│   ├── ${ENTITY_NAME}List.tsx
│   └── ${ENTITY_NAME}Toolbar.tsx
├── hooks/
├── mappers/
│   └── ${ENTITY_ROUTE}.mapper.ts
├── pages/
│   └── ${ENTITY_NAME_PLURAL}Page.tsx
├── schemas/
│   └── ${ENTITY_ROUTE}.schema.ts
├── services/
│   └── ${ENTITY_ROUTE}.service.ts
├── types/
│   ├── ${ENTITY_ROUTE}.ts
│   └── ${ENTITY_ROUTE}-api.ts
└── index.ts
```

## Reuso obrigatório de Shared UI

Antes de criar qualquer componente visual, verificar e reutilizar:

```txt
src/shared/ui/
```

Reutilizar quando aplicável:

```txt
Modal.tsx
Button.tsx
Input.tsx
Select.tsx
Textarea.tsx
Table.tsx
Card.tsx
Badge.tsx
EmptyState.tsx
Loading.tsx
Tabs.tsx
```

Não recriar componentes globais dentro do módulo.

## Fluxo obrigatório

```txt
API Laravel → Service → Mapper → Front Type → UI
```

## Service

O service `${ENTITY_ROUTE}.service.ts` deve:

* consumir somente API real;
* usar `api`;
* usar `endpoints`;
* usar `unwrapPaginatedData`;
* usar mapper quando existir;
* retornar `${ENTITY_NAME}`, não `${ENTITY_NAME}Api`, para a UI;
* não usar mocks;
* não usar `db`;
* não usar `simulateNetwork`;
* não usar `apiConfig.useMocks`.

## Types

Criar ou revisar:

```txt
types/${ENTITY_ROUTE}-api.ts
types/${ENTITY_ROUTE}.ts
```

Regras:

* `${ENTITY_NAME}Api` representa exatamente o retorno Laravel.
* `${ENTITY_NAME}` representa o modelo usado pela UI.
* Evitar `any`.

## Mapper

Criar ou revisar:

```txt
mappers/${ENTITY_ROUTE}.mapper.ts
```

O mapper deve:

* converter API → Front;
* converter `snake_case` para `camelCase`;
* tratar campos nullable;
* proteger a UI contra `null`;
* centralizar transformação de dados.

## Page

`${ENTITY_NAME_PLURAL}Page.tsx` deve ser apenas orquestradora.

Pode conter:

* states principais;
* loadData;
* handlers;
* controle de modais globais;
* composição dos componentes.

Não deve conter:

* tabela/lista gigante inline;
* modal completo inline;
* regra visual complexa;
* regra de negócio pesada;
* chamada HTTP direta fora dos services.

## Componentes esperados

### `${ENTITY_NAME}Toolbar.tsx`

Responsável por busca e ação principal.

Props sugeridas:

```ts
type ${ENTITY_NAME}ToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
};
```

Deve usar `Input` e `Button` de `src/shared/ui`.

### `${ENTITY_NAME}List.tsx`

Responsável pela listagem/tabela.

Props sugeridas:

```ts
type ${ENTITY_NAME}ListProps = {
  items: ${ENTITY_NAME}[];
  onView: (item: ${ENTITY_NAME}) => void;
  onEdit: (item: ${ENTITY_NAME}) => void;
  onDelete: (item: ${ENTITY_NAME}) => void;
};
```

Deve usar `Table`, `Button`, `Badge`, `EmptyState` e `Loading` de `src/shared/ui` quando aplicável.

Não deve:

* chamar API;
* chamar service;
* acessar campos nullable diretamente.

### `${ENTITY_NAME}DetailsContent.tsx`

Conteúdo interno de detalhes.

Props sugeridas:

```ts
type ${ENTITY_NAME}DetailsContentProps = {
  item: ${ENTITY_NAME};
  onClose: () => void;
  onEdit: (item: ${ENTITY_NAME}) => void;
};
```

Não deve importar `Modal`.

### `${ENTITY_NAME}DeleteContent.tsx`

Conteúdo interno de confirmação de exclusão.

Props sugeridas:

```ts
type ${ENTITY_NAME}DeleteContentProps = {
  item: ${ENTITY_NAME};
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};
```

Não deve importar `Modal`.

### `${ENTITY_NAME}Form.tsx`

Revisar para:

* manter React Hook Form/Zod;
* usar `Input`, `Select`, `Textarea`, `Button` de `src/shared/ui`;
* preservar comportamento atual;
* garantir compatibilidade com `${ENTITY_NAME}`;
* tratar campos nullable/normalizados.

## Uso correto de Modal na page

```tsx
<Modal
  isOpen={isFormOpen}
  onClose={handleCloseForm}
  title={editingItem ? 'Editar' : 'Novo'}
  size="lg"
>
  <${ENTITY_NAME}Form />
</Modal>

<Modal
  isOpen={!!selectedDetailsItem}
  onClose={handleCloseDetails}
  title="Detalhes"
  size="lg"
>
  {selectedDetailsItem && (
    <${ENTITY_NAME}DetailsContent
      item={selectedDetailsItem}
      onClose={handleCloseDetails}
      onEdit={handleEditTrigger}
    />
  )}
</Modal>

<Modal
  isOpen={isDeleteOpen}
  onClose={handleCloseDelete}
  title="Excluir"
  size="sm"
>
  {selectedItem && (
    <${ENTITY_NAME}DeleteContent
      item={selectedItem}
      onCancel={handleCloseDelete}
      onConfirm={handleDeleteConfirm}
      isLoading={isDeleting}
    />
  )}
</Modal>
```

## Nullable

Nunca acessar diretamente campos que podem vir `null`.

Errado:

```ts
item.address.street
```

Correto:

```ts
item.address?.street ?? 'Não informado'
```

## Regras gerais

* Não alterar módulos fora de `${MODULE_NAME}`, exceto imports quebrados estritamente necessários.
* Não alterar rotas globais.
* Não alterar layout global.
* Não alterar endpoints sem necessidade.
* Não alterar textos da interface.
* Não remover funcionalidades.
* Não criar mocks.
* Não criar dados fake.
* Não adicionar bibliotecas.
* Evitar `any`.
* Preservar responsividade.
* Preservar comportamento atual.
* Corrigir imports após mover arquivos.
* Remover imports mortos.

## Validação obrigatória

* Rodar typecheck/build se disponível.
* Corrigir erros TypeScript.
* Validar que a page ficou menor e apenas orquestradora.
* Validar que componentes novos não fazem chamada HTTP.
* Validar que conteúdos específicos não importam `Modal`.
* Validar que `Modal` usado é global de `src/shared/ui`.
* Validar que não há acesso inseguro a campos nullable.
* Validar que não há referência a mocks no módulo.
* Validar que componentes globais foram reaproveitados.

## Entrega obrigatória

Ao final, entregar:

* resumo técnico;
* arquivos criados;
* arquivos alterados;
* arquivos removidos;
* impactos arquiteturais;
* próximos passos recomendados.