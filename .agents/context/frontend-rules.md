# Regras de Frontend — Petvex

## Princípios

- preserve o padrão existente;
- mantenha tipagem forte;
- prefira código simples e explícito;
- altere somente o escopo solicitado;
- elimine causa raiz, não apenas o sintoma;
- não crie arquitetura paralela.

## TypeScript

- evite `any`;
- use models gerados para contratos HTTP;
- use types locais para estado da UI;
- trate campos opcionais e nullable;
- prefira imports absolutos com `@/`;
- não silencie erro com cast amplo;
- remova imports e variáveis não utilizadas.

## Components

Component deve:

- ter responsabilidade única;
- receber props tipadas;
- focar em apresentação e interação;
- reutilizar UI compartilhada;
- ser responsivo.

Component não deve:

- chamar API diretamente;
- acessar Axios/fetch;
- transformar payload complexo;
- controlar estado global sem necessidade;
- duplicar componente compartilhado.

## Pages

Page é orquestradora.

Pode:

- compor hooks e components;
- controlar filtros, seleção e modais;
- coordenar ações principais.

Não deve:

- conter tabela/formulário gigante inline;
- repetir mapper/schema;
- concentrar regra de negócio extensa;
- disparar a mesma query em vários pontos.

## Hooks

- reutilize hooks Orval/React Query;
- crie hooks locais apenas para composição ou comportamento reutilizável;
- mantenha query keys e invalidações previsíveis;
- evite `useEffect` para buscar o que React Query já gerencia;
- revise dependências para impedir loops e duplicidade.

## Services

- importam endpoints e models gerados;
- não escrevem URLs manualmente quando há endpoint gerado;
- não contêm JSX ou estado visual;
- não carregam coleções completas para filtrar localmente;
- não duplicam métodos já existentes no módulo.

## Forms

- React Hook Form + Zod quando o módulo já usa esse padrão;
- schema fora do JSX;
- payload preparado por mapper quando necessário;
- submit via mutation/service;
- loading e disabled consistentes;
- erro 422 não fecha modal, não limpa campos e não redireciona.

## Estado

Prioridade:

```txt
estado local -> React Query -> contexto/store global
```

Não use store global para estado temporário de modal, filtro ou formulário sem justificativa.

## Requisições duplicadas

Antes de implementar/corrigir, verifique:

- page e child buscando o mesmo recurso;
- modal refazendo query desnecessária;
- `useEffect` e React Query executando juntos;
- invalidação seguida de refetch manual;
- guard/provider repetindo chamada;
- busca disparada por cada tecla sem debounce;
- React Strict Mode mascarando efeito não idempotente.

A page/hook proprietário deve buscar; children recebem dados por props quando possível.

## Listagens

- use paginação e filtros da API;
- não carregue volumes grandes automaticamente;
- não envie parâmetros não suportados;
- não envie `perPage` por conveniência;
- suporte loading, empty e error;
- mantenha seleção e filtros previsíveis.

## Edição

- reutilize dados da listagem se forem suficientes;
- faça query de detalhe somente quando necessária;
- não busque o mesmo registro duas vezes;
- invalide apenas recursos relacionados após salvar.

## Autenticação

- use o fluxo existente em `src/core/auth`, guards, storage e interceptors;
- não crie store de auth paralela;
- não mantenha sessão fake;
- trate 401 sem loop;
- respeite 403 e motivos de bloqueio retornados pela API administrativa;
- limpe sessão somente no fluxo correto de logout/expiração.

## Refatoração e bugs

1. identifique a causa raiz;
2. encontre os arquivos diretamente envolvidos;
3. escreva a menor correção segura;
4. preserve UX e contrato;
5. não reorganize módulos não relacionados;
6. valide regressões nas telas dependentes.

## Proibições

- mocks em produção;
- dados fake como fallback;
- edição manual de generated;
- fetch/axios direto em UI;
- dependência nova sem necessidade;
- componente global duplicado;
- alteração visual não solicitada;
- mudança de contrato da API pelo frontend;
- abstração criada para um único uso simples.

## Validação

```bash
npm run lint
npm run build
```

Quando o contrato mudar:

```bash
npm run api:generate
npm run lint
npm run build
```
