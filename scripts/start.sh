#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PORT="${1:-8081}"

cd "$ROOT/web"
printf 'Abre http://localhost:%s\n' "$PORT"
python3 -m http.server "$PORT"
