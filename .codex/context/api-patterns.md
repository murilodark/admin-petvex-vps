# API Patterns

## General Rules

- A API consumida é Laravel desacoplada.
- Toda comunicação HTTP deve passar por `src/core/http`.
- Não usar `fetch` ou `axios` diretamente em componentes.
- Services devem ficar dentro do módulo correspondente.
- Endpoints devem ser centralizados.
- Responses devem ser tipadas.
- Erros devem ser tratados de forma padronizada.
- Loading, empty state e error state devem ser considerados nas telas.

---

## API-driven architecture

- O frontend deve consumir exclusivamente a API Laravel real.
- Não criar fallback fake para ausência de backend.
- Não criar dados mockados para substituir resposta da API.

Nunca usar:
- mocks
- `db`
- `simulateNetwork`
- `local-storage` como fonte fake de dados
- `apiConfig.useMocks`
- fallback fake em services, pages ou components

---

## Data Flow Pattern

Fluxo obrigatório:

```txt
API Laravel → Service → Mapper → Front Type → UI
```

---

## Service Pattern

Services devem:
- consumir API
- usar `src/core/http/api`
- usar `src/core/http/endpoints`
- tipar request e response
- aplicar `unwrapPaginatedData` em listagens
- aplicar mapper quando necessário
- retornar tipagem final usada pela UI

Services não devem:
- conter mocks
- conter regra visual
- conter JSX
- conter estado global
- manipular DOM
- usar `fetch` ou `axios` diretamente
- importar componentes

---

## Module Structure

Cada módulo deve seguir:

```txt
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
```

Não criar diretórios vazios ou arquivos sem necessidade real.

---

## API Contract Pattern

Quando o contrato da API for diferente da UI, criar:

```txt
types/{entity}-api.ts
types/{entity}.ts
mappers/{entity}.mapper.ts
```

Regras:
- `{entity}-api.ts` representa exatamente o retorno da API Laravel.
- `{entity}.ts` representa o modelo utilizado internamente pela UI.
- `mapper.ts` converte API → Front.

Fluxo obrigatório:

```txt
API → Mapper → Front Type → UI
```

---

## Mapper Pattern

Mappers devem:
- normalizar `null`
- converter `snake_case` para `camelCase`
- garantir consistência de tipos
- centralizar transformação de dados
- proteger a UI contra campos opcionais/nullable da API

Exemplo:

```ts
export function normalizeClient(client: ClientApi): Client
```

---

## Paginated Responses

Listagens devem utilizar:

```ts
unwrapPaginatedData(response)
```

Exemplo:

```ts
const response = await api.get<
  PaginatedResponse<ClientApi> | ClientApi[]
>(
  endpoints.clients.list,
  { params },
);

return normalizeClients(
  unwrapPaginatedData(response),
);
```

---

## Query Params Pattern

Sempre normalizar parâmetros:

```ts
type QueryParams = string | Record<string, unknown>;

function normalizeQueryParams(
  query?: QueryParams,
): Record<string, unknown> | undefined {
  return typeof query === 'string' ? { search: query } : query;
}
```

---

## Nullable Fields

Campos nullable vindos da API devem ser tratados:
- no mapper
- ou na UI usando optional chaining

Nunca acessar diretamente:

```ts
client.address.street
```

Usar:

```ts
client.address?.street
```

ou:

```ts
client.address?.street ?? 'Não informado'
```

---

## ID Pattern

IDs devem preferencialmente ser `number`.

Quando necessário comparar tipos mistos:

```ts
String(a.id) === String(b.id)
```

---

## Page Responsibility

Pages devem atuar como orquestradoras.

Pages podem conter:
- states principais
- hooks
- handlers
- loadData
- controle de modais
- composição dos componentes

Pages não devem conter:
- tabelas gigantes
- modais extensos
- blocos JSX repetitivos
- regra visual complexa
- regra de negócio pesada

Esses blocos devem ser extraídos para `components/`.

---

## Component Pattern

Componentes devem:
- possuir responsabilidade única
- receber props tipadas
- evitar lógica excessiva
- evitar chamadas HTTP diretas
- compor componentes globais existentes quando possível

Componentes não devem:
- acessar API diretamente
- recriar componentes globais
- duplicar UI já existente em `shared/ui`

---

## Shared UI Reuse Rule

Antes de criar qualquer componente visual reutilizável, verificar se já existe equivalente em:

```txt
src/shared/ui/
```

Componentes globais existentes devem ser reutilizados sempre que possível:

```txt
Badge.tsx
Button.tsx
Card.tsx
EmptyState.tsx
Input.tsx
Loading.tsx
Modal.tsx
Select.tsx
Table.tsx
Tabs.tsx
Textarea.tsx
```

Exemplos:
- usar `Modal.tsx` para modais globais;
- usar `Button.tsx` para ações;
- usar `Input.tsx` para campos;
- usar `Table.tsx` para listagens;
- usar `Card.tsx` para blocos visuais;
- usar `EmptyState.tsx` para estado vazio;
- usar `Loading.tsx` para carregamento;
- usar `Badge.tsx` para status;
- usar `Select.tsx` para selects;
- usar `Textarea.tsx` para textos longos;
- usar `Tabs.tsx` para navegação segmentada.

Não recriar componentes globais dentro de módulos.

---

## Form Pattern

Forms devem:
- usar schema validation
- possuir tipagem explícita
- separar UI da lógica de submit
- usar componentes globais de formulário quando existirem

---

## Build Validation

Toda alteração deve:
- passar no TypeScript
- passar no build
- remover imports mortos
- evitar `any` desnecessário
- evitar código não utilizado
- garantir ausência de mocks no fluxo
