#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.git"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erro: arquivo $ENV_FILE não encontrado."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Erro: GitHub CLI não encontrado."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Erro: GitHub CLI não autenticado. Execute: gh auth login"
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
        gsub(/^"/, "", $0)
        gsub(/"$/, "", $0)
        print $0
        exit
      }
    }
  ' "$ENV_FILE"
}

OWNER="$(extract_value_from_block "INFO_GIT" "OWNER")"
REPOSITORY="$(extract_value_from_block "INFO_GIT" "REPOSITORY")"

PRODUCTION_BRANCH="$(extract_value_from_block "SECRETS_PRODUCTION" "BRANCH")"
HOMOLOG_BRANCH="$(extract_value_from_block "SECRETS_HOMOLOG" "BRANCH")"

if [ -z "$OWNER" ]; then
  echo "Erro: OWNER não encontrado em INFO_GIT."
  exit 1
fi

if [ -z "$REPOSITORY" ]; then
  echo "Erro: REPOSITORY não encontrado em INFO_GIT."
  exit 1
fi

if [ -z "$PRODUCTION_BRANCH" ]; then
  echo "Erro: BRANCH não encontrada em SECRETS_PRODUCTION."
  exit 1
fi

if [ -z "$HOMOLOG_BRANCH" ]; then
  echo "Erro: BRANCH não encontrada em SECRETS_HOMOLOG."
  exit 1
fi

configure_repository() {
  gh repo edit "$OWNER/$REPOSITORY" \
    --visibility public \
    --enable-issues=true \
    --enable-wiki=false \
    --enable-projects=false
}

protect_branch() {
  local branch="$1"

  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPOSITORY/branches/$branch/protection" \
    --input - <<JSON
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
}

echo
echo "=================================================="
echo "Configurando permissões: $OWNER/$REPOSITORY"
echo "=================================================="
echo "Production branch: $PRODUCTION_BRANCH"
echo "Homolog branch: $HOMOLOG_BRANCH"

configure_repository

echo
echo "Protegendo branch production: $PRODUCTION_BRANCH"

if protect_branch "$PRODUCTION_BRANCH"; then
  echo "OK: $PRODUCTION_BRANCH"
else
  echo "Falha ao proteger branch: $PRODUCTION_BRANCH"
fi

echo
echo "Protegendo branch homolog: $HOMOLOG_BRANCH"

if protect_branch "$HOMOLOG_BRANCH"; then
  echo "OK: $HOMOLOG_BRANCH"
else
  echo "Falha ao proteger branch: $HOMOLOG_BRANCH"
fi

echo
echo "Permissões de branches finalizadas."