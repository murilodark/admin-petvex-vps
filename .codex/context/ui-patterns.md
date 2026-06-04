# UI Patterns

## General Rules

- Usar Tailwind CSS.
- Componentes globais ficam em `src/shared/ui`.
- Componentes específicos ficam em `src/modules/*/components`.
- Layouts globais ficam em `src/layouts`.
- Priorizar composição.
- Evitar JSX muito extenso.
- Manter responsividade.
- Usar padrão visual consistente.
- Evitar duplicação de componentes.

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

Não recriar componentes já existentes.

Exemplos:
- usar `Modal.tsx` para modais globais;
- usar `Button.tsx` para ações;
- usar `Input.tsx` para campos;
- usar `Table.tsx` para listagens/tabelas;
- usar `Card.tsx` para blocos visuais;
- usar `EmptyState.tsx` para estado vazio;
- usar `Loading.tsx` para carregamento;
- usar `Badge.tsx` para status;
- usar `Select.tsx` para selects;
- usar `Textarea.tsx` para textos longos;
- usar `Tabs.tsx` para navegação segmentada.

Componentes específicos do módulo devem apenas compor esses componentes globais.

Errado:
- criar outro `Modal` dentro de `modules/clients`;
- criar outro `Button` local;
- criar tabela customizada se `shared/ui/Table.tsx` atende;
- duplicar estilos globais já existentes.

Correto:
- `ClientsPage` usa `Modal` global;
- `ClientList` usa `Table` global;
- `ClientForm` usa `Input`, `Select`, `Textarea`, `Button`;
- `ClientDetailsContent` usa `Card`, `Badge`, `Button`.

---

## Component Organization

### Shared UI

Componentes reutilizáveis globais:

```txt
src/shared/ui/
```

Esses componentes devem:
- ser genéricos
- desacoplados de domínio
- altamente reutilizáveis

---

### Module Components

Componentes específicos de domínio:

```txt
src/modules/{module}/components/
```

Exemplos:
- ClientList
- ClientToolbar
- ClientDeleteContent
- ClientDetailsContent
- PetCard
- SaleSummary
- ProductForm

Esses componentes podem:
- conhecer tipos do módulo
- conhecer regras visuais do módulo
- compor componentes globais de `shared/ui`

Mas não devem:
- consumir API diretamente
- conter regra de negócio complexa
- recriar componentes globais

---

## Modal Pattern

Modal global deve ficar em:

```txt
src/shared/ui/Modal.tsx
```

O modal global deve controlar apenas:
- overlay
- container
- header opcional
- title opcional
- close button
- size
- children

O modal global não deve conhecer:
- Client
- Pet
- Sale
- Product
- qualquer regra de domínio

Conteúdo específico de modal deve ficar no módulo:

```txt
src/modules/{module}/components/{Entity}DetailsContent.tsx
src/modules/{module}/components/{Entity}DeleteContent.tsx
```

Exemplo:

```tsx
<Modal
  isOpen={!!selectedClient}
  onClose={handleClose}
  title="Ficha cadastral"
  size="lg"
>
  {selectedClient && (
    <ClientDetailsContent
      client={selectedClient}
      onClose={handleClose}
    />
  )}
</Modal>
```

---

## Page Composition Pattern

Pages devem ser compostas por componentes menores.

Exemplo:

```txt
ClientsPage
├── ClientToolbar
├── ClientList
├── Modal + ClientForm
├── Modal + ClientDeleteContent
└── Modal + ClientDetailsContent
```

Evitar:
- páginas gigantes
- JSX excessivo
- múltiplos modais inline completos
- lógica visual espalhada
- duplicação de componentes globais

---

## Layout Rules

Layouts globais ficam em:

```txt
src/layouts/
```

Exemplos:
- AdminLayout
- AuthLayout
- SiteLayout

Layouts devem conter:
- estrutura visual
- navegação
- sidebars
- headers
- wrappers

Layouts não devem conter:
- regra de domínio
- chamadas HTTP

---

## Tailwind Rules

- Priorizar Tailwind utilitário.
- Evitar CSS isolado sem necessidade.
- Evitar inline styles.
- Evitar classes excessivamente longas.
- Extrair padrões repetitivos para componentes.
- Reaproveitar componentes existentes antes de extrair novo padrão.

---

## Responsive Rules

Toda UI deve:
- funcionar mobile
- funcionar tablet
- funcionar desktop

Utilizar:
- `sm:`
- `md:`
- `lg:`
- `xl:`

Evitar:
- largura fixa desnecessária
- overflow quebrado
- tabelas sem responsividade

---

## Form UI Pattern

Forms devem:
- usar `Input`, `Select`, `Textarea`, `Button` de `shared/ui` quando existirem
- separar campos em componentes reutilizáveis quando necessário
- manter validação desacoplada
- possuir feedback visual consistente
- tratar loading e disabled state

---

## Table/List Pattern

Tabelas e listas devem:
- ficar em componentes próprios
- usar `Table` de `shared/ui` quando atender
- suportar empty state
- suportar loading state
- suportar responsividade

Evitar:
- map gigante dentro da page
- tabela customizada duplicada sem necessidade

---

## Empty State Pattern

Sempre prever:
- loading state
- empty state
- error state

Preferencialmente utilizando:
- `Loading` de `shared/ui`
- `EmptyState` de `shared/ui`

---

## Visual Consistency Rules

- Manter espaçamentos consistentes.
- Manter tipografia consistente.
- Manter hierarquia visual.
- Manter padrão de cores do sistema.
- Evitar múltiplos estilos para mesma finalidade.
- Usar componentes globais para manter consistência.

---

## Clean UI Rules

- Evitar componentes gigantes.
- Evitar renderização condicional excessiva.
- Extrair blocos repetidos.
- Priorizar legibilidade.
- Priorizar manutenção futura.
- Não duplicar componentes globais.

---

## Accessibility Rules

- Utilizar labels corretamente.
- Garantir foco em modais.
- Garantir navegação por teclado.
- Garantir contraste adequado.
- Utilizar `aria-*` quando necessário.

---

## Performance Rules

- Evitar re-renderizações desnecessárias.
- Evitar lógica pesada no JSX.
- Extrair cálculos para hooks/helpers.
- Utilizar memoização apenas quando necessário.

---

## Refactor Rules

Durante refatorações:
- preservar layout visual
- preservar comportamento
- preservar responsividade
- preservar textos
- preservar UX existente
- reaproveitar componentes globais existentes

Objetivo principal:
- reduzir complexidade
- melhorar manutenção
- melhorar organização
