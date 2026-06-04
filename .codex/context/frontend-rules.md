# Frontend Rules

## General Rules

- Usar React + TypeScript.
- Manter tipagem forte.
- Evitar `any`.
- Não criar abstrações desnecessárias.
- Não adicionar bibliotecas sem necessidade.
- Preservar funcionamento atual.
- Corrigir imports ao mover arquivos.
- Remover código morto somente após validar uso.
- Manter componentes pequenos e reutilizáveis.
- Separar regra de negócio da camada visual.

---

## Architecture Rules

- O frontend deve seguir arquitetura modular.
- Cada módulo deve ser autocontido.
- Não misturar responsabilidades.
- Não criar dependência circular entre módulos.
- Priorizar composição ao invés de componentes gigantes.
- Priorizar reaproveitamento dos componentes globais existentes.

---

## Reuse Existing Shared Components

Antes de criar componentes novos, procurar equivalentes em:

```txt
src/shared/ui/
src/shared/components/
```

Priorizar reaproveitamento dos componentes globais existentes.

Componentes globais existentes em `src/shared/ui`:

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

Só criar novo componente global quando:
- não existir equivalente;
- houver uso real em mais de um módulo;
- o componente for genérico;
- não depender de domínio.

Componentes específicos de domínio devem ficar em:

```txt
src/modules/{module}/components/
```

e devem compor os componentes globais de `shared/ui`.

Não duplicar UI global dentro de módulos.

---

## Component Rules

Componentes devem:
- possuir responsabilidade única
- ser pequenos e reutilizáveis
- receber props tipadas
- evitar lógica excessiva
- compor componentes globais existentes

Componentes não devem:
- fazer chamadas HTTP diretas
- conter regra de negócio complexa
- acessar storage diretamente
- manipular estado global desnecessariamente
- recriar `Modal`, `Button`, `Input`, `Table`, `Card` ou outros componentes globais

---

## Page Rules

Pages devem atuar como orquestradoras.

Pages podem conter:
- states principais
- handlers
- hooks
- carregamento de dados
- composição dos componentes
- controle de modais

Pages não devem conter:
- tabelas gigantes
- modais extensos inline
- JSX excessivo
- lógica visual complexa
- componentes globais recriados localmente

Extrair para `components/`:
- conteúdo específico de tabela/lista
- conteúdo específico de toolbar
- conteúdo específico de modal
- cards específicos
- filtros específicos

Usar `shared/ui/Modal.tsx` para o container global de modal.

---

## Service Rules

Services devem:
- consumir API
- retornar dados tipados
- aplicar normalização
- usar endpoints centralizados

Services não devem:
- conter mocks
- conter JSX
- conter regra visual
- manipular DOM

---

## Mapper Rules

Mappers devem:
- converter API → Front
- tratar `null`
- converter `snake_case` → `camelCase`
- centralizar transformação de dados

---

## Type Rules

- Preferir interfaces explícitas.
- Evitar tipos implícitos complexos.
- Separar tipos da API dos tipos internos da UI quando necessário.

Estrutura recomendada:

```txt
types/
├── entity.ts
└── entity-api.ts
```

---

## Hook Rules

Hooks devem:
- encapsular lógica reutilizável
- evitar side effects desnecessários
- evitar acoplamento excessivo

Hooks não devem:
- renderizar UI
- conter JSX

---

## State Rules

- Preferir estado local sempre que possível.
- Evitar globalização prematura.
- Não usar store global para estado temporário de tela.

---

## Form Rules

Forms devem:
- usar schemas de validação
- possuir tipagem explícita
- separar UI da lógica de submit
- usar componentes globais de formulário já existentes

---

## UI Rules

- Preservar layout existente durante refatorações.
- Não alterar comportamento visual sem necessidade.
- Não alterar textos da interface sem solicitação.
- Manter consistência visual entre módulos.
- Reutilizar componentes globais de `shared/ui`.

---

## Import Rules

- Usar aliases absolutos (`@/`) sempre que possível.
- Remover imports mortos após refatorações.
- Evitar imports duplicados.

---

## Performance Rules

- Evitar re-renderizações desnecessárias.
- Evitar lógica pesada dentro do JSX.
- Extrair cálculos complexos para helpers/hooks.

---

## Clean Code Rules

- Evitar arquivos gigantes.
- Evitar funções muito longas.
- Evitar duplicação.
- Evitar duplicação de componentes globais.
- Priorizar legibilidade.
- Priorizar previsibilidade.
- Priorizar manutenção futura.

---

## Validation Rules

Toda alteração deve:
- passar no TypeScript
- passar no build
- manter funcionamento atual
- evitar warnings
- evitar código morto
- garantir ausência de mocks
