# Tasks: OpenAPI 3.x Documentation + Swagger UI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~320-450 (YAML 250-400, 2 TS files 30-80, `_routes.ts` 1-2, `package.json` ~4; excludes lockfile) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

Rationale: additive, single-concern (docs only), no cross-cutting logic; risk sits near — not clearly over — the budget, driven almost entirely by the hand-authored YAML content rather than logic complexity. Single PR is appropriate; if the actual `openapi.yaml` diff lands materially above 400 lines during apply, flag it to the orchestrator before merging rather than pre-splitting speculatively.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full OpenAPI docs + `/docs` mount | PR 1 | Single self-contained PR; no dependency on other in-flight work |

## Phase 1: Dependencies

- [x] 1.1 Add `swagger-ui-express`, `js-yaml` to `package.json` dependencies; `@types/swagger-ui-express`, `@types/js-yaml` to devDependencies; run install. Acceptance: `npm ls swagger-ui-express js-yaml` resolves, lockfile updated.

## Phase 2: Author `openapi.yaml` (repo root)

- [x] 2.1 Add `info`, `servers`, and `components.securitySchemes.bearerAuth` (`type: http`, `scheme: bearer`, `bearerFormat: JWT`); set global default `security: [bearerAuth]`. Acceptance: schema validates (API-DOC-03).
- [x] 2.2 Add `components.schemas`: `Movement`, `Category`, `MonthlySummary` (nested `mount` field, not `amount`), `Error` (`{ message, errors? }`). Acceptance: API-DOC-04, API-DOC-08.
- [x] 2.3 Author `POST /auth/login` with `security: []` override (no bearerAuth). Acceptance: API-DOC-03 login scenario.
- [x] 2.4 Author the 8 `/movement/*` operations: `GET /movement/month`, `GET /movement/summary/{month}/{year}`, `GET /movement/{startDate}/{endDate}` (pagination params `page`/`limit`, bare-array response), `POST /movement/{startDate}/{endDate}` (as distinct op from the GET), `POST /movement/`, `POST /movement/save`, `PUT /movement/{id}`, `DELETE /movement/{id}` (bare `type: string` response). All apply `bearerAuth`. Acceptance: API-DOC-01, API-DOC-05, API-DOC-07.
- [x] 2.5 Author the 5 `/category/*` operations: `GET /category/` (pagination, bare-array), `GET /category/{id}`, `POST /category/` (`oneOf: [Category, Category[]]` with bulk-caveat description pointing to `/category/save`), `POST /category/save`, `DELETE /category/{id}`. All apply `bearerAuth`. Acceptance: API-DOC-01, API-DOC-06, API-DOC-07.
- [x] 2.6 Verify every non-2xx response across all 14 operations references the `Error` schema. Acceptance: API-DOC-08.
- [x] 2.7 Count paths+methods; confirm exactly 14. Acceptance: API-DOC-01 endpoint-count scenario.

## Phase 3: Config + route wiring

- [x] 3.1 Create `src/config/openapi.ts`: `readFileSync` + `js-yaml.load()` cast to `swagger-ui-express`'s `JsonObject` (fallback local `Record<string, unknown>` alias if not exported). Acceptance: `tsc` clean, no `any`.
- [x] 3.2 Create `src/modules/routes/docs.route.ts`: scoped `helmet.contentSecurityPolicy()` override, `GET /openapi.json` handler returning `openApiSpec`, `swaggerUi.serve` + `swaggerUi.setup(openApiSpec)` on `/`. Acceptance: `tsc`/lint clean.
- [x] 3.3 Edit `src/_routes.ts`: add `docsRoute` import and `router.use('/docs', docsRoute)` between `router.use('/auth', authRoute)` and `router.use(authenticate)`. Acceptance: no other line touched (diff = import + 1 line).

## Phase 4: Verification

- [x] 4.1 Run `npm run build`; confirm no TS errors, no `any`. Acceptance: exit 0.
- [x] 4.2 Run lint; confirm clean. Acceptance: exit 0.
- [x] 4.3 Manual: `GET /docs` returns 200 without `Authorization` header, in dev and with `NODE_ENV=production`. Acceptance: API-DOC-02.
- [x] 4.4 Manual: `GET /docs/openapi.json` returns valid JSON with 14 path+method entries. Acceptance: API-DOC-01.
- [x] 4.5 Manual: existing `GET /movement/...` and `/category/...` still return 401 without a token (no behavior change). Acceptance: API-DOC-10.
- [x] 4.6 Confirm `/docs` has no route-specific rate-limit exemption (shares global limiter). Acceptance: API-DOC-09.
