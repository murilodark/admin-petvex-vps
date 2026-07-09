# chmod +x .github/scripts/generate-github-environments.sh
# bash .github/scripts/generate-github-environments.sh
#!/usr/bin/env bash
set -euo pipefail

# OWNER="murilodark" 
# REPO="api_petvex"
ENV_FILE=".env.git"

ENV_FILE=".env.git"

load_info_git_value() {
  local key="$1"

  awk '
    /^INFO_GIT=\{/ { inside=1; next }
    inside && /^\}/ { inside=0 }
    inside { print }
  ' "$ENV_FILE" \
    | grep -E "^[[:space:]]*$key=" \
    | head -n 1 \
    | cut -d '=' -f2- \
    | sed 's/^[[:space:]]*//' \
    | sed 's/[[:space:]]*$//' \
    | sed 's/^"//' \
    | sed 's/"$//'
}

OWNER="$(load_info_git_value "OWNER")"
REPO="$(load_info_git_value "REPOSITORY")"
SECRETS_PRODUCTION="$(load_info_git_value "SECRETS_PRODUCTION")"
SECRETS_HOMOLOG="$(load_info_git_value "SECRETS_HOMOLOG")"



if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  echo "Erro: OWNER ou REPOSITORY não encontrado em $ENV_FILE dentro do bloco INFO_GIT."
  exit 1
fi

echo "OWNER=$OWNER"
echo "REPO=$REPO"






if ! command -v gh >/dev/null 2>&1; then
  echo "Erro: GitHub CLI não encontrado. Instale com: sudo apt install gh -y"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Erro: GitHub CLI não autenticado. Execute: gh auth login"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Erro: arquivo $ENV_FILE não encontrado."
  exit 1
fi

extract_block() {
  local block_name="$1"

  awk -v block="$block_name" '
    $0 ~ "^" block "[[:space:]]*=\\{" { inside=1; next }
    inside && $0 ~ "^\\}" { inside=0; exit }
    inside {
      gsub(/^[[:space:]]+/, "", $0)
      if ($0 != "") print
    }
  ' "$ENV_FILE"
}


create_environment() {
  local env_name="$1"

  echo "Criando/atualizando environment: $env_name"

  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/environments/$env_name" \
    >/dev/null
}

set_environment_secret() {
  local env_name="$1"
  local secret_name="$2"
  local secret_value="$3"

  echo "Criando/atualizando secret: $secret_name em $env_name"

  gh secret set "$secret_name" \
    --repo "$OWNER/$REPO" \
    --env "$env_name" \
    --body "$secret_value"
}

resolve_block() {
  local content="$1"

  while IFS= read -r line; do
    [ -z "$line" ] && continue

    local key="${line%%=*}"
    local value="${line#*=}"

    value="$(eval "echo \"$value\"")"

    export "$key=$value"

    echo "$key=$value"
  done <<< "$content"
}

extract_multiline_value_from_block() {
  local block_name="$1"
  local key="$2"

  awk -v block="$block_name" -v key="$key" '
    $0 ~ "^[[:space:]]*" block "[[:space:]]*=\\{" {
      inside_block=1
      next
    }

    inside_block && $0 ~ "^[[:space:]]*\\}" {
      inside_block=0
      exit
    }

    inside_block {
      line=$0
      gsub(/^[[:space:]]+/, "", line)

      if (line ~ "^" key "=") {
        sub("^" key "=", "", line)
        print line
        inside_value=1
        next
      }
    }

    inside_value {
      print $0

      if ($0 ~ /^-----END OPENSSH PRIVATE KEY-----$/) {
        exit
      }
    }
  ' "$ENV_FILE"
}

if [ "$SECRETS_PRODUCTION" = "true" ]; then
  echo "Sincronizando secrets para o environment de produção..."
  SECRETS_PRODUCTION_CONTENT="$(resolve_block "$(extract_block "SECRETS_PRODUCTION")")"
  ENV_API_PRODUCTION_CONTENT="$(resolve_block "$(extract_block "ENV_API_PRODUCTION")")"
  SSH_PRIVATE_KEY_PRODUCTION_CONTENT="$(extract_multiline_value_from_block "INFO_GIT" "SSH_PRIVATE_KEY_PRODUCTION")"

  if [ -z "$SECRETS_PRODUCTION_CONTENT" ]; then
    echo "Erro: bloco SECRETS_PRODUCTION vazio ou não encontrado."
    exit 1
  fi

  if [ -z "$SSH_PRIVATE_KEY_PRODUCTION_CONTENT" ]; then
    echo "Erro: SSH_PRIVATE_KEY_PRODUCTION vazio ou não encontrado em INFO_GIT."
    exit 1
  fi

  create_environment "production"
  set_environment_secret "production" "SECRETS_PRODUCTION" "$SECRETS_PRODUCTION_CONTENT"
  set_environment_secret "production" "SSH_PRIVATE_KEY" "$SSH_PRIVATE_KEY_PRODUCTION_CONTENT"
else
  echo "Ignorando sincronização de secrets para o environment de produção."
fi


if [ "$SECRETS_HOMOLOG" = "true" ]; then
    echo "Sincronizando secrets para o environment de homologação..."
 
    SECRETS_HOMOLOG_CONTENT="$(resolve_block "$(extract_block "SECRETS_HOMOLOG")")"
    ENV_API_HOMOLOG_CONTENT="$(resolve_block "$(extract_block "ENV_API_HOMOLOG")")"
    SSH_PRIVATE_KEY_HOMOLOG_CONTENT="$(extract_multiline_value_from_block "INFO_GIT" "SSH_PRIVATE_KEY_HOMOLOG")"

    if [ -z "$SECRETS_HOMOLOG_CONTENT" ]; then
      echo "Erro: bloco SECRETS_HOMOLOG vazio ou não encontrado."
      exit 1
    fi

    if [ -z "$SSH_PRIVATE_KEY_HOMOLOG_CONTENT" ]; then
      echo "Erro: SSH_PRIVATE_KEY_HOMOLOG vazio ou não encontrado em INFO_GIT."
      exit 1
    fi

    create_environment "homolog"
    set_environment_secret "homolog" "SECRETS_HOMOLOG" "$SECRETS_HOMOLOG_CONTENT"
    set_environment_secret "homolog" "SSH_PRIVATE_KEY" "$SSH_PRIVATE_KEY_HOMOLOG_CONTENT"
else
  echo "Ignorando sincronização de secrets para o environment de homologação."
fi





echo "Environments e secrets sincronizados com sucesso."