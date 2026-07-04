# Apply Progress: dockerize-monorepo

**Mode**: Strict TDD
**Delivery strategy**: auto-chain (per session decision) — one autonomous slice per apply batch
**Chain strategy**: stacked-to-qa (reconciled per tasks.md branch-model note)
**Branch (Task 1)**: `fix/back/onboarding-cors-port` (off `qa`)
**Branch (Task 2)**: `feature/web/api-base-url-token` (off `qa`)

## Completed Tasks

- [x] Task 1 — Fix CORS origin port in onboarding.mjs
- [x] Task 2 — DI token + environment-aware API base URL wiring (Angular-side only, no Docker)

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

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 | `back/scripts/onboarding.test.mjs` | Unit | ✅ 10/10 (baseline before edit) | ✅ Written — new assertion failed against pre-fix source (`Expected 'CORS_ORIGINS=http://localhost:4200'` vs received `...5173`) | ✅ Passed — 10/10 after one-line fix | ➖ Skipped: purely structural single-value config string, no branching/logic to generalize (exempt per strict-tdd.md) | ➖ None needed — one-line literal change, nothing to extract or clean |
| 2 | `web/src/app/core/tokens/api-base-url.token.spec.ts` | Unit | ✅ 101/101 Karma baseline before edit (8 pre-existing failures unrelated to scope, confirmed via git-stash A/B — see Deviations) | ✅ Written first — failed with `Module not found: Can't resolve './api-base-url.token'` (file didn't exist yet) | ✅ Passed after creating `api-base-url.token.ts` — confirmed again green after wiring `app.config.server.ts` + all 4 services | ➖ Skipped: single default-value assertion, no branching logic to generalize (exempt per strict-tdd.md, same rationale as Task 1) | ➖ None needed — token file is a minimal `InjectionToken` declaration, nothing to extract |

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

## Deviations from Design

None — implementation matches design.md and tasks.md exactly for both tasks.

One environment-only note for Task 2 (not a design deviation): the sandbox had no system Chrome installed at the default Karma path (`/Applications/Google Chrome.app`). Ran tests with `CHROME_BIN` pointed at a Playwright-cached "Chrome for Testing" binary already present on disk (`~/Library/Caches/ms-playwright/chromium-1228/.../Google Chrome for Testing.app/...`). This is a local test-runner invocation detail, not a code or config change — no repo files were touched to make tests runnable.

## Issues Found

Pre-existing, out-of-scope for Task 2: 8 Karma specs (`AppComponent` ×3, `MainContainerComponent`, `ExpensesComponent`, `NavbarComponent`, `AddExpenseComponent`, `RecordsComponent`) fail with `NG0908: Angular requires Zone.js` because their own `TestBed.configureTestingModule` blocks omit `provideExperimentalZonelessChangeDetection()` (unlike the 4 service specs and the new token spec, which do include it). Confirmed pre-existing via git-stash A/B comparison — not introduced or worsened by Task 2. Not touched, per scope instructions (Task 2 must not touch anything beyond its assigned files). Flagging for a future task/PR outside this change's scope.

## Remaining Tasks

- [ ] Task 3 — web/Dockerfile + web/.dockerignore
- [ ] Task 4 — Root docker-compose.yml (full-stack orchestration)

## Workload / PR Boundary

### Task 1 (completed, prior batch)
- Mode: stacked PR slice (auto-chain)
- Boundary: starts from `qa`, ends at this single-file fix + its test; independent, no dependency on Tasks 2-4
- Estimated review budget impact: ~5 changed lines — well under the 400-line budget

### Task 2 (completed, this batch)
- Mode: stacked PR slice (auto-chain)
- Current work unit: Task 2 — DI token + environment-aware API base URL wiring
- Boundary: starts from `feature/web/api-base-url-token` (off `qa`, per tasks.md sequencing), ends at the token + 4 service edits + server config override; independent of Task 1's content, depended on by Task 4 (not by Task 3)
- Estimated review budget impact: ~70 changed lines (2 new files, 5 modified) — well under the 400-line budget

## Status

2/4 tasks complete. Ready for next batch (Task 3) or for a scoped PR/commit of this slice.
