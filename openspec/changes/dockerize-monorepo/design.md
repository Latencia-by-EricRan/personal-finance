# Design: Dockerize the monorepo (back/, web/)

## Technical Approach

Three independent per-project Dockerfiles + one self-contained root orchestrator, matching the repo's "independently-versioned sub-projects" convention. Only `web/Dockerfile` and the root `docker-compose.yml` are new. The root compose is an ADDITIONAL fully-containerized option (built/prod images for demos and cross-service integration); `back/start-dev.sh`'s native+Mongo-only loop stays primary and untouched. Clean separation: `back/compose.yaml` = dev inner-loop (target `dev`, bind mount); root compose = built full stack (target `prod`).

The SSR-vs-browser API-URL split is solved with an Angular DI token whose value differs by which config bundle loaded it — no runtime platform branching in services.

## Architecture Decisions

### Decision: SSR-safe API base URL — DI token with server-config override

**Choice**: New `InjectionToken<string> API_BASE_URL` with a `providedIn: 'root'` factory defaulting to `environment.apiUrl` (`http://localhost:3000`). `app.config.server.ts` (the server-only merged config) overrides it with `process.env['API_URL_SERVER'] ?? 'http://localhost:3000'`. Services inject the token instead of importing `environment`.

**Alternatives considered**:
| Option | Tradeoff |
|--------|----------|
| `isPlatformServer(PLATFORM_ID)` factory in a single config | Bakes the `back:3000` string into the browser bundle; runs a platform check on every injection; still needs an env var for the native-SSR case, so no simpler. |
| Per-call-site host swap inside `MovementService`/component | Scatters the concern; misses the other 3 services (`account`, `category`, `auth`) that also call the API. |
| Hardcode `http://back:3000` server-side | Breaks native `bun run start` (no Docker), where SSR must reach `localhost:3000`. |

**Rationale**: Angular 19 SSR already ships two entry configs (`app.config.ts` + `app.config.server.ts` merged via `mergeApplicationConfig`, server providers last → they win server-side). The platform IS the config that loaded — no `isPlatformServer` needed. Reading `process.env['API_URL_SERVER']` (Node context in the server bundle) makes the server URL configurable: Docker sets `http://back:3000`; native SSR falls back to `localhost:3000`. This is the direct analog of `client-flutter`'s `hostOverride` (env-driven host, sensible default). The `providedIn: 'root'` factory default = `environment.apiUrl` means Karma specs (browser platform, use `${environment.apiUrl}/...`) stay green with ZERO test changes. Consequence: `summary-by-month.component.ts` needs NO edit (proposal listed it) — its eager SSR fetch flows through `MovementService`, which now resolves the token; this is a net simplification.

### Decision: web/Dockerfile — bun build stages + node SSR runtime WITH prod-deps

**Choice**: `oven/bun:1-alpine` for `deps`/`dev`/`build` and a `prod-deps` stage; `node:22-alpine` for the `prod` runtime running `node dist/front/server/server.mjs`. The `prod` stage copies `node_modules` from `prod-deps` alongside `dist/front` — mirroring `back/Dockerfile`'s `deps`→`dev`→`build`→`prod-deps`→`prod` split exactly.

**Rationale**: Mirrors `back/Dockerfile`'s five-stage split, adapted twice: (1) install/build use bun (project's package manager, `bun.lockb`); (2) runtime uses `node:22-alpine` (matches back's Node major; `server.mjs` is a plain Node/Express app) rather than a bun-only image, which lacks the `node` binary and would break the `node …` command.

**Why `prod-deps` is REQUIRED (not optional)**: `server.ts` imports `express` and `CommonEngine` from `@angular/ssr/node` directly. Angular's esbuild-based server bundle does NOT reliably inline these CommonJS runtime dependencies into `dist/front/server/server.mjs` — they stay as bare `require`/`import` specifiers resolved against `node_modules` at runtime. Running the server without `node_modules` present would fail with `ERR_MODULE_NOT_FOUND` on first request. `back/Dockerfile` — the explicit style precedent for this whole design — already carries a `prod-deps` stage for exactly this reason. Therefore the `prod` stage installs production-only deps in `prod-deps` (`bun install --production --frozen-lockfile`) and copies the resulting `node_modules` into the runtime image. `PORT=4000` inside the container (server.ts default), published as `4200:4000`.

### Decision: Root compose is self-contained (no Compose `include:`)

**Choice**: Define `mongodb`, `back`, `web` directly in root `docker-compose.yml`. Do NOT use `include: back/compose.yaml`.

**Rationale**: A self-contained file has zero version dependency, avoids coupling to back's internal dev-oriented `api` service (bind mount + `target: dev`), and lets the root stack use `target: prod`. Compose `include:` support (v2.20+) is now **confirmed available** (`docker compose version` → v5.3.0, well past the threshold — see Open Questions), but the self-contained file remains the deliberate choice for the isolation reasons above; `include: back/compose.yaml` stays an optional future optimization, not a blocker.

**Scope note — `client-flutter`**: Deliberately NOT included as a service in the root compose. `client-flutter` is a separate mobile client with its own build/run story and is not part of the "browser + SSR reach the same backend" problem this change targets; the root stack orchestrates the web trio (mongo + back + web) only. Its env-driven `hostOverride` remains the reference precedent for the `API_BASE_URL` DI-token approach, but it is intentionally out of scope for orchestration here.

### Decision: which failure path the DI-token fix actually covers (SSR request vs. build-time prerender)

The proposal frames this as fixing an `ECONNREFUSED` from server-side rendering of an authenticated route (`SummaryByMonthComponent`'s eager API fetch). There are TWO distinct server-side code paths, and they behave differently. This section makes the mechanism explicit so the fix's coverage is not left to inference.

**Path A — live per-request SSR** (a real request to the running `node server.mjs`): This is the path the DI-token fix targets. `API_BASE_URL` is resolved per injection from `process.env['API_URL_SERVER']` (set to `http://back:3000` by the root compose, falling back to `localhost:3000` for native SSR). Any component that renders server-side and calls the API resolves the correct host with no baked-in string.

However, for the *specific* `SummaryByMonthComponent` route: it sits behind `authGuard`, which calls `TokenStorageService.getToken()`. That method returns `null` unconditionally when not in a browser context, so during a live SSR render the guard redirects to `/login` **before** the component (and its eager fetch) ever constructs. Consequently that component's eager API call does NOT fire during live SSR — the token fix is not strictly *required* to silence an `ECONNREFUSED` from this particular route. It remains the correct and necessary general mechanism for any server-rendered API call (e.g. the `/login` page itself or any future unguarded server-side data fetch) and prevents baking `localhost:3000` into the server bundle. Net: the fix is correct and covers Path A generally; the originally-cited route is a weaker example than the proposal implied because the guard short-circuits it server-side.

**Path B — build-time prerender** (`"prerender": true` in `angular.json`, no per-route `renderMode` override): During `bun run build` inside the `build` stage, Angular performs full router navigation — INCLUDING guards — to prerender routes. In that stage there is no running `back` container and `API_URL_SERVER` is unset. For guarded routes the same `getToken()`→`null` logic redirects to `/login` at build time, so the guarded component still does not fetch. BUT the DI-token fix is per-request/env-based and does **NOT** cover build-time prerender: if any *unguarded* route with an eager server-side data fetch is prerendered, `bun run build` would attempt a real API call against a non-running backend and the build would fail — regardless of the token fix.

**Known limitation / out of scope**: This design does not add build-time API access or seed data for prerendering. No unguarded eager-fetch route is in scope today, so `bun run build` succeeds in the `build` stage as-is. If such a route is later added, it MUST opt out of prerender (`RenderMode.Server` via a `provideServerRoutingConfig`/`app.routes.server.ts` override) or be given build-time backend access — that mitigation is explicitly OUT OF SCOPE for this change and recorded as a known limitation. The DI-token fix is scoped to Path A (live SSR); build-time prerender of authenticated content is unaffected because guards redirect it to `/login`.

## Data Flow

    Browser (origin http://localhost:4200)
       │  JS fetch → http://localhost:3000  (published host port)
       ▼
    host:3000 → back container (CORS allows localhost:4200)

    web container (SSR / Node)
       │  API_BASE_URL = http://back:3000  (Docker DNS, service name)
       ▼
    back:3000 (compose network)

    back ──MONGO_CONN_STR=mongodb://mongodb:27017──▶ mongodb

Browser and SSR hit the SAME backend data over different network paths, so hydration stays consistent.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `web/src/app/core/tokens/api-base-url.token.ts` | Create | `API_BASE_URL` token, root factory default `environment.apiUrl` |
| `web/Dockerfile` | Create | Multi-stage: bun deps/dev/build + bun prod-deps + node SSR prod (copies node_modules) |
| `web/.dockerignore` | Create | Exclude node_modules, dist, .angular, .git, caches |
| `docker-compose.yml` (root) | Create | Orchestrates mongodb + back + web on one network |
| `web/src/app/app.config.server.ts` | Modify | Override `API_BASE_URL` with `process.env['API_URL_SERVER']` |
| `web/.../records/core/services/movement.service.ts` | Modify | `environment.apiUrl` → `inject(API_BASE_URL)` |
| `web/src/app/core/reference/account/account.service.ts` | Modify | same |
| `web/src/app/core/reference/category/category.service.ts` | Modify | same |
| `web/src/app/core/auth/services/auth.service.ts` | Modify | same |
| `back/scripts/onboarding.mjs` | Modify | Line 82 `5173` → `4200` |

`summary-by-month.component.ts`: NOT modified (token approach makes the proposal's listed edit unnecessary).

## Interfaces / Contracts

```ts
// web/src/app/core/tokens/api-base-url.token.ts
import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl, // browser + Karma default
});
```

```ts
// app.config.server.ts (server bundle only — process.env available here)
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: API_BASE_URL, useValue: process.env['API_URL_SERVER'] ?? 'http://localhost:3000' },
  ],
};
```

```ts
// service field initializer (runs in injection context)
private readonly baseUrl = inject(API_BASE_URL);
private readonly accountUrl = `${this.baseUrl}/account`;
```

```dockerfile
# web/Dockerfile
# syntax=docker/dockerfile:1
ARG BUN_VERSION=1
ARG NODE_VERSION=22
FROM oven/bun:${BUN_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
FROM deps AS dev
COPY . .
EXPOSE 4200
CMD ["bun", "run", "start", "--", "--host", "0.0.0.0"]
FROM deps AS build
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
```

```
# web/.dockerignore
node_modules
dist
.angular
.git
.gitignore
*.log
coverage
.DS_Store
.vscode
.editorconfig
```

```yaml
# docker-compose.yml (root) — service skeleton
services:
  mongodb:
    image: mongo:8
    restart: unless-stopped
    volumes: [personal-finance-mongodb:/data/db]
    healthcheck:
      test: ['CMD','mongosh','--quiet','--eval','db.adminCommand({ ping: 1 }).ok']
      interval: 5s
      timeout: 5s
      retries: 12
      start_period: 5s
  back:
    build: { context: ./back, target: prod }
    restart: unless-stopped
    depends_on: { mongodb: { condition: service_healthy } }
    env_file: [./back/.env]
    environment:
      MONGO_CONN_STR: mongodb://mongodb:27017
      CORS_ORIGINS: http://localhost:4200   # overrides stale .env value
    ports: ['3000:3000']
    healthcheck:
      # Lightweight TCP check: passes once Express is accepting connections on :3000.
      # `node` is present in the back prod image; avoids depending on curl/wget or a
      # specific HTTP route/status. If back later exposes a real health route,
      # swap for an HTTP check (e.g. wget --spider http://localhost:3000/health).
      test: ['CMD','node','-e','require(\"net\").connect(3000,\"127.0.0.1\").on(\"connect\",()=>process.exit(0)).on(\"error\",()=>process.exit(1))']
      interval: 5s
      timeout: 5s
      retries: 12
      start_period: 10s
  web:
    build: { context: ./web, target: prod }
    restart: unless-stopped
    depends_on: { back: { condition: service_healthy } }
    environment:
      API_URL_SERVER: http://back:3000
      PORT: 4000
    ports: ['4200:4000']
volumes:
  personal-finance-mongodb:
```

`onboarding.mjs` fix (line 82): only one `5173` occurrence, only one `CORS_ORIGINS` line; no collision. Root compose ALSO sets `CORS_ORIGINS` on `back`, so a stale pre-existing `.env` (which `createEnvironment` preserves) can't break the containerized stack.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `API_BASE_URL` default resolves to `environment.apiUrl`; existing service specs stay green | TDD: existing Karma specs unchanged (token factory = `environment.apiUrl`); add one token-default spec |
| Integration | `docker compose up` starts mongo+back+web; SSR HTML renders without `ECONNREFUSED`; browser calls reach back; native `bun run start` still uses localhost | Manual `docker compose up` + curl SSR page + native run check |

## Migration / Rollout

No data migration. Additive: delete the new files and revert 5 `web` edits + the `onboarding.mjs` line to fully roll back; `back/` and `client-flutter/` standalone flows untouched.

## Open Questions

- [x] **RESOLVED** — Compose `include:` v2.20+ availability: confirmed available (`docker compose version` → v5.3.0, well past the v2.20+ threshold). Design still uses a self-contained root file by choice (isolation from back's dev `api` service); `include:` is an optional future optimization, no longer a blocker.
- [x] **RESOLVED** — SSR runtime dependencies: `server.mjs` DOES need `node_modules` at runtime (`express` + `@angular/ssr/node` are not inlined by the esbuild server bundle). `web/Dockerfile` now carries a `prod-deps` stage (`bun install --production --frozen-lockfile`) and the `prod` stage copies `node_modules`, mirroring `back/Dockerfile`.
- [ ] Root `back` service uses `target: prod` and needs `./back/.env` to exist (run `node scripts/onboarding.mjs --setup` first). Confirm acceptable vs. `target: dev`.
- [ ] Containerized stack has an empty DB (no seed step in root compose) — acceptable for a first slice? Seeding is out of scope here.
- [ ] Back healthcheck uses a TCP-connect probe (Express accepting on :3000). If a dedicated health route is added later, switch to an HTTP `--spider` check for a stronger readiness signal.
