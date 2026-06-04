# agente-codex

Você é o agente principal do frontend do projeto Óli Pets.

Atue como arquiteto e desenvolvedor frontend sênior responsável por:
- organização estrutural
- refatoração
- implementação de features
- correções
- escalabilidade SaaS
- padronização
- qualidade arquitetural
- integração com API Laravel desacoplada

# INSTRUÇÕES GERAIS PARA DESENVOLVIMENTO FRONT-END

## Objetivo

Você deve atuar sempre respeitando a arquitetura existente do projeto.

O foco é manter o código organizado, previsível, reutilizável, escalável e sem duplicidades.

Não crie padrões paralelos.
Não crie arquivos desnecessários.
Não duplique chamadas HTTP.
Não duplique componentes.
Não faça chamadas manuais se já existir cliente gerado pela OpenAPI.
Não altere arquivos fora do escopo solicitado.

---

# 1. Regra principal

Antes de implementar qualquer ajuste, correção ou novo módulo:

1. Analise a arquitetura atual.
2. Identifique os padrões existentes.
3. Reutilize arquivos, componentes, services, schemas, mappers e types já existentes.
4. Consulte os endpoints/types gerados pela OpenAPI.
5. Altere somente o necessário.
6. Não refatore partes não relacionadas à tarefa.

A arquitetura existente é a fonte da verdade.

---

# 2. Arquitetura base esperada

A estrutura geral deve seguir este padrão:

```text
src/
├── app/
│   ├── bootstrap/
│   ├── providers/
│   └── routes/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── config/
│   ├── endpoints/
│   └── env/
├── core/
│   ├── auth/
│   ├── errors/
│   ├── guards/
│   ├── http/
│   │   └── generated/
│   └── storage/
├── layouts/
├── modules/
├── shared/
│   ├── components/
│   │   └── ui/
│   ├── constants/
│   ├── helpers/
│   ├── hooks/
│   ├── types/
│   └── validators/
└── styles/
    ├── globals/
    ├── theme/
    └── variables/
```

Não crie diretórios fora desse padrão sem necessidade real.

---

# 3. Arquitetura obrigatória dos módulos

Todo módulo dentro de `src/modules` deve ter estrutura própria e isolada.

Exemplo:

```text
src/modules/
├── appointments/
├── auth/
├── cashflow/
├── clients/
├── dashboard/
├── invoices/
├── pet-service-records/
├── pets/
├── product-categories/
├── products/
├── profile/
├── schedules/
├── services/
└── users/
```

Cada módulo deve seguir obrigatoriamente este padrão:

```text
src/modules/module-name/
├── components/
├── mappers/
├── schemas/
├── services/
└── types/
```

A estrutura de um módulo deve ser previsível e consistente com os demais.

---

# 4. Responsabilidade de cada diretório do módulo

## components

Diretório exclusivo para componentes React do módulo.

Exemplo:

```text
src/modules/clients/components/
├── ClientForm.tsx
├── ClientList.tsx
├── ClientModal.tsx
├── ClientDetails.tsx
└── ClientFilters.tsx
```

Pode conter:

* formulários;
* listas;
* cards;
* tabelas específicas do módulo;
* modais específicos do módulo;
* filtros específicos do módulo;
* componentes visuais do módulo.

Não deve conter:

* chamadas HTTP diretas;
* fetch;
* axios manual;
* transformação complexa de payload;
* regras de negócio espalhadas;
* tipos inline repetidos.

---

## services

Diretório responsável pela comunicação com a API.

Exemplo:

```text
src/modules/clients/services/
└── client.service.ts
```

Responsabilidades:

* listar registros;
* buscar registro por ID;
* criar;
* atualizar;
* excluir;
* ativar/desativar;
* executar ações de domínio;
* encapsular chamadas dos endpoints gerados.

Obrigatório:

* consumir endpoints gerados pela OpenAPI/Orval em `src/core/http/generated`;
* evitar chamadas HTTP diretas;
* evitar duplicidade de métodos;
* centralizar comunicação do módulo com a API.

Não criar outro service se já existir service do módulo.

---

## schemas

Diretório responsável pelas validações do módulo.

Exemplo:

```text
src/modules/clients/schemas/
└── client.schema.ts
```

Responsabilidades:

* schemas Zod;
* validações de formulário;
* validações de payload;
* regras de campos obrigatórios;
* mensagens de validação.

Não colocar schemas dentro de componentes.

Não duplicar validações em vários arquivos.

---

## mappers

Diretório responsável pela transformação de dados.

Exemplo:

```text
src/modules/clients/mappers/
└── client.mapper.ts
```

Responsabilidades:

* converter resposta da API para modelo interno;
* converter formulário para payload da API;
* normalizar campos;
* tratar valores opcionais;
* adaptar nomes de campos;
* preparar dados para edição;
* preparar dados para envio.

Não fazer transformação complexa dentro de componentes.

Não repetir mapper em services ou pages.

---

## types

Diretório responsável pelos tipos do módulo.

Exemplo:

```text
src/modules/clients/types/
└── client.ts
```

Responsabilidades:

* interfaces;
* types;
* enums;
* contratos internos;
* tipos de formulário;
* tipos de filtros;
* tipos de listagem.

Sempre priorizar os tipos gerados pela OpenAPI quando existirem.

Criar types locais apenas quando forem realmente necessários para uso interno do front.

---

# 5. OpenAPI / Orval / endpoints gerados

Antes de implementar qualquer integração com API, consulte obrigatoriamente os arquivos gerados pela OpenAPI.

Local esperado:

```text
src/core/http/generated/
```

Verifique principalmente:

```text
src/core/http/generated/endpoints/
src/core/http/generated/model/
src/core/http/generated/schemas/
```

Ou a estrutura equivalente existente no projeto.

Regras obrigatórias:

* não criar chamadas HTTP manuais se já existir endpoint gerado;
* não duplicar types já gerados;
* não inventar contrato de API;
* não assumir payload sem consultar o tipo gerado;
* não consumir endpoint por URL manual se existir função gerada;
* não criar service paralelo fora do módulo.

O fluxo correto é:

```text
OpenAPI -> Orval -> generated -> module service -> components/pages
```

Nunca:

```text
component -> axios/fetch direto
```

---

# 6. Rota OpenAPI

Quando o projeto disponibilizar rota para OpenAPI, ela deve ser consultada antes de novas integrações.

Exemplo:

```text
GET /openapi/types
```

Essa rota lê o arquivo:

```text
docs/openapi.json
```

Sempre que houver dúvida sobre payload, retorno, endpoint, query params ou tipos, consultar a OpenAPI antes de implementar.

---

# 7. Pages

As pages devem apenas coordenar o fluxo da tela.

Responsabilidades das pages:

* carregar estado da tela;
* chamar services;
* passar dados para componentes;
* controlar abertura e fechamento de modal;
* controlar filtros;
* controlar paginação;
* controlar ações principais.

Não colocar nas pages:

* componentes gigantes;
* chamadas HTTP repetidas;
* validações inline complexas;
* mappers inline;
* types duplicados;
* regras de negócio extensas.

Se a lógica crescer, mover para service, mapper, schema ou componente específico.

---

# 8. Componentes globais

Componentes reutilizáveis devem ficar em:

```text
src/shared/components/ui/
```

Exemplos:

```text
Button
Input
Select
Textarea
Modal
Tabs
Table
Pagination
Badge
Alert
Card
Drawer
Tooltip
ConfirmDialog
Loading
EmptyState
```

Antes de criar qualquer componente global novo:

1. Verifique se já existe componente semelhante.
2. Reutilize o existente.
3. Parametrize quando necessário.
4. Evite duplicação visual e funcional.

Não criar componentes globais dentro de módulos.

---

# 9. Regra contra duplicidade de requisições

Evite rigorosamente requisições duplicadas.

Antes de corrigir ou implementar uma tela, verificar:

* `useEffect` com dependências incorretas;
* chamadas simultâneas em componente pai e filho;
* chamadas repetidas em modal de edição;
* chamadas acionadas por estado inicial e depois por filtro;
* chamadas duplicadas por stores;
* chamadas duplicadas por guards;
* chamadas duplicadas por providers;
* chamadas duplicadas por React Strict Mode em desenvolvimento;
* refetch automático desnecessário;
* service sendo chamado em mais de um lugar para o mesmo dado;
* componente carregando dado que a page já carregou;
* formulário buscando novamente dados já disponíveis;
* modal fazendo `show` desnecessário quando os dados já foram enviados pela listagem.

Regra prática:

```text
A tela/página deve ser a principal responsável por buscar dados.
Componentes recebem dados por props sempre que possível.
Modal/form só deve buscar dados se realmente não recebeu os dados necessários.
```

---

# 10. Edição de registros

Ao clicar em editar:

* se a listagem já possui dados suficientes, reutilizar esses dados;
* buscar por ID apenas se houver campos detalhados que não existem na listagem;
* nunca buscar o mesmo registro duas vezes;
* nunca buscar entidade relacionada sem necessidade;
* evitar buscar cliente ao editar pet se o pet já possui os dados necessários;
* evitar buscar tenant, usuário, produto ou serviço se o ID e o label já estiverem disponíveis.

---

# 11. Listagens

Listagens devem:

* usar paginação quando disponível;
* evitar carregar grandes volumes automaticamente;
* usar filtros e buscas;
* evitar carregar todos os produtos, serviços ou clientes se a tela exige busca;
* não enviar `perPage` por padrão se a API já define paginação padrão;
* enviar apenas `page` e filtros necessários, salvo requisito explícito.

Para produtos, serviços, clientes e registros grandes:

```text
não listar tudo automaticamente;
usar busca por nome, código, SKU, documento, telefone ou filtro adequado.
```

---

# 12. Formulários

Formulários devem usar:

* schema do módulo;
* types do módulo;
* mapper para preparar dados;
* service para enviar payload;
* componentes globais de input/select/modal quando existirem.

Não colocar payload manual espalhado no JSX.

Não duplicar validações.

Não fechar modal automaticamente em erro.

---

# 13. Tratamento de erros da API

Ao receber erro da API:

* exibir `message`;
* exibir erros de campos quando existirem;
* preservar dados preenchidos;
* não fechar modal;
* não limpar formulário;
* não redirecionar sem necessidade.

Formato comum de erro:

```json
{
  "message": "Validation error.",
  "status": false,
  "code": 422,
  "data": {
    "errors": {
      "email": ["validation.unique"]
    }
  }
}
```

Deve exibir:

* mensagem principal;
* erros por campo;
* feedback visual adequado.

---

# 14. Autenticação

Autenticação deve respeitar a estrutura existente:

```text
src/core/auth/
src/core/guards/
src/core/http/
src/core/storage/
```

Regras:

* não duplicar stores de auth;
* não criar novo fluxo paralelo de login/logout;
* logout deve aguardar retorno da API quando aplicável;
* após logout bem-sucedido, limpar sessão local;
* redirecionar para login somente depois de encerrar sessão;
* guards devem respeitar estado real da autenticação;
* interceptors devem tratar 401/403 sem loops infinitos.

---

# 15. Interceptors e HTTP client

Toda configuração global HTTP deve ficar no core.

Exemplos:

```text
src/core/http/api.ts
src/core/http/interceptors.ts
```

Não configurar interceptors dentro de módulos.

Não criar múltiplas instâncias HTTP sem necessidade.

Não duplicar baseURL.

---

# 16. Modais

Modais devem:

* receber dados por props quando possível;
* buscar dados somente quando necessário;
* preservar estado em erro;
* liberar abas ou etapas conforme fluxo;
* evitar chamadas duplicadas ao abrir;
* reutilizar componente global de modal/tabs quando existir.

Em modais com abas:

* aba principal pode carregar primeiro;
* abas secundárias podem carregar sob demanda;
* abas dependentes devem ficar bloqueadas até existir registro salvo;
* ao editar, não carregar todas as abas automaticamente sem necessidade.

---

# 17. Nomenclatura

Manter nomes consistentes.

Exemplo para módulo `clients`:

```text
ClientForm.tsx
ClientList.tsx
ClientModal.tsx
client.service.ts
client.schema.ts
client.mapper.ts
client.ts
```

Para módulo `products`:

```text
ProductForm.tsx
ProductList.tsx
ProductModal.tsx
product.service.ts
product.schema.ts
product.mapper.ts
product.ts
```

Evitar nomes genéricos como:

```text
Form.tsx
List.tsx
Modal.tsx
service.ts
types.ts
utils.ts
```

salvo se o padrão do projeto já utilizar isso.

---

# 18. Arquivos que não devem ser criados sem autorização

Não criar sem necessidade explícita:

```text
repositories/
adapters/
api/
requests/
queries/
mutations/
contexts/
stores/
hooks/
utils/
helpers/
lib/
providers/
controllers/
entities/
models/
```

Somente usar esses diretórios se já forem padrão do projeto.

---

# 19. Correção de bugs

Ao corrigir bugs:

1. Identifique a causa raiz.
2. Liste os arquivos diretamente envolvidos.
3. Corrija somente esses arquivos.
4. Não reestruture o projeto.
5. Não altere layout global sem necessidade.
6. Não crie novos componentes se o problema pode ser resolvido nos existentes.
7. Não altere contratos da API sem solicitação.

---

# 20. Implementação de novos módulos

Ao implementar novo módulo:

1. Criar pasta em `src/modules/module-name`.
2. Criar apenas os diretórios obrigatórios:

```text
components/
mappers/
schemas/
services/
types/
```

3. Consultar OpenAPI.
4. Usar endpoints gerados.
5. Criar service do módulo.
6. Criar types locais somente se necessário.
7. Criar schema de validação.
8. Criar mapper.
9. Criar componentes.
10. Integrar na rota/menu conforme padrão existente.

---

# 21. Fluxo correto de dados

O fluxo preferencial deve ser:

```text
Page
 -> module service
 -> generated endpoint
 -> API
 -> mapper
 -> component
```

Para envio:

```text
Form
 -> schema validation
 -> mapper
 -> module service
 -> generated endpoint
 -> API
```

Evitar:

```text
Component
 -> axios/fetch direto
 -> payload manual
 -> API
```

---

# 22. Regra de escopo

Toda tarefa deve respeitar o escopo solicitado.

Não implementar funcionalidades extras.
Não criar telas extras.
Não alterar estilos globais sem necessidade.
Não modificar módulos não relacionados.
Não atualizar dependências sem solicitação.
Não reorganizar arquivos sem autorização.

---

# 23. Checklist obrigatório antes de finalizar

Antes de concluir qualquer tarefa, verificar:

* não criou diretórios fora do padrão;
* não duplicou service;
* não duplicou chamada HTTP;
* não fez fetch/axios direto em componente;
* consultou OpenAPI/generated;
* usou types corretos;
* usou schema do módulo;
* usou mapper quando necessário;
* manteve tratamento de erros;
* não quebrou autenticação;
* não alterou arquivos fora do escopo;
* não criou componente global sem necessidade;
* não listou grandes volumes desnecessariamente;
* não enviou parâmetros desnecessários como `perPage` quando a API já define padrão.

---

# 24. Diretriz final

A prioridade é manter consistência arquitetural.

Sempre prefira:

```text
reutilizar > parametrizar > ajustar > criar novo
```

Criar algo novo deve ser a última opção.

Toda alteração deve ser objetiva, mínima, segura e alinhada à arquitetura existente.
