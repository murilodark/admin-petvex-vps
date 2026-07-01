# Tarefa: Adequar o Frontend Admin para a nova autenticação exclusiva da plataforma

## Objetivo

Adequar o frontend do painel administrativo (`admin.petvex.com.br`) para utilizar exclusivamente a nova autenticação de administradores da plataforma (`AdminUser`), removendo qualquer dependência de usuários de tenant ou da flag `is_global_admin`.

A API já foi alterada e disponibiliza os novos endpoints de autenticação administrativa.

---

# Antes de iniciar

Analisar toda a estrutura atual do frontend do admin e identificar:

* Fluxo atual de login.
* Contexto de autenticação.
* Providers.
* Hooks.
* Guards.
* Interceptors.
* Rotas protegidas.
* Persistência do token.
* Persistência do usuário autenticado.
* Uso de `tenant`.
* Uso de `slug`.
* Uso de `X-Tenant`.
* Uso de `is_global` ou `is_global_admin`.
* Qualquer dependência compartilhada com o App do Tenant.

Não alterar arquitetura existente sem necessidade.

Não recriar componentes já existentes.

Reutilizar toda infraestrutura possível.

---

# Regras obrigatórias do projeto

Seguir integralmente a arquitetura existente.

Utilizar exclusivamente:

* OpenAPI atualizado
* Orval
* Tipagens geradas
* Core HTTP existente
* Interceptors existentes
* Providers existentes
* Componentes globais

Não criar chamadas HTTP manuais.

Não utilizar axios diretamente.

Não criar serviços paralelos.

Não duplicar lógica.

Não utilizar mocks.

Não alterar contratos da API.

---

# Atualizar OpenAPI

Antes de iniciar:

Gerar novamente os tipos utilizando o OpenAPI atualizado.

Consumir obrigatoriamente os novos endpoints:

```
POST /api/v1/admin/auth/login

GET /api/v1/admin/auth/me

POST /api/v1/admin/auth/logout
```

Todo consumo deve utilizar exclusivamente os arquivos gerados pelo Orval.

---

# Atualizar Login

Substituir completamente o fluxo atual de autenticação administrativa.

O login deve utilizar:

```
POST /api/v1/admin/auth/login
```

Payload:

```json
{
    "email": "",
    "password": ""
}
```

Após sucesso:

* armazenar token
* armazenar AdminUser autenticado
* atualizar contexto global
* redirecionar para Dashboard

Não utilizar nenhum endpoint legado.

Não utilizar login de tenant.

---

# Atualizar contexto de autenticação

Adequar o AuthProvider para trabalhar com:

```
AdminUser
```

Remover dependências relacionadas a:

* tenant
* usuário operacional
* is_global_admin
* slug
* domínio do tenant

O contexto deve representar exclusivamente:

```
Administrador da Plataforma
```

---

# Atualizar método "me"

Na inicialização da aplicação utilizar:

```
GET /api/v1/admin/auth/me
```

Objetivos:

* validar token
* restaurar sessão
* recuperar dados atualizados do administrador

Caso o token seja inválido:

* limpar armazenamento
* limpar contexto
* redirecionar para login

---

# Atualizar Logout

Logout deve utilizar:

```
POST /api/v1/admin/auth/logout
```

Após sucesso:

* remover token
* limpar cache
* limpar queries
* limpar contexto
* remover usuário
* remover armazenamento local
* redirecionar para login

---

# Rotas protegidas

Revisar todo o sistema de proteção de rotas.

Garantir que somente usuários autenticados através do novo fluxo possam acessar o painel.

Não utilizar:

```
is_global

is_global_admin

tenant

roles do tenant
```

A validação deve ocorrer apenas pela existência de um `AdminUser` autenticado.

---

# Interceptors

Revisar interceptors existentes.

Garantir que:

401

continue redirecionando para Login.

403

exiba mensagem adequada de acesso negado.

Não alterar comportamento já existente para demais erros.

---

# Persistência

Revisar armazenamento local.

Persistir apenas:

* token
* dados do AdminUser

Não persistir:

* tenant
* slug
* domínio
* informações de usuários operacionais

---

# Tipagens

Atualizar todas as tipagens relacionadas ao usuário autenticado.

Criar ou utilizar tipagem equivalente ao retorno da API:

```ts
interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    last_login_at: string | null;
}
```

Não utilizar interfaces antigas de usuário de tenant.

---

# Header do sistema

Atualizar componentes que exibem usuário logado.

Devem consumir exclusivamente os dados retornados por:

```
GET /admin/auth/me
```

Exibir corretamente:

* Nome
* Email
* Cargo (role)

---

# Remover dependências antigas

Remover qualquer uso de:

```
is_global

is_global_admin

tenant

tenantUser

TenantContext

X-Tenant

slug

tenantId
```

no fluxo de autenticação do painel administrativo.

Isso não deve afetar nenhum outro módulo.

---

# Compatibilidade

Não alterar:

* Dashboard
* Clientes
* Tenants
* Billing
* Plans
* Payment Gateways
* Usuários
* Demais módulos administrativos

Apenas adaptar o mecanismo de autenticação.

---

# UX

Manter exatamente:

* Layout
* Componentes
* Tema
* Feedback visual
* Estados de carregamento
* Skeletons
* Toasts
* Tratamento de erros

Não alterar experiência do usuário.

---

# Validação

Validar completamente:

* Login válido.
* Login inválido.
* Admin inativo.
* Logout.
* Atualização de página.
* Recuperação automática da sessão.
* Token expirado.
* Token inválido.
* Refresh da aplicação.
* Navegação entre módulos.
* Deep links.
* Redirecionamento após autenticação.

---

# Critérios de aceite

* O painel administrativo autentica exclusivamente utilizando `AdminUser`.
* Nenhuma tela do admin depende mais de usuários de tenant.
* Nenhuma requisição envia informações de tenant durante o login.
* Toda autenticação utiliza apenas os novos endpoints administrativos.
* O endpoint legado não é mais utilizado pelo frontend.
* O contexto de autenticação está isolado do App do Tenant.
* Nenhuma funcionalidade administrativa existente foi quebrada.
* Toda implementação segue a arquitetura atual do projeto, reutilizando componentes, hooks, providers, interceptors e tipagens já existentes, sem duplicação de código e consumindo exclusivamente os endpoints e tipos gerados pelo OpenAPI/Orval.
