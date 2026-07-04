# Apply Progress: dockerize-monorepo

**Mode**: Strict TDD
**Delivery strategy**: auto-chain (per session decision) — one autonomous slice per apply batch
**Chain strategy**: stacked-to-qa (reconciled per tasks.md branch-model note)
**Branch (Task 1)**: `fix/back/onboarding-cors-port` (off `qa`)
**Branch (Task 2)**: `feature/web/api-base-url-token` (off `qa`)
**Branch (Task 3)**: `feature/web/dockerfile` (off `qa`)
**Branch (Task 4)**: `feature/repo/docker-compose-root` (off `qa`, branched from Task 3's branch; current branch)

## Completed Tasks

- [x] Task 1 — Fix CORS origin port in onboarding.mjs
- [x] Task 2 — DI token + environment-aware API base URL wiring (Angular-side only, no Docker)
- [x] Task 3 — web/Dockerfile + web/.dockerignore
- [x] Task 4 — Root docker-compose.yml (full-stack orchestration)

**All 4 tasks complete.**

## Files Changed

### Task 1

| File | Action | What Was Done |
|------|--------|---------------|
| `back/scripts/onboarding.mjs` | Modified | Line 82: `CORS_ORIGINS=http://localhost:5173` → `CORS_ORIGINS=http://localhost:4200` |
| `back/scripts/onboarding.test.mjs` | Modified | Added assertion `expect(contents).toContain('CORS_ORIGINS=http://localhost:4200')` to the existing `'creates a private file containing only hashed credentials'` test |
| `openspec/changes/dockerize-monorepo/tasks.md` | Modified | Checked off Task 1 |

### Task 2

| File | Action | What Was Done |
|------|--------|---------------|
| `web/src/app/core/tokens/api-base-url.token.ts` | Created | `API_BASE_URL` `InjectionToken<string>`, `providedIn: 'root'` factory defaulting to `environment.apiUrl` |
| `web/src/app/core/tokens/api-base-url.token.spec.ts` | Created | One spec (with `provideExperimentalZonelessChangeDetection()` in the testing module, matching project convention) asserting the default injected value equals `environment.apiUrl` |
| `web/src/app/app.config.server.ts` | Modified | Added `{ provide: API_BASE_URL, useValue: process.env['API_URL_SERVER'] ?? 'http://localhost:3000' }` to the server-only provider list |
| `web/src/app/components/main-container/pages/records/core/services/movement.service.ts` | Modified | `private readonly mainUrl = environment.apiUrl` → `inject(API_BASE_URL)`; dropped the `environment` import |
| `web/src/app/core/reference/account/account.service.ts` | Modified | `environment.apiUrl` → `inject(API_BASE_URL)` inline in the `accountUrl` template literal; dropped the `environment` import |
| `web/src/app/core/reference/category/category.service.ts` | Modified | Same pattern as `account.service.ts` |
| `web/src/app/core/auth/services/auth.service.ts` | Modified | Added `private readonly baseUrl = inject(API_BASE_URL)` field; `login()` now uses `` `${this.baseUrl}/auth/login` `` instead of `` `${environment.apiUrl}/auth/login` ``; dropped the `environment` import |
| `openspec/changes/dockerize-monorepo/tasks.md` | Modified | Checked off Task 2 |

`summary-by-month.component.ts` — confirmed NOT touched, per design's finding (its eager fetch flows through `MovementService`, which now resolves the token — no separate edit needed).

### Task 3

| File | Action | What Was Done |
|------|--------|---------------|
| `web/Dockerfile` | Created | 5-stage build (`deps`/`dev`/`build`/`prod-deps`/`prod`) per design.md's snippet: `oven/bun:1-alpine` for `deps`/`dev`/`build`/`prod-deps`, `node:22-alpine` for `prod` runtime running `node dist/front/server/server.mjs`; `prod-deps` runs `bun install --production --frozen-lockfile` and its `node_modules` is copied into `prod` alongside `dist/front` |
| `web/.dockerignore` | Created | Excludes `node_modules`, `dist`, `.angular`, `.git`, `.gitignore`, `*.log`, `coverage`, `.DS_Store`, `.vscode`, `.editorconfig` — exact list per design.md |
| `openspec/changes/dockerize-monorepo/tasks.md` | Modified | Checked off Task 3 |

### Task 4

| File | Action | What Was Done |
|------|--------|---------------|
| `docker-compose.yml` (repo root) | Created | `mongodb` (`mongo:8`, named volume, `mongosh` ping healthcheck), `back` (build `./back` target `prod`, `env_file: ./back/.env`, overrides `MONGO_CONN_STR=mongodb://mongodb:27017` and `CORS_ORIGINS=http://localhost:4200`, TCP-connect healthcheck via `node -e`, `depends_on: mongodb: condition: service_healthy`, published `3000:3000`), `web` (build `./web` target `prod`, `API_URL_SERVER=http://back:3000`, `PORT=4000`, `depends_on: back: condition: service_healthy`, published `4200:4000`) — exact skeleton per design.md's Interfaces/Contracts snippet, self-contained (no `include:`) |
| `openspec/changes/dockerize-monorepo/tasks.md` | Modified | Checked off Task 4 — all 4 boxes now checked |

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 | `back/scripts/onboarding.test.mjs` | Unit | ✅ 10/10 (baseline before edit) | ✅ Written — new assertion failed against pre-fix source (`Expected 'CORS_ORIGINS=http://localhost:4200'` vs received `...5173`) | ✅ Passed — 10/10 after one-line fix | ➖ Skipped: purely structural single-value config string, no branching/logic to generalize (exempt per strict-tdd.md) | ➖ None needed — one-line literal change, nothing to extract or clean |
| 2 | `web/src/app/core/tokens/api-base-url.token.spec.ts` | Unit | ✅ 101/101 Karma baseline before edit (8 pre-existing failures unrelated to scope, confirmed via git-stash A/B — see Deviations) | ✅ Written first — failed with `Module not found: Can't resolve './api-base-url.token'` (file didn't exist yet) | ✅ Passed after creating `api-base-url.token.ts` — confirmed again green after wiring `app.config.server.ts` + all 4 services | ➖ Skipped: single default-value assertion, no branching logic to generalize (exempt per strict-tdd.md, same rationale as Task 1) | ➖ None needed — token file is a minimal `InjectionToken` declaration, nothing to extract |
| 3 | N/A — infra-only, no unit test framework applies | Build/Runtime | N/A | ➖ Exempt: `Dockerfile`/`.dockerignore` are declarative infra artifacts, not TS/JS logic; there is no unit-test harness for Dockerfile content (per prompt's explicit scope note) | ✅ Verified via actual `docker build`/`docker run` execution treated as the acceptance test (see Task 3 Verification below) — this IS the RED→GREEN equivalent: first `docker build --target prod` attempt FAILED (RED, see Deviations), fix applied, re-run PASSED (GREEN) | ➖ N/A | ➖ N/A — no refactor step for a 2-file infra change |
| 4 | N/A — infra-only, no unit test framework applies | Integration | N/A | ➖ Exempt: compose YAML is declarative infra, not TS/JS logic; no unit-test harness applies | ✅ Verified via real `docker compose up -d` execution treated as the acceptance test — actual multi-container stack brought up, healthcheck-gated startup ordering confirmed via `docker inspect` timestamps, real `curl`/in-container `fetch` reaching `back` over Docker DNS, `docker compose down` + re-`up` idempotency proven (see Task 4 Verification below) | ➖ N/A | ➖ N/A — no refactor step for a 1-file infra change |

### Test Summary
- **Total tests written**: 2 (1 new assertion in Task 1, 1 new spec file in Task 2)
- **Total tests passing (back)**: 203/203 (`npm test`, full suite, unaffected by Task 2)
- **Total tests passing (web)**: 94/102 Karma (8 pre-existing failures, confirmed pre-existing via git-stash A/B comparison — same 8 failing spec names and same failure mode before AND after Task 2's edits: `AppComponent` ×3, `MainContainerComponent`, `ExpensesComponent`, `NavbarComponent`, `AddExpenseComponent`, `RecordsComponent` — all fail with `NG0908: In this configuration Angular requires Zone.js` because those specs don't call `provideExperimentalZonelessChangeDetection()` in their own `TestBed.configureTestingModule`. None of the 8 are among the 5 files Task 2 touched.)
- **Layers used**: Unit (2 across both tasks)
- **Approval tests** (refactoring): None — no refactoring tasks
- **Pure functions created**: 1 (`API_BASE_URL` token factory — trivial default-value resolver)

## Verification against tasks.md "Done when" criteria

### Task 1
- `cd back && npm test` (vitest run) passes, including the new assertion — ✅ 22 files / 203 tests passed
- `rg "5173" back/scripts/onboarding.mjs` returns no matches — ✅ confirmed
- `rg "CORS_ORIGINS=http://localhost:4200" back/scripts/onboarding.mjs` matches — ✅ confirmed

### Task 2
- `cd web && bun run test` (full Karma/Jasmine suite) passes with zero pre-existing spec files modified — ✅ confirmed: `movement.service.spec.ts`, `account.service.spec.ts`, `category.service.spec.ts`, `auth.service.spec.ts` (the 4 pre-existing specs covering the touched services) all pass unmodified and untouched. The 8 failing specs are pre-existing, unrelated to any file Task 2 touched, and reproduce identically on the pre-Task-2 baseline (verified via `git stash` A/B run: 101 specs / 8 failed / 93 passed baseline vs 102 specs / 8 failed / 94 passed with Task 2 — the +1 total and +1 pass is exactly the new token spec).
- The new `api-base-url.token.spec.ts` passes — ✅ confirmed (RED before token existed, GREEN after)
- `rg "environment.apiUrl" web/src/app` no longer matches inside the four modified services — ✅ confirmed (checked directly against all 4 files, zero matches)

### Task 3
- `docker build --target dev -t pf-web:dev ./web` completes without error — ✅ confirmed (built cleanly, `bun install --frozen-lockfile` succeeded, image `pf-web:dev` ~434MB)
- `docker build --target prod -t pf-web:prod ./web` completes without error — ✅ confirmed AFTER a fix (see Deviations) — `ng build` completed, `Prerendered 8 static routes`, image `pf-web:prod` ~232MB
- `docker run --rm -p 4200:4000 pf-web:prod` starts the SSR server and serves a response on `:4000` without `ERR_MODULE_NOT_FOUND` — ✅ confirmed: `docker run --rm -d --name pf-web-smoke -p 4200:4000 pf-web:prod` → log `Node Express server listening on http://localhost:4000`; `curl -sf http://localhost:4200` → `HTTP 200` with rendered HTML body (`<!DOCTYPE html>...<title>Front</title>...`); no module-not-found or connection-refused error. Container stopped and removed after the check (`docker stop pf-web-smoke`).
- Build context sent to the daemon does not include `node_modules`/`dist`/`.angular` — ✅ confirmed: local `web/` dir has `node_modules` 351M, `dist` 3.6M, `.angular` 4.5G, but `docker build --progress=plain --target deps ./web` reports `transferring context: 130B` / `64B` — proves `.dockerignore` is excluding all three.

### Task 4

- `docker compose config` validates the file without error — ✅ confirmed, resolved config printed cleanly (one unrelated pre-existing warning, see Deviations/Risks below).
- `docker compose up -d` at repo root brings up `mongodb`, `back`, `web`; `docker compose ps` shows `back` reaching `healthy` only after `mongodb` is `healthy` — ✅ confirmed via `docker inspect --format '{{.State.StartedAt}}'` + health log timestamps: `mongodb` created 02:48:24Z, first successful healthcheck (→ healthy) at 02:48:30.1Z; `back` container started 02:48:30.224Z (immediately after, not before); `back`'s first successful healthcheck (→ healthy) at 02:48:35.386Z; `web` container started 02:48:35.840Z (immediately after). Final `docker compose ps`: all three `Up ... (healthy)` (web has no healthcheck defined, by design — nothing depends on it).
- `curl -sf http://localhost:3000` reaches `back` from the host — the literal command exits `22` because `back`'s root route requires auth (`authenticate` middleware mounted before all routes except `/auth` and `/docs` per `back/src/_routes.ts`) and returns HTTP 401, which `curl -f` treats as an error. This is NOT a connection failure: `curl -sS -o- -w 'HTTP_STATUS:%{http_code}'` against `/` returns `HTTP_STATUS:401` with body `{"message":"Unauthorized"}`, and against the public `/docs` route returns `HTTP_STATUS:301` (redirect to `/docs/`). Both are real HTTP responses from the `back` container, proving the port is genuinely reachable from the host — ✅ confirmed (per tasks.md's own allowance: "any non-connection-refused response proves the point").
- `curl -sf http://localhost:4200` returns rendered SSR HTML with no connection-refused error — ✅ confirmed: exit code `0`, HTTP 200, 31997-byte HTML body, `<title>Front</title>` present. Additionally and more directly: since the app's only route (`/`) is guarded by `authGuard` (`canActivateChild` in `app.routes.ts`) and per design.md's own documented "Known limitation" there is currently no unguarded eager-fetch route in this codebase, the homepage itself doesn't trigger a live SSR→back fetch. To directly prove the actual mechanism under test (env var resolving to a real Docker-network connection), ran `docker compose exec web node -e "fetch(process.env.API_URL_SERVER)..."` from inside the running `web` container — using the exact same `API_URL_SERVER` env var and `fetch` call the SSR code path would use — and got `STATUS 401` / `{"message":"Unauthorized"}` back, i.e. a real response from `back` over Docker service-name DNS, not `ECONNREFUSED`/timeout. This is the direct, unambiguous proof that `API_URL_SERVER=http://back:3000` resolves correctly server-side inside the `web` container.
- `docker compose down` tears down cleanly; re-`up` is idempotent — ✅ confirmed: first `down` removed all 3 containers + network cleanly; second `up -d` recreated the network + all 3 containers and reached the same healthy gating (mongodb→back→web) with no errors; final `down` performed for a clean end state.
- `back/start-dev.sh` native workflow unaffected — ✅ confirmed: `back/compose.yaml` still exists at `back/compose.yaml`, `git status --short compose.yaml` / `git diff --stat compose.yaml` inside `back/` both report zero changes (untouched by this task); `back`'s own native-workflow Mongo container (`back-mongodb-1`, up 10h, healthy, publishing `127.0.0.1:27017:27017`) kept running throughout this task's `docker compose up`/`down` cycles on the root stack's separate Compose project (`personalfinance`) without any port/name/network collision — proving the two workflows coexist independently exactly as designed.

## Deviations from Design

Task 1 and Task 2: None — implementation matches design.md and tasks.md exactly for both tasks.

**Task 3 — one required correction to design.md's Dockerfile snippet, found via actual `docker build` execution (not assumed):**

`docker build --target prod ./web` initially FAILED at the `RUN bun run build` step with `✘ [ERROR] An error occurred while extracting routes. / undefined` and `Prerendered 0 static routes` — even though the identical `bun run build` command succeeded locally outside Docker (`Prerendered 8 static routes`). Root cause, confirmed by inspecting the image: `oven/bun:1-alpine` does NOT ship a real Node.js binary — it only provides a bun-backed `node` shim as a PATH fallback (`/usr/local/bun-node-fallback-bin/node -> /usr/local/bin/bun`, last in `$PATH`). The Angular CLI's build spawns a child process to prerender/extract routes, and that child process needs a genuine Node.js runtime; bun's node-compat shim fails silently there with an opaque `undefined` error. This is a real gap in design.md's Dockerfile snippet, not a scope deviation — the design's snippet as written does not build. **Fix applied**: added `RUN apk add --no-cache nodejs` to the `deps` stage (before `bun install`), which installs a real `node` binary at `/usr/bin/node`, earlier in `$PATH` than bun's fallback shim, so `dev` and `build` (both built `FROM deps`) now get a working Node runtime for any child-process spawning the Angular builder needs. `prod-deps` (production-only bun install, no build step) and `prod` (already `node:22-alpine`, real Node) were unaffected/unchanged. Re-ran both `docker build --target dev` and `docker build --target prod` after the fix — both now succeed, and the prod image was smoke-tested successfully (see Task 3 verification above). This is flagged the same way the earlier design review flagged the missing `prod-deps` stage: a design snippet that looked complete on paper needed one more real-world-execution-verified line to actually build.

One environment-only note for Task 2 (not a design deviation): the sandbox had no system Chrome installed at the default Karma path (`/Applications/Google Chrome.app`). Ran tests with `CHROME_BIN` pointed at a Playwright-cached "Chrome for Testing" binary already present on disk (`~/Library/Caches/ms-playwright/chromium-1228/.../Google Chrome for Testing.app/...`). This is a local test-runner invocation detail, not a code or config change — no repo files were touched to make tests runnable.

Task 4: None — implementation matches design.md's final (post-correction) compose skeleton exactly: `mongodb`/`back`/`web` as three top-level services, self-contained (no `include:`), both dependency chains gated on `condition: service_healthy` (`mongodb`→`back` and `back`→`web`), `back` env overrides, `web`'s `API_URL_SERVER`/`PORT`/port mapping all verbatim per design's Interfaces/Contracts snippet.

## Issues Found

Pre-existing, out-of-scope for Task 2: 8 Karma specs (`AppComponent` ×3, `MainContainerComponent`, `ExpensesComponent`, `NavbarComponent`, `AddExpenseComponent`, `RecordsComponent`) fail with `NG0908: Angular requires Zone.js` because their own `TestBed.configureTestingModule` blocks omit `provideExperimentalZonelessChangeDetection()` (unlike the 4 service specs and the new token spec, which do include it). Confirmed pre-existing via git-stash A/B comparison — not introduced or worsened by Task 2. Not touched, per scope instructions (Task 2 must not touch anything beyond its assigned files). Flagging for a future task/PR outside this change's scope.

Task 3: none beyond the Dockerfile fix documented above under Deviations (that issue was found AND fixed within this batch, not left open).

**Task 4 — pre-existing issue found, NOT introduced by this task, NOT fixed (out of scope):** `docker compose config`/`up` prints `The "FnQO5p6vYNTNmANSLd153" variable is not set. Defaulting to a blank string.` This is Docker Compose's `env_file` interpolation treating the literal `$` characters inside the bcrypt hash stored in `back/.env`'s `AUTH_PASSWORD_HASH` (format `$2b$10$<salt><hash>`) as `${VAR}`-style variable references, silently blanking the segment after the un-escaped `$`. **Confirmed this is pre-existing and identical in scope**: ran `docker compose config` from inside `back/` against the existing, untouched `back/compose.yaml` (which uses the exact same `env_file: .env` mechanism) and got the byte-for-byte same warning and same corrupted value — this is not something Task 4's root compose introduces; both compose files inherit it equally from how `back/scripts/onboarding.mjs` generates bcrypt hashes into a plain `env_file`-consumed `.env`. Does not block any of Task 4's "Done when" criteria (auth was never part of the acceptance bar — root `/` correctly returning 401 instead of a working authenticated response is itself proof the hash isn't what the app expects, but that's true for `back/compose.yaml` too, pre-dating this change). Flagged as a risk below; fixing it (e.g. escaping `$` as `$$` in generated `.env` files, or switching to a compose `secrets:`/`environment:`-only pattern) is out of scope for Task 4 and would need its own task against `back/scripts/onboarding.mjs` or both compose files.

## Remaining Tasks

None — all 4 tasks complete.

## Workload / PR Boundary

### Task 1 (completed, prior batch)
- Mode: stacked PR slice (auto-chain)
- Boundary: starts from `qa`, ends at this single-file fix + its test; independent, no dependency on Tasks 2-4
- Estimated review budget impact: ~5 changed lines — well under the 400-line budget

### Task 2 (completed, prior batch)
- Mode: stacked PR slice (auto-chain)
- Current work unit: Task 2 — DI token + environment-aware API base URL wiring
- Boundary: starts from `feature/web/api-base-url-token` (off `qa`, per tasks.md sequencing), ends at the token + 4 service edits + server config override; independent of Task 1's content, depended on by Task 4 (not by Task 3)
- Estimated review budget impact: ~70 changed lines (2 new files, 5 modified) — well under the 400-line budget

### Task 3 (completed, this batch)
- Mode: stacked PR slice (auto-chain)
- Current work unit: Task 3 — web/Dockerfile + web/.dockerignore
- Boundary: starts from `feature/web/dockerfile` (off `qa`, branched from Task 2's branch per tasks.md sequencing), ends at the two new files (Dockerfile + .dockerignore); no code dependency on Tasks 1-2, depended on by Task 4 (compose builds `./web` with `target: prod`)
- Estimated review budget impact: ~50 changed lines (2 new files, ~46 lines Dockerfile + ~10 lines .dockerignore) — well under the 400-line budget; slightly above tasks.md's ~45-line estimate due to the `nodejs` fix comment block, still far under budget

### Task 4 (completed, this batch — FINAL)
- Mode: stacked PR slice (auto-chain)
- Current work unit: Task 4 — root docker-compose.yml (full-stack orchestration)
- Boundary: starts from `feature/repo/docker-compose-root` (off `qa`, branched from Task 3's branch per tasks.md sequencing), ends at the single new root `docker-compose.yml`; hard dependency on Task 2 (env-driven URL wiring) and Task 3 (`web/Dockerfile` to build from); this is the last work unit in the chain — after this, the `qa`→`main` promotion PR is a separate, later, repo-standard action outside this change's scope
- Estimated review budget impact: ~65 changed lines (1 new file, root `docker-compose.yml`) — well under the 400-line budget; above tasks.md's ~45-line estimate due to inline comments explaining the healthcheck/CORS-override rationale, still far under budget

## Risks

- **Pre-existing `AUTH_PASSWORD_HASH` env-interpolation corruption** (see Issues Found → Task 4): `back/.env`'s bcrypt hash contains un-escaped `$` sequences that Compose's `env_file` interpolation partially blanks out with a "variable not set" warning. Confirmed identical and pre-existing in the untouched `back/compose.yaml`, not introduced by this task. Does not block any Task 4 acceptance criterion (login/auth was never in scope for this change's "Done when" list), but is a real correctness gap worth a follow-up task against `back/scripts/onboarding.mjs`'s generated `.env` (escape `$` as `$$`) or both compose files' `env_file` usage.
- **No unguarded eager-fetch SSR route exists yet** (documented in design.md's own "Known limitation"): the app's only route (`/`) is guarded and redirects to `/login` server-side without calling the API, so no page today literally proves a live SSR page render with embedded API data. Verified the underlying mechanism directly instead (in-container `fetch(process.env.API_URL_SERVER)` — see Task 4 Verification) rather than overclaiming proof via an unrelated page's HTML output. If a future feature adds an eager-fetch unguarded route, it will exercise this same env-var-driven path automatically; no further wiring needed.

## Status

4/4 tasks complete. All tasks in `openspec/changes/dockerize-monorepo/tasks.md` are checked off. Ready for `sdd-verify`.
