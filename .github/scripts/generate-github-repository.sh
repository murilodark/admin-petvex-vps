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
REPOSITORY_SECURITY="$(extract_value_from_block "INFO_GIT" "REPOSITORY_SECURITY")"
MESSAGE="$(extract_value_from_block "INFO_GIT" "MESSAGE")"

if [ -z "$OWNER" ]; then
  echo "Erro: OWNER não encontrado em INFO_GIT."
  exit 1
fi

if [ -z "$REPOSITORY" ]; then
  echo "Erro: REPOSITORY não encontrado em INFO_GIT."
  exit 1
fi

if [ -z "$REPOSITORY_SECURITY" ]; then
  REPOSITORY_SECURITY="private"
fi

if [ -z "$MESSAGE" ]; then
  MESSAGE="Initial commit - $(date)"
fi

case "$REPOSITORY_SECURITY" in
  public|private)
    ;;
  *)
    echo "Erro: REPOSITORY_SECURITY deve ser public ou private."
    exit 1
    ;;
esac

echo
echo "=================================================="
echo "Verificando repositório: $OWNER/$REPOSITORY"
echo "=================================================="

if gh repo view "$OWNER/$REPOSITORY" >/dev/null 2>&1; then
  echo "Repositório já existe: $OWNER/$REPOSITORY"

  CURRENT_VISIBILITY="$(gh repo view "$OWNER/$REPOSITORY" --json visibility -q .visibility | tr '[:upper:]' '[:lower:]')"

  if [ "$CURRENT_VISIBILITY" != "$REPOSITORY_SECURITY" ]; then
    echo "Atualizando visibilidade para: $REPOSITORY_SECURITY"

    if [ "$REPOSITORY_SECURITY" = "private" ]; then
      gh repo edit "$OWNER/$REPOSITORY" --visibility private
    else
      gh repo edit "$OWNER/$REPOSITORY" --visibility public
    fi
  fi
else
  echo "Criando repositório: $OWNER/$REPOSITORY"

   VISIBILITY_FLAG="--private"

  gh repo create "$OWNER/$REPOSITORY" \
    $VISIBILITY_FLAG \
    --description "Laravel API deploy template with GitHub Actions, Docker, Traefik and VPS automation" \
    --disable-wiki

  echo "Repositório criado."
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Configurando remote origin..."

  git remote add origin "https://github.com/$OWNER/$REPOSITORY.git"
else
  echo "Atualizando remote origin..."

  git remote set-url origin "https://github.com/$OWNER/$REPOSITORY.git"
fi

if [ -z "$(git status --porcelain)" ]; then
  echo "Nenhuma alteração local para commit."
else
  echo "Criando commit..."

  git add .
  git commit -m "$MESSAGE"
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$CURRENT_BRANCH" = "master" ]; then
  git branch -M main
  CURRENT_BRANCH="main"
fi

echo "Enviando branch atual: $CURRENT_BRANCH"

git push -u origin "$CURRENT_BRANCH"

echo
echo "Repositório inicial criado/sincronizado com sucesso."