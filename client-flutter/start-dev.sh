#!/usr/bin/env bash
# start-dev.sh — atajo para levantar el entorno de desarrollo local.
#
# Uso: ./start-dev.sh          — corre en el dispositivo/emulador conectado (mobile)
#      ./start-dev.sh web      — levanta Flutter Web dentro de Docker (http://localhost:8080)
#      ./start-dev.sh android  — genera un APK debug dentro de Docker (./build/app/outputs/flutter-apk/)
#      ./start-dev.sh ios      — genera el build de iOS nativo (requiere Xcode local; NO
#                                soportado vía Docker, ya que el toolchain de Apple exige
#                                macOS y no corre en un contenedor Linux)

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

if [[ "$TARGET" == "android" ]]; then
  if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado — es requerido para el target 'android'." >&2
    exit 1
  fi
  docker compose run --rm android
  echo "APK generado en build/app/outputs/flutter-apk/app-debug.apk"
  exit 0
fi

if [[ "$TARGET" == "ios" ]]; then
  if [[ "$(uname)" != "Darwin" ]]; then
    echo "El build de iOS requiere macOS con Xcode — no puede correr en Docker ni en otro SO." >&2
    exit 1
  fi
  if ! command -v flutter &> /dev/null; then
    echo "Flutter SDK no encontrado en PATH." >&2
    exit 1
  fi
  flutter pub get
  exec flutter build ios --release --no-codesign
fi

if ! command -v flutter &> /dev/null; then
  echo "Flutter SDK no encontrado en PATH. Instalalo o usá './start-dev.sh web' para correr vía Docker." >&2
  exit 1
fi

flutter pub get
exec flutter run
