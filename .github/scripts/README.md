# Scripts

Este diretório contém todos os scripts responsáveis por automatizar a infraestrutura GitHub, provisionamento de environments, criação de branches, configuração de permissões e bootstrap completo do projeto.

A proposta é transformar toda a configuração operacional em uma arquitetura reutilizável baseada em:

- Infrastructure as Code
- GitHub Environment Provisioning
- DevOps Automation
- CI/CD Bootstrap
- Repositórios reutilizáveis

---

# Estrutura

```txt
.github/scripts/
├── init-git-project.sh
├── generate-github-repository.sh
├── generate-github-branchs.sh
├── generate-github-branchs-permissions.sh
└── generate-github-environments.sh
```

---

# Pré-requisitos

## GitHub CLI

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install gh -y
```

---

## Login GitHub CLI

```bash
gh auth login
```

Fluxo recomendado:

```txt
GitHub.com
HTTPS
Login with browser
```

---

# Arquivo .env.git

Todos os scripts utilizam o arquivo:

```txt
.env.git
```

como fonte central de configuração.

---

# Estrutura esperada

```env
# =============================================================================
# GITHUB INFO
# =============================================================================

INFO_GIT={
    OWNER="murilodark"
    REPOSITORY="git-public-front"
    MESSAGE="Deploying to production environment - $(date)"
}

# =============================================================================
# ENVIRONMENT PRODUCTION
# =============================================================================

SECRETS_PRODUCTION={
    VPS_HOST=
    SSH_PRIVATE_KEY=
    USERNAME=
    CONTAINER_NAME=
    DEPLOY=true
    BRANCH=main
    VITE_APP_NAME=
    VITE_APP_ENV=production
    VITE_API_URL=
    VITE_FRONT_URL=
    VITE_ENABLE_DEVTOOLS=false
    VITE_ENABLE_DEBUG=false
    VITE_ENABLE_LOGS=false
    VITE_REQUEST_TIMEOUT=30000
}

# =============================================================================
# ENVIRONMENT HOMOLOG
# =============================================================================

SECRETS_HOMOLOG={
    VPS_HOST=
    SSH_PRIVATE_KEY=
    USERNAME=
    CONTAINER_NAME=
    DEPLOY=false
    BRANCH=develop
    VITE_APP_NAME=
    VITE_APP_ENV=homolog
    VITE_API_URL=
    VITE_FRONT_URL=
    VITE_ENABLE_DEVTOOLS=true
    VITE_ENABLE_DEBUG=true
    VITE_ENABLE_LOGS=true
    VITE_REQUEST_TIMEOUT=30000
}
```

---

# init-git-project.sh

Script principal responsável por executar automaticamente todos os scripts na ordem correta.

---

## Fluxo executado

```txt
1. Cria o repositório GitHub
2. Cria/sincroniza branches
3. Configura permissões das branches
4. Cria environments
5. Cria/atualiza secrets
```

---

## Execução

```bash
./.github/scripts/init-git-project.sh
```

---

# generate-github-repository.sh

Responsável por:

- criar o repositório GitHub caso não exista
- configurar remote origin
- criar commit inicial
- enviar código inicial
- sincronizar branch atual

---

## O que ele faz

### Cria automaticamente:

```txt
OWNER/REPOSITORY
```

---

## Configura:

```txt
remote origin
```

---

## Realiza:

```txt
git add
git commit
git push
```

---

## Execução

```bash
./.github/scripts/generate-github-repository.sh
```

---

# generate-github-branchs.sh

Responsável por criar e sincronizar automaticamente as branches definidas no `.env.git`.

---

## Branches utilizadas

```txt
SECRETS_PRODUCTION -> BRANCH
SECRETS_HOMOLOG -> BRANCH
```

---

## Exemplo

```txt
main
develop
```

---

## O que ele faz

- cria branches locais
- sincroniza branches remotas
- cria branch remota caso não exista
- configura upstream automaticamente

---

## Execução

```bash
./.github/scripts/generate-github-branchs.sh
```

---

# generate-github-branchs-permissions.sh

Responsável por configurar automaticamente permissões e proteções das branches.

---

## O que ele configura

### Repositório

- public
- issues enabled
- wiki disabled
- projects disabled

---

### Branches

- block force push
- block delete branch
- proteção automática

---

## Branches protegidas

```txt
SECRETS_PRODUCTION -> BRANCH
SECRETS_HOMOLOG -> BRANCH
```

---

## Execução

```bash
./.github/scripts/generate-github-branchs-permissions.sh
```

---

# generate-github-environments.sh

Responsável por criar automaticamente os environments GitHub e sincronizar os secrets.

---

## Environments criados

```txt
production
homolog
```

---

## Secrets criados

### Environment: production

```txt
SECRETS_PRODUCTION
```

---

### Environment: homolog

```txt
SECRETS_HOMOLOG
```

---

## O que ele faz

- cria environments
- cria secrets
- atualiza secrets automaticamente
- sincroniza configurações do `.env.git`

---

## Execução

```bash
./.github/scripts/generate-github-environments.sh
```

---

# Fluxo Completo da Arquitetura

```txt
.env.git
    ↓
Scripts GitHub
    ↓
GitHub Repository
    ↓
GitHub Branches
    ↓
GitHub Permissions
    ↓
GitHub Environments
    ↓
GitHub Secrets
    ↓
GitHub Actions
    ↓
Deploy VPS
```

---

# Objetivo Final

Criar uma arquitetura Full Stack reutilizável contendo:

- React
- Vue
- Vite
- Docker
- Traefik
- SSL automático
- múltiplos domínios
- GitHub Actions
- CI/CD
- homolog
- production
- VPS automatizada
- bootstrap automático
- provisionamento automático
- environments automatizados

---

# Filosofia do Projeto

Todo o setup operacional é tratado como código.

Nada deve depender de configuração manual.

O objetivo é permitir:

```txt
1 arquivo .env.git
+
1 comando
=
Projeto completamente provisionado
```
