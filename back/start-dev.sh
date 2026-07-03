#!/usr/bin/env bash
# start-dev.sh — atajo para levantar el entorno de desarrollo local.
#
# Delega todo el trabajo a scripts/onboarding.mjs, que ya cubre prereqs,
# npm install, generación de .env, docker compose + espera a que Mongo esté
# healthy, seed de datos y arranque del server — con tests propios en
# scripts/onboarding.test.mjs. Este archivo existe solo para que `./start-dev.sh`
# sea un atajo cómodo; no reimplementa nada de esa lógica.
#
# Uso: ./start-dev.sh          — bootstrap completo + arranca el server
#      ./start-dev.sh --setup  — solo deja el entorno listo, sin levantar servicios

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

exec node scripts/onboarding.mjs "$@"
