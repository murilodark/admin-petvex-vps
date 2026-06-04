#!/usr/bin/env bash
set -euo pipefail

AI_REPO="/home/murilo/Documentos/projetos/petvex/adm-petvex-aistudio"
TARGET_REPO="/home/murilo/Documentos/projetos/petvex/adm-petvex"

RSYNC_ARGS=(
  -avim
  --delete
  --checksum

  --include='/src/***'
  --include='/index.html'
  --include='/metadata.json'
  --include='/orval.config.ts'
  --include='/package-lock.json'
  --include='/package.json'
  --include='/tsconfig.json'
  --include='/vite.config.ts'

  --exclude='*'
)

echo "Atualizando repositório AI Studio..."

cd "$AI_REPO"
git pull origin main

echo ""
echo "Gerando lista de diferenças entre origem atualizada e destino..."

PREVIEW=$(rsync "${RSYNC_ARGS[@]}" --dry-run "$AI_REPO/" "$TARGET_REPO/")

CREATED_FILES=$(echo "$PREVIEW" | awk '/^>f\+/{print $2}' || true)
UPDATED_FILES=$(echo "$PREVIEW" | awk '/^>f[^+]/{print $2}' || true)
DELETED_FILES=$(echo "$PREVIEW" | awk '/^\*deleting/{print $2}' || true)

echo ""
echo "=========================================="
echo "Arquivos que serão INCLUÍDOS"
echo "=========================================="
if [ -n "$CREATED_FILES" ]; then
  echo "$CREATED_FILES"
else
  echo "Nenhum"
fi

echo ""
echo "=========================================="
echo "Arquivos que serão MODIFICADOS"
echo "=========================================="

if [ -n "$UPDATED_FILES" ]; then
  mapfile -t UPDATED_LIST <<< "$UPDATED_FILES"

  for i in "${!UPDATED_LIST[@]}"; do
    printf "%d - %s\n" "$((i + 1))" "${UPDATED_LIST[$i]}"
  done
else
  UPDATED_LIST=()
  echo "Nenhum"
fi

echo ""
echo "=========================================="
echo "Arquivos que serão REMOVIDOS"
echo "=========================================="
if [ -n "$DELETED_FILES" ]; then
  echo "$DELETED_FILES"
else
  echo "Nenhum"
fi

CREATED_COUNT=$(echo "$CREATED_FILES" | sed '/^$/d' | wc -l)
UPDATED_COUNT=${#UPDATED_LIST[@]}
DELETED_COUNT=$(echo "$DELETED_FILES" | sed '/^$/d' | wc -l)

echo ""
echo "=========================================="
echo "Resumo"
echo "=========================================="
echo "Incluídos  : $CREATED_COUNT"
echo "Modificados: $UPDATED_COUNT"
echo "Removidos  : $DELETED_COUNT"

if [ "$UPDATED_COUNT" -gt 0 ]; then
  echo ""
  read -r -p "Deseja visualizar as diferenças dos arquivos modificados? (s/N): " VIEW_DIFF

  while [[ "$VIEW_DIFF" =~ ^[sS]$ ]]; do
    echo ""
    echo "Arquivos modificados:"
    for i in "${!UPDATED_LIST[@]}"; do
      printf "%d - %s\n" "$((i + 1))" "${UPDATED_LIST[$i]}"
    done

    echo ""
    read -r -p "Digite o número do arquivo: " FILE_NUMBER

    if ! [[ "$FILE_NUMBER" =~ ^[0-9]+$ ]]; then
      echo "Número inválido."
    elif [ "$FILE_NUMBER" -lt 1 ] || [ "$FILE_NUMBER" -gt "$UPDATED_COUNT" ]; then
      echo "Número fora da lista."
    else
      FILE_PATH="${UPDATED_LIST[$((FILE_NUMBER - 1))]}"

      echo ""
      echo "=========================================="
      echo "Diff do arquivo: $FILE_PATH"
      echo "Origem : $AI_REPO/$FILE_PATH"
      echo "Destino: $TARGET_REPO/$FILE_PATH"
      echo "=========================================="

      git diff --no-index -- "$TARGET_REPO/$FILE_PATH" "$AI_REPO/$FILE_PATH" || true
    fi

    echo ""
    read -r -p "Deseja visualizar outro diff? (s/N): " VIEW_DIFF
  done
fi

echo ""
read -r -p "Deseja executar a sincronização? (s/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
  echo "Operação cancelada."
  exit 0
fi

echo ""
echo "Executando sincronização..."

RSYNC_OUTPUT=$(rsync "${RSYNC_ARGS[@]}" "$AI_REPO/" "$TARGET_REPO/")

echo ""
echo "Sincronização concluída."

echo ""
echo "Arquivos INCLUÍDOS:"
echo "$RSYNC_OUTPUT" | awk '/^>f\+/{print $2}' || echo "Nenhum"

echo ""
echo "Arquivos MODIFICADOS:"
echo "$RSYNC_OUTPUT" | awk '/^>f[^+]/{print $2}' || echo "Nenhum"

echo ""
echo "Arquivos REMOVIDOS:"
echo "$RSYNC_OUTPUT" | awk '/^\*deleting/{print $2}' || echo "Nenhum"

echo ""
echo "Status do repositório oficial:"
cd "$TARGET_REPO"
git status --short