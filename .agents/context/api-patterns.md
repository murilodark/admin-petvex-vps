# Padrões de API — Frontend Petvex

## 1. Fluxo oficial

```txt
OpenAPI da API Laravel
  -> Orval
  -> endpoints/models gerados
  -> hook ou service do módulo
  -> mapper
  -> UI
```

A geração está configurada em `orval.config.ts` com:

- domínio por contrato administrativo;
- client React Query;
- Axios;
- mutator centralizado;
- saída em `src/core/http/generated/endpoints/{domain}` e `src/core/http/generated/models/{domain}`.

## 2. Geração

```bash
npm run api:generate
```

Nunca edite manualmente:

```txt
src/core/http/generated/endpoints/
src/core/http/generated/models/
```

Se o gerado estiver incorreto, corrija primeiro o contrato/OpenAPI ou a configuração do Orval.

## 3. Consumo de endpoint

Prioridade:

1. hook React Query gerado pelo Orval;
2. função gerada usada em service do módulo;
3. `api.ts` apenas para caso não coberto pelo contrato e com justificativa explícita.

Proibido:

```ts
fetch('/api/v1/...')
axios.get('/api/v1/...')
api.get('/api/v1/...') // quando já existe função gerada
```

Preferido:

```ts
import { getAdminUsers } from '@/core/http/generated/endpoints/admin-users/admin-users';
```

## 4. Mutator e interceptors

`src/core/http/orval-mutator.ts` conecta os endpoints gerados à instância Axios oficial.

Autenticação, base URL e tratamento HTTP global devem permanecer centralizados no core.

Não crie:

- nova instância Axios por módulo;
- interceptor dentro de component/hook;
- base URL duplicada;
- tratamento paralelo de 401.

## 5. Hooks e services

### Use hook gerado quando

- a tela realiza query/mutation comum;
- cache, loading, error e refetch são úteis;
- não há coordenação complexa.

### Crie hook do módulo quando

- combina múltiplos hooks gerados;
- normaliza filtros;
- aplica mapper com `select`;
- centraliza invalidação após mutation;
- encapsula comportamento reutilizado.

### Crie service quando

- existe operação imperativa fora de React;
- a operação combina chamadas;
- há upload ou download especial;
- vários hooks compartilham a mesma adaptação;
- é necessário converter payload/response de forma centralizada.

Service deve ser fino e importar funções/models gerados.

## 6. Tipos

Use models gerados para representar o contrato HTTP.

Crie type local somente quando a UI precisar de modelo diferente.

```txt
Generated Model -> Mapper -> UI Type
UI/Form Type -> Mapper -> Generated Request Model
```

Não copie integralmente um model gerado para outro arquivo.

Não use `any` para contornar contrato desconhecido. Consulte o model gerado.

## 7. Mappers

Use mapper quando houver:

- `snake_case` e `camelCase` diferentes;
- campos nullable;
- datas formatadas;
- enum adaptado;
- payload de formulário diferente do request;
- envelope/paginação normalizado.

Mapper deve ser puro, tipado e testável.

## 8. Filtros e paginação

Envie somente parâmetros suportados pelo model gerado.

Não envie `perPage` automaticamente.

Não faça:

```txt
listar todos os clientes/pets/produtos
-> filtrar no browser
```

Use endpoint específico ou query params da API. Caso não exista suporte, registre a necessidade no backend em vez de criar solução custosa no frontend.

Para autocomplete:

- use busca remota;
- aplique debounce;
- não carregue a base completa;
- cancele/ignore resposta obsoleta quando necessário.

## 9. Cache e invalidação

Após mutation:

- invalide apenas queries afetadas;
- evite `invalidateQueries()` amplo sem query key;
- não faça refetch duplicado se a invalidação já cobre o fluxo;
- atualize cache manualmente apenas quando houver ganho claro.

## 10. Erros

A UI deve:

- exibir a mensagem principal da API;
- mapear erros 422 para campos;
- preservar formulário e modal;
- não limpar dados em falha;
- diferenciar 401, 403, 404, 409 e 422 quando necessário.

Interceptors cuidam apenas de comportamento global. Erros de domínio permanecem no módulo/tela.

## 11. Uploads e chamadas externas

Use helper central existente quando o Orval não representar adequadamente progresso, blob ou serviço externo.

Toda exceção ao fluxo Orval deve:

- estar isolada no core/service;
- ter tipo explícito;
- não ser repetida em components;
- possuir justificativa técnica.

## 12. Checklist

- endpoint/model consultado no generated;
- nenhuma URL manual duplicada;
- nenhum arquivo gerado editado;
- request e response tipados;
- mapper criado apenas quando necessário;
- filtros executados pela API;
- sem chamadas duplicadas;
- invalidação de cache restrita;
- tratamento 422 preserva estado;
- lint e build aprovados.
