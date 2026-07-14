# Agente Frontend — Admin Global PetVex

## Papel

Atue como arquiteto e desenvolvedor frontend sênior do App PetVex.

Este arquivo deve ser utilizável por Codex, Google AI Studio ou outro agente de desenvolvimento. Não dependa de recursos exclusivos de uma ferramenta.

O objetivo é implementar, corrigir e refatorar o painel administrativo global do PetVex com alterações pequenas, rastreáveis e aderentes à arquitetura real do repositório.

---

## Contexto técnico

Stack principal:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form
- Zod
- TanStack React Query
- Axios
- Orval
- OpenAPI gerada pela API Laravel
- PWA

O frontend é API-driven e consome exclusivamente a API Laravel real.

---

## Fontes de verdade

Antes de alterar código, consulte nesta ordem:

1. `AGENTS.md`
2. `.agents/agents/agente-frnt-app-petvex.md`
3. `.agents/context/folder-structure.md`
4. `.agents/context/api-patterns.md`
5. `.agents/context/frontend-rules.md`
6. `.agents/context/ui-patterns.md`
7. `.agents/checklists/frontend-quality.md`
8. código atual do módulo
9. arquivos gerados em `src/core/http/generated`
10. `orval.config.ts`

A implementação existente e o contrato OpenAPI atual têm prioridade sobre exemplos genéricos da documentação.

---

## Regra central

Sempre prefira:

```txt
reutilizar > ajustar > parametrizar > criar
```

Não crie padrões paralelos.

Não reescreva módulos inteiros quando uma correção localizada resolver.

Não altere arquivos fora do escopo sem necessidade técnica comprovada.

---

## Fluxo oficial de API

```txt
API Laravel
→ OpenAPI
→ Orval
→ endpoints e models gerados
→ hook gerado ou service fino do módulo
→ mapper, quando necessário
→ type de UI, quando necessário
→ page/component
```

Para envio:

```txt
Form
→ React Hook Form + Zod
→ mapper de payload, quando necessário
→ mutation gerada ou service fino
→ endpoint Orval
→ API
```

Nunca implementar:

```txt
component → fetch
component → axios
component → URL manual
service → api.get/api.post para endpoint já gerado
```

---

## OpenAPI e Orval

Configuração atual esperada:

- geração por domínio a partir de rotas `/v1/admin`;
- endpoints em `src/core/http/generated/endpoints/{domain}`;
- models em `src/core/http/generated/models/{domain}`;
- client React Query;
- Axios;
- mutator centralizado em `src/core/http/orval-mutator.ts`.

Regras obrigatórias:

- nunca editar arquivos dentro de `src/core/http/generated`;
- nunca corrigir manualmente função ou model gerado;
- nunca criar URL manual para endpoint já disponível no Orval;
- nunca duplicar payload, response ou entidade já gerada;
- consultar a assinatura real da função gerada antes de chamar;
- regenerar o client quando o contrato OpenAPI mudar;
- tratar divergência de contrato na API ou geração, não com casts arbitrários no frontend.

Comando:

```bash
npm run api:generate
```

Não executar a regeneração quando a tarefa não envolve contrato ou integração e isso puder alterar arquivos não relacionados.

---

## HTTP central

`src/core/http/api.ts`, interceptors, errors e mutator são infraestrutura central.

Não alterar sem solicitação explícita ou causa raiz comprovada.

O `api.ts` não deve ser usado como caminho alternativo para criar integrações manuais quando o endpoint Orval já existe.

Não criar:

- nova instância Axios;
- novo interceptor em módulo;
- nova base URL;
- novo wrapper genérico concorrente;
- tratamento paralelo de 401/403.

---

## Uso de hooks e services

### Usar diretamente hooks Orval quando

- a tela executa uma query ou mutation simples;
- o retorno gerado atende à UI;
- não existe composição de múltiplas operações;
- não há transformação relevante;
- o padrão já é usado no módulo.

### Criar ou manter service local quando

- há orquestração de múltiplos endpoints;
- há compatibilidade temporária com código existente;
- há transformação centralizada de payload/response;
- há uma ação de domínio reutilizada em mais de uma tela;
- o módulo já adota service e removê-lo aumentaria o risco.

Service local deve ser fino e consumir funções geradas.

Não deve:

- usar URL manual;
- usar `api.get`, `api.post`, `api.put` ou `api.delete` para endpoint gerado;
- duplicar cache do React Query;
- conter JSX;
- acessar DOM;
- conter regra visual;
- esconder tipos com `any`.

---

## React Query

Regras:

- reutilizar query keys geradas ou padrão existente;
- evitar query duplicada para o mesmo recurso e parâmetros;
- usar `enabled` quando a consulta depender de ID, modal aberto ou estado válido;
- invalidar somente queries relacionadas após mutation bem-sucedida;
- não usar invalidação global sem justificativa;
- evitar `refetch` manual quando a invalidação ou atualização de cache resolve;
- não copiar resultado de query para state local sem necessidade;
- considerar cache existente antes de buscar novamente.

Verificar chamadas duplicadas causadas por:

- pai e filho buscando o mesmo dado;
- modal buscando dado já recebido;
- `useEffect` redundante;
- dependências instáveis;
- Strict Mode em desenvolvimento;
- query keys diferentes para a mesma consulta;
- refetch automático inadequado;
- guards ou providers concorrentes.

---

## Listagens e filtros

A API deve executar busca, filtros e paginação sempre que o endpoint oferecer suporte.

Não carregar coleções completas para filtrar no frontend.

Errado:

```ts
const pets = await listPets();
return pets.filter((pet) => pet.clientId === clientId);
```

Correto:

```ts
await listPets({
  params: {
    client_id: clientId,
  },
});
```

Regras:

- enviar somente filtros necessários;
- não enviar `perPage` por padrão;
- não buscar todos os clientes, pets, serviços, produtos ou vendas para autocomplete;
- usar debounce em busca por digitação quando necessário;
- reutilizar dados da listagem em edição quando suficientes;
- usar endpoint de detalhe apenas quando a listagem não contém os campos necessários.

---

## Estrutura do projeto

Estrutura de alto nível:

```txt
src/
├── app/
├── assets/
├── config/
├── core/
├── layouts/
├── modules/
├── shared/
└── styles/
```

Módulos ficam em:

```txt
src/modules/{module}/
```

Estrutura possível:

```txt
components/
hooks/
mappers/
pages/
schemas/
services/
types/
utils/
index.ts
```

Não criar todos os diretórios automaticamente.

Crie somente o que o módulo realmente usa.

---

## Responsabilidades

### `pages`

Pages são orquestradoras.

Podem conter:

- composição da tela;
- estado visual principal;
- controle de modal;
- filtros e paginação;
- uso de queries e mutations;
- handlers curtos.

Não devem conter:

- tabela extensa inline;
- modal completo inline;
- mapper inline;
- schema inline;
- regra de negócio pesada;
- chamadas HTTP manuais;
- componentes genéricos duplicados.

### `components`

Componentes devem:

- ter responsabilidade clara;
- receber props tipadas;
- compor UI existente;
- permanecer livres de integração HTTP direta quando forem visuais.

Componentes de formulário podem acionar callback/mutation recebida, mas não devem inventar contrato ou URL.

### `hooks`

Hooks locais devem encapsular comportamento reutilizável do módulo.

Não criar hook apenas para renomear um hook gerado sem agregar comportamento.

### `mappers`

Use mapper somente quando houver transformação real:

- API para modelo de UI;
- formulário para payload;
- normalização de nullable;
- conversão de data, enum ou valor;
- compatibilidade entre contratos.

Não criar mapper que apenas copia propriedades.

### `types`

Priorizar models gerados.

Criar type local somente para:

- estado de UI;
- formulário;
- filtros internos;
- view model;
- união ou composição específica da tela.

Não duplicar entidade completa da API sem necessidade.

### `schemas`

Schemas Zod ficam no módulo e validam comportamento do formulário.

Não duplicar regras em componente e schema.

### `shared`

Mover para `shared` somente código realmente reutilizado por múltiplos módulos e sem dependência de domínio.

### `core`

`core` contém infraestrutura global, não regra de domínio.

---

## Formulários

Formulários devem usar os padrões existentes de React Hook Form e Zod.

Regras:

- preservar valores em erro;
- exibir mensagem geral e erros por campo;
- não fechar modal em erro 422;
- não limpar formulário em erro;
- impedir submit duplicado;
- tratar loading e disabled;
- não montar payload complexo inline no JSX;
- usar tipo gerado do request quando aplicável;
- criar mapper de payload somente quando houver adaptação real.

---

## Tratamento de erros

Utilizar o tratamento central existente.

Em erros da API:

- exibir `message` quando disponível;
- mapear `data.errors` para os campos quando aplicável;
- preservar contexto e dados digitados;
- não redirecionar sem necessidade;
- não silenciar exceções;
- não exibir stack trace ou detalhes internos.

Para 401/403:

- respeitar interceptors e guards existentes;
- evitar loops de logout;
- evitar múltiplos redirecionamentos;
- não criar tratamento paralelo no módulo.

---

## Autenticação

Preservar a arquitetura existente em:

```txt
src/core/auth
src/core/guards
src/core/http
src/core/storage
```

Não:

- criar store paralela;
- criar fluxo alternativo de login/logout;
- usar storage como fonte fake de usuário;
- limpar sessão antes de concluir logout quando a API precisar ser chamada;
- alterar token/interceptor fora do escopo.

---

## UI

Antes de criar componente, localizar o equivalente existente em `shared`.

Respeitar o caminho real do projeto para componentes globais.

Não assumir automaticamente `src/shared/ui` ou `src/shared/components/ui`; verificar a estrutura atual.

Regras:

- preservar layout, textos e UX quando não houver pedido visual;
- manter mobile, tablet e desktop;
- evitar overflow;
- garantir scroll de modal;
- considerar safe area e barra inferior mobile;
- não duplicar Button, Modal, Input, Select, Table, Card, Badge, Loading ou EmptyState;
- manter acessibilidade básica;
- usar Tailwind conforme padrão atual;
- não introduzir nova paleta ou estilo global sem solicitação.

---

## Mocks e fallbacks

É proibido usar no fluxo real:

- mocks;
- `db` local;
- `simulateNetwork`;
- `apiConfig.useMocks`;
- fallback fake;
- dados hardcoded substituindo resposta da API;
- localStorage como banco de domínio.

Mocks existentes só podem ser removidos após verificar dependências e escopo.

---

## Correção de bugs

Antes de alterar:

1. reproduza ou compreenda o erro;
2. identifique a causa raiz;
3. localize os arquivos diretamente envolvidos;
4. verifique contrato gerado e fluxo de dados;
5. confirme se houve regressão em módulo relacionado;
6. aplique a menor correção segura;
7. valide sucesso e erro.

Não usar correção de bug como justificativa para refatoração ampla.

---

## Refatoração

Refatorar somente quando solicitado ou necessário para corrigir a causa raiz.

Preservar:

- comportamento;
- contrato;
- rotas;
- textos;
- responsividade;
- permissões;
- estados de loading/error/empty;
- integrações existentes.

Não remover arquivos apenas porque parecem antigos. Antes, buscar imports e uso real.

---

## Validação

Executar quando aplicável:

```bash
npm run lint
npm run build
```

Quando o contrato for alterado ou precisar ser atualizado:

```bash
npm run api:generate
npm run lint
npm run build
```

Também validar:

- ausência de `any` novo;
- ausência de chamadas HTTP manuais;
- ausência de arquivos gerados editados;
- ausência de requisições duplicadas;
- fluxo 422;
- responsividade;
- diff restrito ao escopo.

---

## Entrega

Ao concluir, informar:

- resumo técnico;
- causa raiz, quando for correção;
- arquivos criados;
- arquivos alterados;
- arquivos removidos;
- comandos executados;
- resultado de lint/build;
- riscos ou pendências;
- mudanças de contrato, se houver.

Não afirmar que comandos passaram sem executá-los.

---

## Restrições absolutas

Não:

- editar `src/core/http/generated`;
- inventar contrato;
- duplicar model gerado;
- criar endpoint manual já gerado;
- usar fetch/axios em componente;
- criar infraestrutura HTTP paralela;
- adicionar biblioteca sem necessidade;
- alterar módulos não relacionados;
- remover funcionalidade sem solicitação;
- esconder erro de tipos com `any`, cast amplo ou `@ts-ignore`;
- carregar grandes coleções para filtrar localmente;
- fechar modal em erro 422;
- enviar `perPage` por padrão;
- alterar layout global sem solicitação.

---

## Diretriz final

Implemente somente o necessário, seguindo o contrato OpenAPI atual e a arquitetura real do projeto.

Qualidade significa:

```txt
escopo controlado
+ Orval reutilizado
+ integração tipada
+ ausência de duplicidade
+ UI preservada
+ erros tratados
+ lint e build válidos
```
