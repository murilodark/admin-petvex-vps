# Frontend Quality Checklist

## TypeScript

- [ ] TypeScript sem erros.
- [ ] Props tipadas.
- [ ] States tipados.
- [ ] Services tipados.
- [ ] Responses da API tipadas.
- [ ] Forms tipados.
- [ ] Sem `any` desnecessário.

---

## Imports

- [ ] Imports corrigidos após mover arquivos.
- [ ] Sem imports mortos.
- [ ] Sem imports duplicados.
- [ ] Aliases `@/` usados quando fizer sentido.

---

## API

- [ ] Toda comunicação HTTP passa por `src/core/http`.
- [ ] Nenhum componente usa `fetch` ou `axios` diretamente.
- [ ] Services ficam dentro do módulo correspondente.
- [ ] Endpoints estão centralizados.
- [ ] Listagens usam `unwrapPaginatedData` quando necessário.
- [ ] Responses são normalizadas por mapper quando necessário.

---

## Mocks

- [ ] Sem uso de mocks.
- [ ] Sem uso de `db`.
- [ ] Sem uso de `simulateNetwork`.
- [ ] Sem uso de `apiConfig.useMocks`.
- [ ] Sem fallback fake.
- [ ] Sem dados mockados em services, pages ou components.

---

## Arquitetura

- [ ] Arquivos estão no módulo correto.
- [ ] Cada módulo segue a arquitetura oficial.
- [ ] Módulos estão autocontidos.
- [ ] Pages atuam como orquestradoras.
- [ ] Services não ficam em components/pages.
- [ ] Schemas ficam dentro do módulo.
- [ ] Types ficam dentro do módulo.
- [ ] Mappers ficam dentro do módulo quando necessários.
- [ ] Shared contém apenas código realmente reutilizável.
- [ ] Core contém apenas infraestrutura.
- [ ] Não existe dependência circular.

Estrutura esperada:

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

---

## Components

- [ ] Componentes pequenos.
- [ ] Componentes com responsabilidade única.
- [ ] Componentes recebem props tipadas.
- [ ] Componentes não fazem chamada HTTP direta.
- [ ] Componentes não concentram regra de negócio pesada.
- [ ] JSX extenso foi extraído para componentes menores.

---

## Pages

- [ ] Page não possui tabela/lista gigante inline.
- [ ] Page não possui modais extensos inline.
- [ ] Page não possui lógica visual complexa.
- [ ] Page preserva apenas:
  - states principais
  - handlers
  - loadData
  - composição dos componentes

- [ ] Loading state tratado.
- [ ] Empty state tratado.
- [ ] Error state tratado.

---

## Services

- [ ] Service usa `src/core/http/api`.
- [ ] Service usa endpoints centralizados.
- [ ] Service não contém JSX.
- [ ] Service não contém regra visual.
- [ ] Service não contém mocks.
- [ ] Service possui tipagem forte.
- [ ] Service aplica mapper quando necessário.
- [ ] Service usa `unwrapPaginatedData` quando necessário.

---

## Mappers

- [ ] Mapper converte API → Front.
- [ ] Mapper trata campos nullable.
- [ ] Mapper converte `snake_case` → `camelCase`.
- [ ] Mapper centraliza transformação de dados.

Estrutura recomendada:

```txt
types/
├── entity.ts
└── entity-api.ts

mappers/
└── entity.mapper.ts
```

Fluxo esperado:

```txt
API Laravel → Service → Mapper → Front Type → UI
```

---

## Forms

- [ ] Form usa React Hook Form.
- [ ] Form usa Zod.
- [ ] Schema fica dentro do módulo.
- [ ] Types derivados do schema quando fizer sentido.
- [ ] Loading/disabled state tratado.
- [ ] Erros de validação exibidos.

---

## UI

- [ ] Layout visual preservado.
- [ ] Textos preservados.
- [ ] Responsividade preservada.
- [ ] Tailwind usado de forma consistente.
- [ ] Sem duplicação visual evidente.
- [ ] Componentes globais ficam em `shared/ui`.
- [ ] Componentes específicos ficam em `modules/*/components`.

---

## Nullable/API Contract

- [ ] Campos nullable tratados com fallback.
- [ ] Não existe acesso direto inseguro como:

```ts
client.address.street
```

- [ ] Existe uso de:

```ts
client.address?.street ?? 'Não informado'
```

- [ ] API types representam o retorno real da API Laravel.
- [ ] Front types representam o modelo usado pela UI.
- [ ] Mappers convertem API → Front quando necessário.

---

## Organização

- [ ] Sem código morto.
- [ ] Sem duplicação evidente.
- [ ] Sem arquivos desnecessários.
- [ ] Sem diretórios vazios sem propósito.
- [ ] Sem bibliotecas novas sem necessidade.
- [ ] Imports atualizados após mover arquivos.
- [ ] Nenhum arquivo órfão.

---

## Build Validation

- [ ] Build executado.
- [ ] Typecheck executado.
- [ ] Funcionalidade principal validada.
- [ ] Fluxo atual preservado.
- [ ] Nenhum comportamento quebrado.
- [ ] Arquivos alterados revisados.