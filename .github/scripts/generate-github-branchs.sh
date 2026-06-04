#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.git"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erro: arquivo $ENV_FILE não encontrado."
  exit 1
fi

extract_value_from_block() {
  local block_name="$1"
  local key="$2"

  awk -v block="$block_name" -v key="$key" '
    $0 ~ "^" block "[[:space:]]*=\\{" { inside=1; next }
    inside && $0 ~ "^\\}" { inside=0; exit }
    inside {
      gsub(/^[[:space:]]+/, "", $0)

      if ($0 ~ "^" key "=") {
        sub("^" key "=", "", $0)
        print $0
        exit
      }
    }
  ' "$ENV_FILE"
}

ensure_git_repository() {
  if [ ! -d ".git" ]; then
    echo "Erro: execute este script na raiz do repositório."
    exit 1
  fi
}

ensure_remote_origin() {
  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Erro: remote origin não configurado."
    exit 1
  fi
}

ensure_branch() {
  local branch="$1"

  if [ -z "$branch" ]; then
    echo "Erro: nome da branch vazio."
    exit 1
  fi

  echo "Sincronizando branch: $branch"

  git fetch origin --prune

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Branch local já existe: $branch"

  elif git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    echo "Branch remota encontrada. Criando branch local: $branch"

    git checkout -b "$branch" "origin/$branch"

  else
    echo "Branch não existe. Criando branch local: $branch"

    git checkout -b "$branch"
  fi

  git push -u origin "$branch"
}

ensure_git_repository
ensure_remote_origin

PRODUCTION_BRANCH="$(extract_value_from_block "SECRETS_PRODUCTION" "BRANCH")"
HOMOLOG_BRANCH="$(extract_value_from_block "SECRETS_HOMOLOG" "BRANCH")"

if [ -z "$PRODUCTION_BRANCH" ]; then
  echo "Erro: BRANCH não encontrada em SECRETS_PRODUCTION."
  exit 1
fi

if [ -z "$HOMOLOG_BRANCH" ]; then
  echo "Erro: BRANCH não encontrada em SECRETS_HOMOLOG."
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "Production branch: $PRODUCTION_BRANCH"
echo "Homolog branch: $HOMOLOG_BRANCH"

ensure_branch "$PRODUCTION_BRANCH"
ensure_branch "$HOMOLOG_BRANCH"

git checkout "$CURRENT_BRANCH"

echo "Branches sincronizadas com sucesso."
