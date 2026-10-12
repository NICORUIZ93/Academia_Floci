#!/usr/bin/env bash
# Laboratorio: detener escrituras mientras se toma y compara la referencia.
# DATABASE_URL apunta al origen; PGHOST/PGPORT/PGUSER al servidor de restauración.
set -euo pipefail
: "${DATABASE_URL:?Define DATABASE_URL con la base de laboratorio que contiene envios y envio_eventos}"
backup_file="${1:-backup-envios.dump}"
if [[ -e "$backup_file" ]]; then
  echo "El archivo destino ya existe: elige otro nombre." >&2
  exit 1
fi
scratch_dir=$(mktemp -d)
restore_db="rutaflow_verify_$(date +%s)_$$_${RANDOM}"
restore_created=false
cleanup() {
  local status=$?
  if [[ "$restore_created" == true ]]; then
    if ! dropdb --if-exists "$restore_db"; then
      echo "No se pudo eliminar la base temporal $restore_db" >&2
      status=1
    fi
  fi
  rm -rf "$scratch_dir"
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for table in envios envio_eventos; do
  # Orden canónico y comparación de contenido, no solo de cantidad de filas.
  psql -X -v ON_ERROR_STOP=1 "$DATABASE_URL" -c \
    "COPY (SELECT row_to_json(t)::text FROM public.$table t ORDER BY row_to_json(t)::text COLLATE \"C\") TO STDOUT" \
    > "$scratch_dir/$table.source"
done
# Base completa: incluye secuencias y funciones de triggers referenciadas.
pg_dump --no-owner --no-privileges --format=custom --file="$backup_file" "$DATABASE_URL"
createdb --template=template0 "$restore_db"
restore_created=true
pg_restore --exit-on-error --no-owner --no-privileges --dbname="$restore_db" "$backup_file"
for table in envios envio_eventos; do
  psql -X -v ON_ERROR_STOP=1 "$restore_db" -c \
    "COPY (SELECT row_to_json(t)::text FROM public.$table t ORDER BY row_to_json(t)::text COLLATE \"C\") TO STDOUT" \
    > "$scratch_dir/$table.restored"
  if ! cmp -s "$scratch_dir/$table.source" "$scratch_dir/$table.restored"; then
    echo "FALLO: $table difiere. Revisa origen, escrituras concurrentes y restauración." >&2
    exit 1
  fi
done
printf 'OK: envios y envio_eventos restaurados y comparados; backup en %s\n' "$backup_file"
