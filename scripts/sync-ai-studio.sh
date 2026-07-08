#!/usr/bin/env bash
set -euo pipefail

AI_REPO="/home/murilo/Documentos/projetos/petvex/adm-petvex-aistudio"
TARGET_REPO="/home/murilo/Documentos/projetos/petvex/adm-petvex"

RSYNC_FILTERS=(
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

RSYNC_ARGS=(
  -avim
  --delete
  --checksum
  "${RSYNC_FILTERS[@]}"
)

echo "Atualizando repositório AI Studio..."
cd "$AI_REPO"
git pull origin main

echo ""
echo "Gerando lista de diferenças..."

PREVIEW=$(rsync "${RSYNC_ARGS[@]}" --dry-run "$AI_REPO/" "$TARGET_REPO/")

mapfile -t CREATED_LIST < <(echo "$PREVIEW" | awk '/^>f\+/{print $2}')
mapfile -t UPDATED_LIST < <(echo "$PREVIEW" | awk '/^>f[^+]/{print $2}')
mapfile -t DELETED_LIST < <(echo "$PREVIEW" | awk '/^\*deleting/{print $2}')

print_list() {
  local title="$1"
  shift
  local files=("$@")

  echo ""
  echo "=========================================="
  echo "$title"
  echo "=========================================="

  if [ "${#files[@]}" -eq 0 ]; then
    echo "Nenhum"
    return
  fi

  for i in "${!files[@]}"; do
    printf "%d - %s\n" "$((i + 1))" "${files[$i]}"
  done
}

print_list "Arquivos que serão INCLUÍDOS" "${CREATED_LIST[@]}"
print_list "Arquivos que serão MODIFICADOS" "${UPDATED_LIST[@]}"
print_list "Arquivos que serão REMOVIDOS" "${DELETED_LIST[@]}"

echo ""
echo "=========================================="
echo "Resumo"
echo "=========================================="
echo "Incluídos  : ${#CREATED_LIST[@]}"
echo "Modificados: ${#UPDATED_LIST[@]}"
echo "Removidos  : ${#DELETED_LIST[@]}"

ALL_FILES=(
  "${CREATED_LIST[@]}"
  "${UPDATED_LIST[@]}"
  "${DELETED_LIST[@]}"
)

if [ "${#ALL_FILES[@]}" -eq 0 ]; then
  echo ""
  echo "Nenhuma alteração encontrada."
  exit 0
fi

echo ""
read -r -p "Deseja visualizar diferenças dos arquivos modificados? (s/N): " VIEW_DIFF

while [[ "$VIEW_DIFF" =~ ^[sS]$ && "${#UPDATED_LIST[@]}" -gt 0 ]]; do
  print_list "Arquivos modificados" "${UPDATED_LIST[@]}"

  echo ""
  read -r -p "Digite o número do arquivo: " FILE_NUMBER

  if ! [[ "$FILE_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "Número inválido."
  elif [ "$FILE_NUMBER" -lt 1 ] || [ "$FILE_NUMBER" -gt "${#UPDATED_LIST[@]}" ]; then
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

SELECTED_FILES=()

add_files() {
  local -n source_list=$1

  if [ "${#source_list[@]}" -eq 0 ]; then
    echo "Nenhum arquivo disponível nessa categoria."
    return
  fi

  echo ""
  echo "Digite os números separados por espaço."
  echo "Exemplo: 1 3 5"
  echo "Digite T para selecionar todos dessa categoria."
  echo ""

  read -r -p "Selecionar: " SELECTION

  if [[ "$SELECTION" =~ ^[tT]$ ]]; then
    SELECTED_FILES+=("${source_list[@]}")
    return
  fi

  for number in $SELECTION; do
    if ! [[ "$number" =~ ^[0-9]+$ ]]; then
      echo "Ignorando valor inválido: $number"
      continue
    fi

    if [ "$number" -lt 1 ] || [ "$number" -gt "${#source_list[@]}" ]; then
      echo "Ignorando número fora da lista: $number"
      continue
    fi

    SELECTED_FILES+=("${source_list[$((number - 1))]}")
  done
}

echo ""
read -r -p "Deseja sincronizar tudo? (s/N): " SYNC_ALL

if [[ "$SYNC_ALL" =~ ^[sS]$ ]]; then
  SELECTED_FILES=("${ALL_FILES[@]}")
else
  echo ""
  read -r -p "Deseja sincronizar arquivos novos/criados? (s/N): " SYNC_CREATED
  if [[ "$SYNC_CREATED" =~ ^[sS]$ ]]; then
    print_list "Arquivos novos/criados" "${CREATED_LIST[@]}"
    add_files CREATED_LIST
  fi

  echo ""
  read -r -p "Deseja sincronizar arquivos modificados? (s/N): " SYNC_UPDATED
  if [[ "$SYNC_UPDATED" =~ ^[sS]$ ]]; then
    print_list "Arquivos modificados" "${UPDATED_LIST[@]}"
    add_files UPDATED_LIST
  fi

  echo ""
  read -r -p "Deseja aplicar remoções? (s/N): " SYNC_DELETED
  if [[ "$SYNC_DELETED" =~ ^[sS]$ ]]; then
    print_list "Arquivos removidos" "${DELETED_LIST[@]}"
    add_files DELETED_LIST
  fi
fi

if [ "${#SELECTED_FILES[@]}" -eq 0 ]; then
  echo ""
  echo "Nenhum arquivo selecionado. Operação cancelada."
  exit 0
fi

mapfile -t SELECTED_FILES < <(printf "%s\n" "${SELECTED_FILES[@]}" | sort -u)

echo ""
echo "=========================================="
echo "Arquivos selecionados para sincronização"
echo "=========================================="
for file in "${SELECTED_FILES[@]}"; do
  echo "$file"
done

echo ""
read -r -p "Confirmar sincronização dos arquivos acima? (s/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
  echo "Operação cancelada."
  exit 0
fi

echo ""
echo "Executando sincronização seletiva..."

for file in "${SELECTED_FILES[@]}"; do
  SOURCE_FILE="$AI_REPO/$file"
  TARGET_FILE="$TARGET_REPO/$file"

  if [ -f "$SOURCE_FILE" ]; then
    mkdir -p "$(dirname "$TARGET_FILE")"
    rsync -av --checksum "$SOURCE_FILE" "$TARGET_FILE"
    echo "Sincronizado: $file"
  else
    if [ -e "$TARGET_FILE" ]; then
      rm -f "$TARGET_FILE"
      echo "Removido: $file"
    else
      echo "Ignorado, arquivo não existe no destino: $file"
    fi
  fi
done

echo ""
echo "Sincronização concluída."

echo ""
echo "Status do repositório oficial:"
cd "$TARGET_REPO"
git status --short