---
status: pass
---

# Verify Report: dockerize-monorepo

**Change**: dockerize-monorepo
**Mode**: Full spec-driven verification (proposal + specs + design + tasks + apply-progress all present)
**Verified by**: sdd-verify, independent of apply-progress claims — every finding below is backed by a command run in this session, not by re-reading prior agent claims.
**Branch**: `qa` (all 4 task PRs merged: #5 Task 1, #6 Task 2, #7 Task 3, #8 Task 4)
**Verdict**: **PASS** — ready for `sdd-archive`.

## 1. Task Completeness (tasks.md)

All 4 checkboxes are checked in `openspec/changes/dockerize-monorepo/tasks.md`, and each task's "Done when" criteria were independently re-verified against the real repo state (not re-read as claims):

| Task | Checked | Done-when re-verified |
|------|---------|------------------------|
| 1 — CORS port fix | ✅ | `rg "CORS_ORIGINS=http://localhost:4200" back/scripts/onboarding.mjs` matches; `rg "5173"` no match; `cd back && npm test` → 22 files / 203 tests green |
| 2 — DI token wiring | ✅ | `rg "environment.apiUrl" web/src/app` shows zero matches inside the 4 modified services (only token factory + spec files reference it, as expected — spec files assert against the default); Karma run confirms |
| 3 — web/Dockerfile + .dockerignore | ✅ | Both files exist, content matches design exactly (including the `apk add nodejs` deviation fix); images already built and run cleanly in the compose stack |
| 4 — root docker-compose.yml | ✅ | File exists at repo root, `docker compose config` validates, full up/down/re-up cycle run in this session |

No unchecked or partially-done tasks found. **Blocking-severity issues for task completeness: none.**

## 2. container-orchestration spec — requirement-by-requirement

| Requirement | Status | Evidence (this session) |
|---|---|---|
| Single-command full-stack startup | PASS | `docker compose up -d` → mongodb, back, web all created/started with one command, no manual steps |
| Shared network for inter-service comms | PASS | All 3 services on `personalfinance_default` network (created automatically); `web` reached `back` by service name `back:3000` via `docker compose exec web node -e "fetch(process.env.API_URL_SERVER)"` → `STATUS 401 BODY {"message":"Unauthorized"}` — a real HTTP response, not ECONNREFUSED. Reproduced independently (3rd time across the change's history). |
| Mongo healthcheck gates back startup | PASS | Timestamps captured directly via `docker inspect`: mongodb `StartedAt` 03:16:07.586Z, first healthy log entry 03:16:12.66Z; `back` `StartedAt` 03:16:13.178Z (after mongo's first healthy check, not before); back's first healthy log entry 03:16:18.26Z; `web` `StartedAt` 03:16:18.79Z (after back's healthy check). Ordering is genuinely gated, not coincidental sequencing. |
| Host-reachable published ports | PASS | `curl http://localhost:3000/` → `HTTP_STATUS:401` (`{"message":"Unauthorized"}`, a real response from `back`, not connection-refused — root route requires auth by design). `curl http://localhost:4200/` → `HTTP_STATUS:200`, 31997-byte rendered SSR HTML body. |
| Native back/ workflow unaffected | PASS | `git -C back status --short` → empty (fully clean tree); `back/compose.yaml` last touched by commit `7833b50` (the original monorepo-consolidation commit, pre-dating this change) — genuinely untouched. `back-mongodb-1` (native workflow's own Mongo container) stayed `Up ... (healthy)` throughout this session's root-stack up/down cycles with zero port/name/network collision — both workflows coexist. |
| Corrected CORS origin | PASS | `rg "CORS_ORIGINS=http://localhost:4200" back/scripts/onboarding.mjs` matches (line 82); `back/scripts/onboarding.test.mjs` line 79 asserts `expect(contents).toContain('CORS_ORIGINS=http://localhost:4200')`; `npm test` → 203/203 green including this assertion. Root compose's `back` service also independently sets `CORS_ORIGINS: http://localhost:4200` as an environment override, defending against a stale pre-existing `.env`. |

**No blocking-severity issues, no warnings** for this spec.

## 3. web-containerization spec — requirement-by-requirement

| Requirement | Status | Evidence (this session) |
|---|---|---|
| Buildable web container image | PASS | `web/Dockerfile` exists with the documented 5-stage split (`deps`/`dev`/`build`/`prod-deps`/`prod`); images `personalfinance-web` already built and ran successfully as part of `docker compose up -d` in this session (container reached `Up`, served HTTP 200 on :4200). |
| Dev and prod targets both available | PASS | Dockerfile defines both `dev` (bun hot-reload, `EXPOSE 4200`) and `prod` (node:22-alpine runtime, `EXPOSE 4000`) stages; `prod` target is the one actually exercised end-to-end in this session's compose run. |
| Excluded build context | PASS | `web/.dockerignore` exists and lists `node_modules`, `dist`, `.angular`, `.git`, `.gitignore`, `*.log`, `coverage`, `.DS_Store`, `.vscode`, `.editorconfig` verbatim per design. |
| Context-aware API host resolution — SSR reaches back, not itself | PASS | `web/src/app/app.config.server.ts` overrides `API_BASE_URL` with `process.env['API_URL_SERVER'] ?? 'http://localhost:3000'`; root compose sets `API_URL_SERVER: http://back:3000` on the `web` service. In-container `fetch(process.env.API_URL_SERVER)` reached `back` (STATUS 401), not the web container's own loopback. |
| Context-aware API host resolution — browser keeps published host port | PASS | `web/src/app/core/tokens/api-base-url.token.ts` factory defaults to `environment.apiUrl` (`http://localhost:3000`), used by browser/Karma; confirmed by inspecting all 4 modified services (`movement.service.ts`, `account.service.ts`, `category.service.ts`, `auth.service.ts`) — each does `inject(API_BASE_URL)`, none imports `environment` anymore, yet their existing spec files still assert against `environment.apiUrl` untouched (correct, since that's the resolved default value in the browser/Karma context). |
| SSR render succeeds without a connection error | PASS | `curl http://localhost:4200/` → HTTP 200, no ECONNREFUSED, 31997-byte HTML body with `<title>Front</title>`. Note (carried from design's own documented limitation, re-confirmed, not a defect): the app's only route is guarded (`authGuard`), so no page today literally executes an eager unguarded SSR API fetch — the underlying mechanism was proven directly via the in-container `fetch(API_URL_SERVER)` call above rather than by an unrelated page's HTML. This is an accurate scope note, not a gap in this change. |

**No blocking-severity issues, no warnings** for this spec.

## 4. Test Suite Evidence (run fresh, not reused from apply-progress)

- **back**: `cd back && npm test` → **22 files / 203 tests green**, 0 red.
- **web**: `cd web && bun run test -- --watch=false --browsers=ChromeHeadless` → **94/102 green, 8 red**. Red spec names captured directly: `AppComponent` (×3: "should render title", "should have the 'front' title", "should create the app"), `MainContainerComponent should create`, `AddExpenseComponent should create`, `ExpensesComponent should create`, `NavbarComponent should create`, `RecordsComponent should create`. All 8 show `NG0908: Angular requires Zone.js` — confirmed by inspecting one directly (`app.component.spec.ts`, single commit `7833b50`, no reference to `API_BASE_URL`/`environment`) that these are unrelated to the token-wiring change and are a pre-existing zoneless-config gap in those specific spec files (missing `provideExperimentalZonelessChangeDetection()` in their own `TestBed.configureTestingModule`). None of the 8 red specs are among the 4 services or the new token spec touched by Task 2 — all 4 service specs (`movement.service.spec.ts`, `account.service.spec.ts`, `category.service.spec.ts`, `auth.service.spec.ts`) plus `api-base-url.token.spec.ts` are green.
- **docker compose config**: exit 0, valid.
- **docker compose up -d / down / up -d (idempotency)**: both cycles completed cleanly, health-gating reproduced identically both times.

**Non-blocking note (pre-existing, not introduced by this change)**: 8 Karma specs stuck red, unrelated to `dockerize-monorepo`'s scope (Zone.js config gap in test setup for `AppComponent`, `MainContainerComponent`, `ExpensesComponent`, `NavbarComponent`, `AddExpenseComponent`, `RecordsComponent`). Recommend a follow-up task to add `provideExperimentalZonelessChangeDetection()` to those spec files' `TestBed.configureTestingModule` blocks. Does not stand in the way of archiving this change.

## 5. Out-of-scope issue check — GitHub #9

Confirmed via `gh issue view 9`: issue is **open**, titled "Compose env_file interpolation corrupts AUTH_PASSWORD_HASH (breaks login in containerized stack)", explicitly states "Confirmed pre-existing — byte-identical corruption occurs in the untouched `back/compose.yaml`, not introduced by the `dockerize-monorepo` change (see PR #8)." Reproduced independently in this session: `docker compose config` prints the identical `"FnQO5p6vYNTNmANSLd153" variable is not set` warning. This is accurately scoped as pre-existing/out-of-scope and correctly does not stand in the way of this verification — none of this change's spec requirements or task "Done when" criteria depend on login/auth succeeding inside the containerized stack.

## 6. Design Coherence

Design's Open Questions section has 2 items left unchecked (root `back` uses `target: prod` + needs `.env` pre-existing; no DB seed step) — both are explicitly scoped as accepted tradeoffs in the design narrative, not unresolved obstacles; the design's own text already answers them ("acceptable — seeding is out of scope here"). No deviation found between design.md's final (corrected) snippets and the actual `web/Dockerfile` / root `docker-compose.yml` — byte-for-byte match confirmed by direct file read, including the `apk add nodejs` correction documented in Deviations.

## 7. Findings Summary

- **Blocking-severity findings**: none
- **Non-blocking warnings**: 1 (pre-existing, unrelated 8 Karma specs stuck red — recommend follow-up task, does not stand in the way of archiving)
- **Suggestions**: 1 (design's own Open Questions items around seed data / healthcheck strength remain honestly flagged as accepted tradeoffs for a first slice — no action required now, revisit if a real health route or seed requirement emerges later)

## Final Verdict

**PASS.** Every requirement in both `container-orchestration` and `web-containerization` specs is genuinely satisfied by the current repo state, verified via direct file inspection AND live `docker compose` execution (up/down/re-up, healthcheck timestamp ordering, host-port curls, in-container fetch to `back`) run independently in this verification session — not inferred from apply-progress claims. All 4 tasks are checked and their "Done when" criteria hold. GitHub issue #9 remains correctly scoped as pre-existing/out-of-scope. Repository left in a clean state (`docker compose down` executed, no leftover containers/networks; native `back-mongodb-1` untouched).

**Recommended next step**: `sdd-archive`.
