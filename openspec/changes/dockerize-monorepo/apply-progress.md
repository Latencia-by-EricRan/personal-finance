# Apply Progress: dockerize-monorepo

**Mode**: Strict TDD
**Delivery strategy**: auto-chain (per session decision) — one autonomous slice per apply batch
**Chain strategy**: stacked-to-qa (reconciled per tasks.md branch-model note)
**Branch (Task 1)**: `fix/back/onboarding-cors-port` (off `qa`)
**Branch (Task 2)**: `feature/web/api-base-url-token` (off `qa`)
**Branch (Task 3)**: `feature/web/dockerfile` (off `qa`, current branch)

## Completed Tasks

- [x] Task 1 — Fix CORS origin port in onboarding.mjs
- [x] Task 2 — DI token + environment-aware API base URL wiring (Angular-side only, no Docker)
- [x] Task 3 — web/Dockerfile + web/.dockerignore

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

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 | `back/scripts/onboarding.test.mjs` | Unit | ✅ 10/10 (baseline before edit) | ✅ Written — new assertion failed against pre-fix source (`Expected 'CORS_ORIGINS=http://localhost:4200'` vs received `...5173`) | ✅ Passed — 10/10 after one-line fix | ➖ Skipped: purely structural single-value config string, no branching/logic to generalize (exempt per strict-tdd.md) | ➖ None needed — one-line literal change, nothing to extract or clean |
| 2 | `web/src/app/core/tokens/api-base-url.token.spec.ts` | Unit | ✅ 101/101 Karma baseline before edit (8 pre-existing failures unrelated to scope, confirmed via git-stash A/B — see Deviations) | ✅ Written first — failed with `Module not found: Can't resolve './api-base-url.token'` (file didn't exist yet) | ✅ Passed after creating `api-base-url.token.ts` — confirmed again green after wiring `app.config.server.ts` + all 4 services | ➖ Skipped: single default-value assertion, no branching logic to generalize (exempt per strict-tdd.md, same rationale as Task 1) | ➖ None needed — token file is a minimal `InjectionToken` declaration, nothing to extract |
| 3 | N/A — infra-only, no unit test framework applies | Build/Runtime | N/A | ➖ Exempt: `Dockerfile`/`.dockerignore` are declarative infra artifacts, not TS/JS logic; there is no unit-test harness for Dockerfile content (per prompt's explicit scope note) | ✅ Verified via actual `docker build`/`docker run` execution treated as the acceptance test (see Task 3 Verification below) — this IS the RED→GREEN equivalent: first `docker build --target prod` attempt FAILED (RED, see Deviations), fix applied, re-run PASSED (GREEN) | ➖ N/A | ➖ N/A — no refactor step for a 2-file infra change |

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

## Deviations from Design

Task 1 and Task 2: None — implementation matches design.md and tasks.md exactly for both tasks.

**Task 3 — one required correction to design.md's Dockerfile snippet, found via actual `docker build` execution (not assumed):**

`docker build --target prod ./web` initially FAILED at the `RUN bun run build` step with `✘ [ERROR] An error occurred while extracting routes. / undefined` and `Prerendered 0 static routes` — even though the identical `bun run build` command succeeded locally outside Docker (`Prerendered 8 static routes`). Root cause, confirmed by inspecting the image: `oven/bun:1-alpine` does NOT ship a real Node.js binary — it only provides a bun-backed `node` shim as a PATH fallback (`/usr/local/bun-node-fallback-bin/node -> /usr/local/bin/bun`, last in `$PATH`). The Angular CLI's build spawns a child process to prerender/extract routes, and that child process needs a genuine Node.js runtime; bun's node-compat shim fails silently there with an opaque `undefined` error. This is a real gap in design.md's Dockerfile snippet, not a scope deviation — the design's snippet as written does not build. **Fix applied**: added `RUN apk add --no-cache nodejs` to the `deps` stage (before `bun install`), which installs a real `node` binary at `/usr/bin/node`, earlier in `$PATH` than bun's fallback shim, so `dev` and `build` (both built `FROM deps`) now get a working Node runtime for any child-process spawning the Angular builder needs. `prod-deps` (production-only bun install, no build step) and `prod` (already `node:22-alpine`, real Node) were unaffected/unchanged. Re-ran both `docker build --target dev` and `docker build --target prod` after the fix — both now succeed, and the prod image was smoke-tested successfully (see Task 3 verification above). This is flagged the same way the earlier design review flagged the missing `prod-deps` stage: a design snippet that looked complete on paper needed one more real-world-execution-verified line to actually build.

One environment-only note for Task 2 (not a design deviation): the sandbox had no system Chrome installed at the default Karma path (`/Applications/Google Chrome.app`). Ran tests with `CHROME_BIN` pointed at a Playwright-cached "Chrome for Testing" binary already present on disk (`~/Library/Caches/ms-playwright/chromium-1228/.../Google Chrome for Testing.app/...`). This is a local test-runner invocation detail, not a code or config change — no repo files were touched to make tests runnable.

## Issues Found

Pre-existing, out-of-scope for Task 2: 8 Karma specs (`AppComponent` ×3, `MainContainerComponent`, `ExpensesComponent`, `NavbarComponent`, `AddExpenseComponent`, `RecordsComponent`) fail with `NG0908: Angular requires Zone.js` because their own `TestBed.configureTestingModule` blocks omit `provideExperimentalZonelessChangeDetection()` (unlike the 4 service specs and the new token spec, which do include it). Confirmed pre-existing via git-stash A/B comparison — not introduced or worsened by Task 2. Not touched, per scope instructions (Task 2 must not touch anything beyond its assigned files). Flagging for a future task/PR outside this change's scope.

Task 3: none beyond the Dockerfile fix documented above under Deviations (that issue was found AND fixed within this batch, not left open).

## Remaining Tasks

- [ ] Task 4 — Root docker-compose.yml (full-stack orchestration)

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

## Status

3/4 tasks complete. Ready for next batch (Task 4 — root docker-compose.yml) or for a scoped PR/commit of this slice.
