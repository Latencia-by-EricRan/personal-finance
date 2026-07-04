# syntax=docker/dockerfile:1
ARG BUN_VERSION=1
ARG NODE_VERSION=22

# ---- deps: full dependency install (dev + prod), reused by dev and build stages ----
# Real Node.js is installed alongside bun: `oven/bun:*-alpine` only ships a
# bun-backed `node` shim as a PATH fallback (no real Node binary). The Angular
# CLI's build (`ng build`) spawns a child process to prerender/extract routes,
# and that child process needs an actual Node.js runtime — the bun shim fails
# with an opaque "error occurred while extracting routes" error. Installing
# `nodejs` here puts a real `node` binary earlier in PATH than bun's fallback.
FROM oven/bun:${BUN_VERSION}-alpine AS deps
WORKDIR /app
RUN apk add --no-cache nodejs
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# ---- dev: hot-reload target, expects source bind-mounted at runtime by compose.yaml ----
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 4200
CMD ["bun", "run", "start", "--", "--host", "0.0.0.0"]

# ---- build: compiles the Angular SSR app to dist/front ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN bun run build

# ---- prod-deps: production-only deps for the SSR runtime ----
# server.ts imports express + @angular/ssr/node (CommonEngine) as runtime deps;
# the esbuild server bundle does NOT inline them, so node_modules must be present.
FROM oven/bun:${BUN_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production --frozen-lockfile

# ---- prod: node SSR runtime ----
FROM node:${NODE_VERSION}-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist/front ./dist/front
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/front/server/server.mjs"]
