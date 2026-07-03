#!/usr/bin/env bash
# start.dev — atajo para levantar el entorno de desarrollo local.
#
# Uso: ./start.dev          — corre en el dispositivo/emulador conectado (mobile)
#      ./start.dev web      — levanta Flutter Web dentro de Docker (http://localhost:8080)

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

TARGET="${1:-mobile}"

if [[ "$TARGET" == "web" ]]; then
  if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado — es requerido para el target 'web'." >&2
    exit 1
  fi
  exec docker compose up --build
fi

if ! command -v flutter &> /dev/null; then
  echo "Flutter SDK no encontrado en PATH. Instalalo o usá './start.dev web' para correr vía Docker." >&2
  exit 1
fi

flutter pub get
exec flutter run
