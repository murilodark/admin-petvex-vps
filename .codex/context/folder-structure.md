# Folder Structure

## Official Architecture

```txt
src/
├── app/
├── config/
├── core/
├── layouts/
├── modules/
├── shared/
└── styles/
```

---

## app/

Responsável por:
- bootstrap da aplicação
- providers
- rotas
- composição de páginas
- configuração global

Pode conter:
- `App.tsx`
- `routes`
- `providers`
- `loading`
- `error boundaries`

Não deve conter:
- regra de negócio
- chamadas HTTP diretas
- services
- schemas
- lógica de domínio

---

## modules/

Responsável pelos domínios da aplicação.

Cada módulo deve ser independente e autocontido.

Estrutura padrão:

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

Não criar diretórios vazios sem necessidade real.

---

## modules/components

Componentes específicos do módulo.

Exemplos:
- tabelas específicas do domínio
- cards específicos
- formulários específicos
- conteúdos de modal específicos
- toolbars específicas
- filtros específicos

Não colocar:
- componentes globais reutilizáveis
- duplicações de `shared/ui`

Componentes específicos devem compor componentes globais já existentes.

---

## modules/hooks

Hooks específicos do módulo.

Exemplos:
- `useClients`
- `usePetFilters`

Não colocar:
- hooks genéricos globais

---

## modules/mappers

Responsável por transformar:
- API → Front
- DTO → UI

Exemplo:

```txt
client.mapper.ts
```

---

## modules/pages

Pages devem atuar como orquestradoras.

Responsabilidades:
- states principais
- handlers
- composição de componentes
- carregamento de dados
- controle de modais

Pages não devem:
- possuir JSX gigante
- conter regra visual complexa
- conter lógica pesada
- recriar componentes globais

---

## modules/schemas

Schemas de validação.

Preferencialmente:
- Zod

Devem validar:
- formulários
- payloads
- filtros

---

## modules/services

Responsável exclusivamente por:
- chamadas HTTP
- integração API
- normalização
- consumo de endpoints

Services não devem:
- conter mocks
- conter JSX
- manipular DOM
- conter regra visual
- acessar componentes

---

## modules/store

Stores do módulo.

Exemplos:
- Zustand
- Redux
- Context local

Evitar:
- stores globais desnecessárias

---

## modules/types

Tipos do módulo.

Quando necessário separar:

```txt
types/
├── entity.ts
└── entity-api.ts
```

---

## modules/utils

Helpers específicos do domínio.

Não colocar:
- helpers globais reutilizáveis

---

## shared/

Responsável por recursos compartilhados.

Estrutura sugerida:

```txt
shared/
├── constants/
├── lib/
├── types/
├── ui/
└── utils/
```

---

## shared/ui

Componentes globais reutilizáveis.

Componentes globais existentes:

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

Antes de criar qualquer componente visual reutilizável, verificar `src/shared/ui`.

Não duplicar componentes globais dentro de módulos.

Exemplos:
- usar `Modal` global para modais;
- usar `Button` global para ações;
- usar `Input`, `Select`, `Textarea` para formulários;
- usar `Table` para listagens;
- usar `Card` para blocos visuais;
- usar `EmptyState` para estado vazio;
- usar `Loading` para carregamento;
- usar `Badge` para status.

---

## shared/lib

Funções técnicas reutilizáveis.

Exemplos:
- normalizers
- formatters
- parsers

---

## shared/utils

Helpers globais puros.

Evitar:
- lógica de domínio

---

## core/

Infraestrutura central da aplicação.

Estrutura:

```txt
core/
├── auth/
├── http/
├── interceptors/
├── storage/
└── config/
```

---

## core/http

Responsável por:
- client HTTP
- interceptors
- request config
- response config

Toda comunicação HTTP deve passar por aqui.

---

## core/auth

Responsável por:
- autenticação
- sessão
- guards
- token handling

---

## core/storage

Persistência local.

Exemplos:
- localStorage
- sessionStorage

Não utilizar para mocks.

---

## core/interceptors

Interceptors HTTP globais.

Exemplos:
- auth token
- refresh token
- error normalization

---

## layouts/

Layouts reutilizáveis da aplicação.

Exemplos:
- AdminLayout
- AuthLayout
- SiteLayout

---

## styles/

Responsável por:
- estilos globais
- theme
- variables
- tokens
- tailwind config helpers

---

## Architectural Rules

- Não misturar domínio entre módulos.
- Não acessar API diretamente em componentes.
- Não criar componentes gigantes.
- Não duplicar lógica.
- Não duplicar componentes globais.
- Priorizar composição.
- Priorizar tipagem forte.
- Evitar `any`.
- Evitar acoplamento entre módulos.
- Evitar lógica de negócio em pages.
- Evitar estado global desnecessário.
