# Introducción al backend de finanzas personales

## Inicio rápido

Requisitos: Node.js `22.22.3` (ver `.nvmrc`), npm y Docker con Compose.

```bash
nvm use
npm run quickstart
```

El comando verifica el árbol instalado con `npm ls` y compara una huella SHA-256 guardada en `node_modules` con el `package-lock.json` actual; si falta, cambió o el árbol está incompleto, lo reemplaza de forma determinista mediante `npm ci`. Un árbol válido se reutiliza para que los siguientes arranques sean rápidos. Después crea un `.env` local si no existe, inicia MongoDB 8, espera su healthcheck, carga datos iniciales de forma idempotente y levanta la API en `http://localhost:3000`. El seed usa identificadores reservados estables para evitar duplicados concurrentes sin imponer unicidad global a los datos del usuario; si encuentra registros compatibles por su identidad natural, los actualiza y conserva sus identificadores. La contraseña local se muestra una sola vez y nunca se guarda en texto plano. Si ya existe `.env`, se conserva y valida.

Para preparar dependencias y configuración sin iniciar servicios:

```bash
npm run setup
```

Para detener MongoDB sin borrar sus datos:

```bash
npm run quickstart:down
```

La API expone `GET /health` sin autenticación: responde `200` cuando MongoDB está conectado y `503` cuando no lo está.

## Configuración manual

Copiá `.env.example` a `.env`, reemplazá todos los placeholders y ejecutá:

```bash
npm ci
docker compose up -d mongodb
npm run env:check
npm run seed
npm run dev
```

Definí `AUTH_ROOT_EMAIL` y `AUTH_ROOT_PASSWORD` (ambos en texto plano) en `.env` — la app hashea la contraseña internamente al arrancar — y un secreto JWT con `openssl rand -base64 48`.

## Solución de problemas

- **Docker no está disponible:** iniciá Docker Desktop (o el daemon de Docker) y verificá `docker compose version`.
- **MongoDB no responde en 60 segundos:** revisá `docker compose logs mongodb` y `docker compose ps`.
- **El puerto 27017 está ocupado:** detené el proceso o contenedor que lo usa; MongoDB solo se publica en `127.0.0.1:27017`.
- **El puerto 3000 está ocupado:** cambiá `PORT` en `.env` o detené el proceso existente.
- **El entorno es inválido:** compará `.env` con `.env.example` y ejecutá `npm run env:check`.
- **Necesitás reiniciar desde cero:** `docker compose down -v` elimina también los datos locales; usalo únicamente si aceptás perderlos.
