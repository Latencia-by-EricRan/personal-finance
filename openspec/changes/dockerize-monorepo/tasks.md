# Tasks: Dockerize the monorepo (back/, web/)

Source: `proposal.md`, `design.md` (final — architectural decisions not re-litigated here),
`specs/container-orchestration/spec.md`, `specs/web-containerization/spec.md`.

Delivery strategy: `auto-chain` (already decided — no ask-on-risk gate). Chain strategy:
`stacked-to-main`.

**Branch-model reconciliation (repo-specific):** this repo's `CONTRIBUTING.md` uses a
2-branch model where `feature/*`/`fix/*`/`chore/*` branch off `qa` and PR into `qa`; `main`
is only reached via a separate `qa`→`main` promotion PR owned by the normal release
process. "Stacked-to-main" is therefore applied here as **stacked-to-`qa`**: each work
unit below opens a PR against `qa` (not `main`), each branch created off the previous
one's branch once merged, so GitHub shows only the current slice — matching the
`chained-pr` skill's Stacked PRs pattern with `qa` standing in for the chain's base. The
`qa`→`main` promotion PR is a separate, later, repo-standard action and is explicitly
**not** one of the 4 work units below.

## Task Checklist

- [ ] Task 1 — Fix CORS origin port in onboarding.mjs
- [ ] Task 2 — DI token + environment-aware API base URL wiring (Angular-side only, no Docker)
- [ ] Task 3 — web/Dockerfile + web/.dockerignore
- [ ] Task 4 — Root docker-compose.yml (full-stack orchestration)

## Ordered Work Units

Order is load-bearing: Task 4 cannot function without Tasks 2 and 3 existing; Task 3's
`prod` image is meaningless to compose without Task 2's env-driven URL; Task 1 is
independent and ships first because it is the smallest, lowest-risk, fully self-contained
fix.

---

### Task 1 — Fix CORS origin port in onboarding.mjs

- **Spec link**: `container-orchestration` → Requirement "Corrected CORS origin for the
  frontend" (both scenarios).
- **Branch**: `fix/back/onboarding-cors-port` (off `qa`).
- **Depends on**: none. Independent, ships first.
- **Files touched**:
  - `back/scripts/onboarding.mjs` — modify line 82: `CORS_ORIGINS=http://localhost:5173`
    → `CORS_ORIGINS=http://localhost:4200`.
  - `back/scripts/onboarding.test.mjs` — modify: add an assertion to the existing
    `'creates a private file containing only hashed credentials'` test (or a new sibling
    test) asserting `contents.toContain('CORS_ORIGINS=http://localhost:4200')`.
- **Strict TDD sequence**: write the new assertion first against the CURRENT source
  (expect it to fail — `5173` is what's actually written today), confirm the failure,
  then change the one line in `onboarding.mjs`, confirm the test goes green.
- **Estimated diff**: ~5 changed lines.
- **Done when**:
  - `cd back && npm test` (vitest run) passes, including the new/updated assertion.
  - `rg "5173" back/scripts/onboarding.mjs` returns no matches.
  - `rg "CORS_ORIGINS=http://localhost:4200" back/scripts/onboarding.mjs` matches.

---

### Task 2 — DI token + environment-aware API base URL wiring (Angular-side only, no Docker)

- **Spec link**: `web-containerization` → Requirement "Context-aware API host
  resolution" (all three scenarios — this task lands the mechanism; end-to-end proof of
  the "reaches back, not itself" scenario happens in Task 4 once containers exist).
- **Branch**: `feature/web/api-base-url-token` (off `qa`, after Task 1's branch is
  created — sequenced for a clean stacked diff, not a technical dependency on Task 1's
  content).
- **Depends on**: none functionally; sequenced second per chain order.
- **Files touched**:
  - `web/src/app/core/tokens/api-base-url.token.ts` — create: `API_BASE_URL`
    `InjectionToken<string>`, `providedIn: 'root'` factory defaulting to
    `environment.apiUrl` (per design's Interfaces/Contracts snippet).
  - `web/src/app/core/tokens/api-base-url.token.spec.ts` — create: one spec asserting
    the default injected value equals `environment.apiUrl` (per design's Testing
    Strategy row — "add one token-default spec").
  - `web/src/app/app.config.server.ts` — modify: add
    `{ provide: API_BASE_URL, useValue: process.env['API_URL_SERVER'] ?? 'http://localhost:3000' }`
    to the server-only provider list.
  - `web/src/app/components/main-container/pages/records/core/services/movement.service.ts`
    — modify: replace `environment.apiUrl` usage with `inject(API_BASE_URL)`.
  - `web/src/app/core/reference/account/account.service.ts` — modify: same pattern.
  - `web/src/app/core/reference/category/category.service.ts` — modify: same pattern.
  - `web/src/app/core/auth/services/auth.service.ts` — modify: same pattern.
  - `summary-by-month.component.ts` is explicitly NOT touched (design's finding — the
    token fix flows through `MovementService`, no separate edit needed there).
- **Strict TDD sequence**: write `api-base-url.token.spec.ts` first (fails — token
  doesn't exist), create the token file, go green. Existing service specs must NOT need
  changes (design's stated rationale: browser/Karma default still resolves to
  `environment.apiUrl`) — if any existing spec breaks, that is a signal the wiring
  deviated from design and must be fixed before proceeding, not the spec.
- **Estimated diff**: ~70 changed lines (two new files ~25 lines; five modified files
  ~45 lines combined — each service touch is import + one field, ~6–10 lines per file).
- **Done when**:
  - `cd web && bun run test` (full Karma/Jasmine suite) passes with zero pre-existing
    spec files modified.
  - The new `api-base-url.token.spec.ts` passes.
  - `rg "environment.apiUrl" web/src/app` no longer matches inside the four modified
    services (only the token factory and Karma-facing code reference it).

---

### Task 3 — web/Dockerfile + web/.dockerignore

- **Spec link**: `web-containerization` → Requirements "Buildable web container image"
  and "Excluded build context" (all scenarios).
- **Branch**: `feature/web/dockerfile` (off `qa`, branched from Task 2's branch once
  merged, per stacked-PR flow).
- **Depends on**: Task 2 only in the sense that a meaningfully testable `prod` image
  should carry the env-driven URL mechanism; the Dockerfile itself has no code
  dependency on Task 2's files. Sequenced third for stacked-diff cleanliness.
- **Files touched**:
  - `web/Dockerfile` — create: 5-stage build (`deps`/`dev`/`build`/`prod-deps`/`prod`)
    exactly per design's Interfaces/Contracts snippet — bun for install/build stages,
    `node:22-alpine` for the `prod` runtime, `prod-deps` stage required for
    `node_modules` at runtime (`express` + `@angular/ssr/node` are not inlined by the
    esbuild server bundle).
  - `web/.dockerignore` — create: excludes `node_modules`, `dist`, `.angular`, `.git`,
    `.gitignore`, `*.log`, `coverage`, `.DS_Store`, `.vscode`, `.editorconfig`.
- **Estimated diff**: ~45 changed lines (new files only).
- **Done when**:
  - `docker build --target dev -t pf-web:dev ./web` completes without error.
  - `docker build --target prod -t pf-web:prod ./web` completes without error.
  - `docker run --rm -p 4200:4000 pf-web:prod` starts the SSR server and serves a
    response on `:4000` without `ERR_MODULE_NOT_FOUND` (manual smoke check — proves the
    `prod-deps` stage actually carries the runtime deps).
  - Build context sent to the daemon does not include `node_modules`/`dist`/`.angular`
    (visible via `docker build --progress=plain` context-transfer size, or
    `DOCKER_BUILDKIT=1 docker build --no-cache` timing sanity check).

---

### Task 4 — Root docker-compose.yml (full-stack orchestration)

- **Spec link**: `container-orchestration` → all requirements ("Single-command
  full-stack startup", "Shared network for inter-service communication", "Mongo
  healthcheck gates back startup", "Host-reachable published ports", "Native back/
  workflow remains unaffected"). Also closes the loop on `web-containerization`'s
  "SSR request reaches the back container, not itself" scenario end-to-end.
- **Branch**: `feature/repo/docker-compose-root` (off `qa`, branched from Task 3's
  branch once merged).
- **Depends on**: Task 1 (consistent `CORS_ORIGINS`), Task 2 (`API_URL_SERVER` actually
  consumed by the `web` image), Task 3 (`web/Dockerfile` must exist — compose's `web`
  service builds from `./web` with `target: prod`). This is a hard dependency, not just
  a stacking convenience — compose cannot build `web` without Task 3, and the SSR
  scenario cannot be verified without Task 2.
- **Files touched**:
  - `docker-compose.yml` (repo root) — create: `mongodb` (image `mongo:8`, named
    volume, healthcheck), `back` (build context `./back` target `prod`, `env_file:
    ./back/.env`, `CORS_ORIGINS` override, TCP-connect healthcheck, `depends_on:
    mongodb: condition: service_healthy`), `web` (build context `./web` target `prod`,
    `API_URL_SERVER=http://back:3000`, `depends_on: back: condition: service_healthy`,
    port `4200:4000`) — exact skeleton per design's Interfaces/Contracts snippet.
- **Prerequisite (not a file change)**: `./back/.env` must exist locally before `docker
  compose up` (run `node back/scripts/onboarding.mjs --setup` first) — root compose does
  not generate it.
- **Estimated diff**: ~45 changed lines (one new file).
- **Done when**:
  - `docker compose config` validates the file without error.
  - `docker compose up -d` at repo root brings up `mongodb`, `back`, `web`; `docker
    compose ps` shows `back` reaching `healthy` only after `mongodb` is `healthy`
    (verify via `docker compose logs mongodb back` ordering or `docker events`).
  - `curl -sf http://localhost:3000` reaches `back` from the host.
  - `curl -sf http://localhost:4200` returns rendered SSR HTML with no
    connection-refused error (proves `API_URL_SERVER=http://back:3000` resolved
    correctly server-side).
  - `back/start-dev.sh` still runs its native+Mongo-only flow unchanged (regression
    check, run standalone, outside the compose stack).
  - `docker compose down` tears the stack down cleanly; re-running `docker compose up
    -d` is idempotent.

---

## Dependency Diagram

```
qa
 └── PR 1: fix/back/onboarding-cors-port           (independent)
      └── PR 2: feature/web/api-base-url-token     (sequenced, no code dependency)
           └── PR 3: feature/web/dockerfile         (sequenced, no code dependency)
                └── PR 4: feature/repo/docker-compose-root
                     (hard dependency: needs PR 2's env wiring + PR 3's Dockerfile)
```

Parallelizable in principle: Tasks 1, 2, and 3 have no code-level dependency on each
other and COULD be built in parallel by different people/sessions. They are still
presented as a linear stack (rather than 3 independent PRs merged in any order) because
`chain_strategy = stacked-to-main` was already selected and because Task 4 needs all
three regardless of merge order — stacking them keeps each diff isolated and avoids
rebasing surprises. If parallel authorship is preferred, Tasks 1–3 can be reordered or
merged out of sequence; only Task 4 has a genuine hard dependency.

## Review Workload Forecast

| Task | New files | Modified files | Est. changed lines |
|------|-----------|-----------------|---------------------|
| 1 — onboarding CORS fix | 0 | 2 | ~5 |
| 2 — DI token + wiring | 2 | 5 | ~70 |
| 3 — web Dockerfile + dockerignore | 2 | 0 | ~45 |
| 4 — root docker-compose.yml | 1 | 0 | ~45 |
| **Total** | **5** | **7** | **~165** |

- **400-line budget risk**: Low for every individual PR (largest is Task 2 at ~70
  lines — roughly 18% of the 400-line ceiling). No task approaches the threshold on
  its own.
- **Chained PRs recommended**: Yes — but the justification here is NOT the 400-line
  size threshold (nothing is close to it). It is (a) `delivery_strategy = auto-chain`
  was already decided for this session, (b) real ordering dependency (Task 4 cannot
  function without Tasks 2 and 3), and (c) matching the design's own Rollback Plan
  granularity, which lists these exact slices as independently revertible. Confirmed
  as still the right call given actual scope, for dependency-ordering reasons rather
  than size.
- **Stacked PR count**: 4 (`stacked-to-qa`, per the branch-model reconciliation above).
- **Decision needed before apply**: No — `size:exception` is not needed anywhere; no
  ask-on-risk gate applies since totals are well under budget.
