# AGENTS.md — Frontend Admin Global PetVex

Este arquivo é a entrada principal de instruções para qualquer agente de desenvolvimento utilizado no projeto, incluindo Codex, Google AI Studio e ferramentas equivalentes.

As regras abaixo são obrigatórias para análise, implementação, correção, refatoração e integração com a API.

---

## 1. Stack Oficial do Projeto

- **Frontend**: React 19 + TypeScript
- **Build & Dev**: Vite
- **Estilização**: Tailwind CSS (Utility classes diretas)
- **Estado Assíncrono**: TanStack React Query (v5)
- **Gerenciamento de Formulários**: React Hook Form + Zod
- **Infraestrutura HTTP**: Axios centralizado
- **Integração de Contrato**: OpenAPI/Orval

Este repositório é o painel administrativo global da plataforma PetVex e consome exclusivamente a API Laravel administrativa em `/v1/admin`.

---

## 2. Escopo de Integração e Geração Orval

A geração de tipos e endpoints HTTP é totalmente automatizada a partir do arquivo de especificação OpenAPI do backend.

- **Filtro de Rotas**: Somente rotas pertencentes a `/v1/admin` são aceitas e processadas.
- **Configuração Principal**:
  - `orval.config.ts`
  - `src/core/http/orval-mutator.ts`
  - `src/core/http/generated/endpoints/` (separados por domínios)
  - `src/core/http/generated/models/` (separados por domínios)

### Sincronização Incremental da API

A geração de código é incremental e é realizada pelos seguintes comandos:
- `npm run api:prepare`: Prepara os metadados e os planos de geração OpenAPI.
- `npm run api:orval`: Roda o gerador Orval para criar endpoints e models baseados na especificação OpenAPI.
- `npm run api:finalize`: Finaliza a estruturação dos arquivos gerados.
- **Geração Completa**: `npm run api:generate` (que unifica os passos acima).

### Regras Obrigatórias para Arquivos Gerados:
- **NÃO editar** arquivos de forma manual dentro de `src/core/http/generated`.
- Não corrigir manualmente assinaturas de endpoints ou models gerados.
- Não duplicar payloads, responses ou contratos existentes na pasta `generated`.
- Se houver divergências de contrato, estas devem ser corrigidas na API ou no processo de build e geração, nunca remendadas em código local do frontend.

---

## 3. Central de Infraestrutura HTTP

Toda a comunicação REST do projeto é orquestrada centralizadamente pelo Core HTTP. É **estritamente proibido** criar novas instâncias de Axios, duplicar URLs base ou criar wrappers paralelos.

- **Axios Centralizado**: `src/core/http/api.ts` (Instância de Axios configurada globalmente).
- **Interceptors**: `src/core/http/interceptors.ts` (Gerencia tokens de autenticação e fluxos globais de status, como 401/403).
- **Normalizador de Erros**: `src/core/http/errors.ts` (Normaliza respostas de erro de validação (422), exceções do Laravel e falhas de conexão).
- **Mutador Customizado do Orval**: `src/core/http/orval-mutator.ts` (Garante que os hooks de React Query utilizem a instância Axios centralizada do projeto).

*Confirmação: Não existem instâncias locais de Axios ou adaptadores paralelos fora do diretório `src/core/http/`.*

---

## 4. Fluxo de Arquitetura e Camadas

O projeto segue uma arquitetura modular orientada a APIs:

```txt
src/
├── app/
├── assets/
├── config/
├── core/
├── layouts/
├── modules/
│   └── {module}/
│       ├── components/
│       ├── hooks/
│       ├── mappers/
│       ├── pages/
│       ├── schemas/
│       ├── services/
│       ├── types/
│       └── utils/
├── shared/
└── styles/
```

### Responsabilidades de Cada Camada:

1. **Pages**: Orchestram o fluxo de dados, estado local simples, filtros de URL, paginação e modais. Não devem conter tabelas gigantes inline, mappers inline ou schemas Zod inline.
2. **Components**: Elementos de UI focados e reutilizáveis com props fortemente tipadas. Não devem conter lógica de negócios complexa ou chamadas HTTP diretas.
3. **Services**: Contêm a lógica de integração pura, adaptando os responses gerados ou agrupando múltiplas chamadas consecutivas.
4. **Mappers**: Transformam contratos brutos da API (e.g. formatos de data, campos nullables) para modelos amigáveis da UI e vice-versa.
5. **Schemas**: Validações Zod para inputs e filtros de formulários.
6. **Types**: Definições específicas de tela, filtros locais ou composições que não existem puramente nos models gerados pelo Orval.

---

## 5. Proibição Estrita de Mocks e Fallbacks Locais

O Admin PetVex opera de forma integrada e transparente com a API Laravel.
- **NÃO usar dados fictícios**: É estritamente proibido retornar mocks, usar fallbacks fictícios (como ler/escrever dados em `localStorage` para simular sucesso quando a API falha) ou simular latência de rede.
- **Tratamento Real de Erros**: Em caso de falha da API, o erro deve se propagar naturalmente para que os estados de erro visuais do React Query/UI sejam exibidos para o administrador.
- **Formulários e 422**: Erros de validação da API (status 422) devem popular os campos correspondentes via React Hook Form e manter os modais e formulários abertos para correção pelo usuário.

---

## 6. Diretrizes do React Query

- Reutilize sempre os hooks customizados de query e mutation gerados pelo Orval.
- Use `enabled` para queries que dependem de dados anteriores para rodar.
- Após mutations bem-sucedidas, invalide estritamente as queries associadas para manter as tabelas atualizadas. Evite invalidar todo o cache global.
- Evite buscas duplicadas ou concorrentes no Strict Mode gerenciando as chaves de query com rigor.

---

## 7. Componentes Visuais Compartilhados

Antes de criar um novo componente visual, verifique sempre a biblioteca compartilhada em `src/shared`. Não recrie equivalentes para componentes estabelecidos como:
- `Button`, `Modal`, `Input`, `Select`, `Textarea`, `Table`, `Card`, `Badge`, `Tabs`, `Loading`, `EmptyState`, `Alert`, `Drawer`, `Tooltip`, `ConfirmDialog`.

---

## 8. Verificação e Qualidade de Código

Sempre valide as alterações locais antes de enviar os commits.

```bash
# Executa a validação de lint
npm run lint

# Executa o build de produção do Vite para testar se há falhas de compilação
npm run build
```

Uma tarefa só está completa quando os tipos compilam perfeitamente sem erros (`npm run build`), o linter roda limpo (`npm run lint`), os dados são buscados de forma dinâmica na API sem requisições duplicadas, e todos os erros de rede são tratados e exibidos de forma transparente na interface de usuário.
