#!/usr/bin/env bash
# start-dev.sh — punto de entrada único para levantar/bajar el stack del monorepo
# (mongodb + back + web Angular, todo containerizado).
#
# Uso:
#   ./start-dev.sh up               — levanta el stack completo (mongo+back+web) en background
#   ./start-dev.sh down             — baja el stack completo
#   ./start-dev.sh build            — reconstruye las imágenes del stack (sin levantarlas)
#   ./start-dev.sh restart          — down + build + up, en ese orden
#   ./start-dev.sh logs             — sigue los logs del stack completo
#   ./start-dev.sh status           — muestra qué contenedores del stack están corriendo

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

COMMAND="${1:-}"

_require_docker() {
  if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado — es requerido para este comando." >&2
    exit 1
  fi
}

_require_env() {
  if [[ ! -f back/.env ]]; then
    echo "Falta back/.env — corré 'node back/scripts/onboarding.mjs --setup' primero." >&2
    exit 1
  fi
}

case "$COMMAND" in
  up)
    _require_docker
    _require_env
    exec docker compose up -d
    ;;

  down)
    _require_docker
    exec docker compose down
    ;;

  build)
    _require_docker
    exec docker compose build
    ;;

  restart)
    _require_docker
    _require_env
    docker compose down
    docker compose build
    exec docker compose up -d
    ;;

  logs)
    _require_docker
    exec docker compose logs -f
    ;;

  status)
    _require_docker
    exec docker compose ps
    ;;

  *)
    echo "Uso: $0 {up|down|build|restart|logs|status}" >&2
    exit 1
    ;;
esac
