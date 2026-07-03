# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.22.3

# ---- deps: full dependency install (dev + prod), reused by dev and build stages ----
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: hot-reload target, expects source bind-mounted at runtime by compose.yaml ----
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- build: compiles TypeScript to dist/ ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- prod-deps: production-only dependencies ----
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- prod: final runtime image ----
FROM node:${NODE_VERSION}-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY openapi.yaml ./
EXPOSE 3000
CMD ["npm", "start"]
