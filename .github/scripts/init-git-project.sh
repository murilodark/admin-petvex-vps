#!/usr/bin/env bash
set -euo pipefail

SCRIPTS_DIR=".github/scripts"

run_script() {
  local script="$1"
  local path="$SCRIPTS_DIR/$script"

  echo
  echo "=================================================="
  echo "Executando: $script"
  echo "=================================================="

  if [ ! -f "$path" ]; then
    echo "Erro: script não encontrado: $path"
    exit 1
  fi

  chmod +x "$path"
  "$path"
}

if [ ! -f ".env.git" ]; then
  echo "Erro: arquivo .env.git não encontrado."
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

echo
echo "Iniciando bootstrap completo do projeto GitHub..."

run_script "generate-github-repository.sh"
run_script "generate-github-branchs.sh"
run_script "generate-github-branchs-permissions.sh"
run_script "generate-github-environments.sh"

echo
echo "=================================================="
echo "Projeto GitHub inicializado com sucesso."
echo "=================================================="

# chmod +x .github/scripts/init-git-project.sh
# bash .github/scripts/init-git-project.sh 
