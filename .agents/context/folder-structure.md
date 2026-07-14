# Estrutura de Diretórios — Frontend Petvex

## Estrutura raiz

```txt
src/
├── app/
├── assets/
├── core/
├── layouts/
├── modules/
├── shared/
└── styles/
```

A estrutura existente do repositório é a fonte da verdade. Não mova arquivos apenas para adequá-los a um desenho teórico.

## `app/`

Inicialização e composição global:

```txt
app/
├── bootstrap/
├── providers/
└── routes/
```

Pode conter providers, router, boundaries e bootstrap. Não deve conter regra de domínio ou integração HTTP específica de módulo.

## `assets/`

Arquivos estáticos importados pelo frontend:

```txt
assets/
├── fonts/
├── icons/
└── images/
```

## `core/`

Infraestrutura transversal e sem conhecimento de domínio.

```txt
core/
├── auth/
├── config/
├── errors/
├── guards/
├── http/
│   ├── generated/
│   │   ├── endpoints/
│   │   └── models/
│   ├── api.ts
│   ├── interceptors.ts
│   └── orval-mutator.ts
└── storage/
```

### `core/http/generated/`

Código gerado pelo Orval.

Regras:

- nunca editar manualmente;
- nunca colocar código próprio dentro dele;
- regenerar com `npm run api:generate`;
- importar endpoints e models gerados a partir dos módulos.

### `core/http/api.ts`

Instância Axios e infraestrutura HTTP compartilhada. É utilizada pelo mutator e por exceções técnicas justificadas. Não é a primeira opção para endpoints já cobertos pelo Orval.

## `layouts/`

Estruturas visuais globais, como layout autenticado, público ou administrativo.

Não devem buscar dados de domínio diretamente.

## `modules/`

Domínios funcionais da aplicação.

```txt
modules/{module}/
├── components/
├── hooks/
├── mappers/
├── pages/
├── schemas/
├── services/
├── types/
├── utils/
└── index.ts
```

A estrutura é opcional por necessidade: não crie pasta vazia.

### `components/`

UI específica do domínio: formulários, tabelas, cards, filtros e conteúdo de modal.

Não faz chamadas HTTP diretas.

### `hooks/`

Composição de React Query, estado e comportamento reutilizável do módulo.

Não renderiza JSX.

### `mappers/`

Conversões entre:

```txt
model gerado <-> modelo/form da UI
```

Use quando houver normalização de null, nomes diferentes, datas, números, enums ou payloads distintos.

### `pages/`

Orquestra a tela. Controla composição, filtros, seleção, modais e hooks principais.

Evite JSX extenso e lógica de transformação inline.

### `schemas/`

Schemas Zod de formulários e filtros.

### `services/`

Fachada fina sobre funções geradas pelo Orval para operações imperativas ou normalização compartilhada.

Não deve:

- usar URLs manuais;
- recriar cliente Axios;
- conter JSX;
- manter estado de UI;
- buscar todos os registros para filtrar localmente.

### `types/`

Tipos internos da UI. Não duplique model gerado sem necessidade.

### `utils/`

Funções puras específicas do módulo.

## `shared/`

Recursos reutilizados por vários módulos.

Estrutura conforme o repositório, normalmente:

```txt
shared/
├── components/
│   └── ui/
├── constants/
├── helpers/
├── hooks/
├── types/
└── validators/
```

Um recurso só deve ir para `shared` quando for realmente genérico e usado por mais de um domínio.

## `styles/`

Estilos globais, tema, tokens e variáveis.

## Regras de dependência

Permitido:

```txt
app -> layouts/modules/shared/core
modules -> shared/core
shared -> core (somente infraestrutura genérica)
core -> bibliotecas externas
```

Evite:

- dependência circular entre módulos;
- `core` importando domínio;
- módulo importando page/component interno de outro módulo;
- tipos duplicados apenas para contornar imports.
