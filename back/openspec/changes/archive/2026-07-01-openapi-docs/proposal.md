# Proposal: OpenAPI 3.x Documentation + Swagger UI

## Intent

The API has **zero** machine-readable or human-browsable documentation. New consumers must read validators, controllers, and the response middleware to learn request shapes, the Bearer requirement, and the codebase's real (quirky) response bodies. This change adds a hand-written OpenAPI 3.x spec (source of truth) served via Swagger UI, documenting all **14** endpoints exactly as they behave today — including known quirks — with **no behavior changes**.

## Scope

### In Scope
- Hand-author `openapi.yaml` (repo root, YAML, source of truth — not generated) covering all 14 endpoints: 1 auth + 8 movement + 5 category.
- Serve Swagger UI via `swagger-ui-express` at **`/docs`**, mounted **before** `authenticate` in `src/_routes.ts` (public).
- Define `bearerAuth` (`http`/`bearer`/JWT) and apply it to all `/movement/*` and `/category/*` operations; NOT to `POST /auth/login`.
- Document real behavior verbatim: `summary` `mount` field (not `amount`); `DELETE /movement/:id` bare-string body (schema `type: string`); bare-array responses with no total/count metadata on `GET /movement/:startDate/:endDate` and `GET /category/`; pagination params (`page`, `limit`, default 50, max 200).
- Document `POST /category/` body as `oneOf: [Category, Category[]]` (literal validator contract) with an explicit caveat: use `POST /category/save` for bulk, since `CategoryService.save` only persists a single object.
- Explicitly document `POST /movement/:startDate/:endDate` (same path as the GET filter, different verb) as its own endpoint.

### Out of Scope
- Any TSDoc/JSDoc code-level comments.
- Any controller/validator/service/route/model behavior change.
- Fixing the `POST /category/` array-persistence bug, the `mount` typo, or bare-string/array responses (documented as-is only).
- Drift/contract test between spec and routes.
- `NODE_ENV` gating — docs are available in ALL environments including production.

## Capabilities

### New Capabilities
- `api-documentation`: hand-written OpenAPI 3.x spec + Swagger UI at `/docs` describing all 14 endpoints, security, schemas, and documented quirks.

### Modified Capabilities
- None (strictly additive; no existing spec-level behavior changes).

## Approach

Approach 1 from exploration: hand-written static OpenAPI 3.x YAML + `swagger-ui-express`. Author `openapi.yaml` describing every endpoint, `bearerAuth`, reusable schemas, and quirk caveats. Add one `docs` router wired to `swagger-ui-express`, mounted public + before `authenticate`. `/docs` stays under the global rate limiter (100 req/15min/IP — ample; no exemption). No runtime logic added.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openapi.yaml` (repo root) | New | Hand-authored spec, source of truth, all 14 endpoints |
| `src/modules/routes/docs.route.ts` | New | Wires `swagger-ui-express` serve/setup |
| `src/_routes.ts` | Modified | Mount `/docs` public, BEFORE `authenticate`; no existing line altered |
| `package.json` | Modified | Add `swagger-ui-express` + `@types/swagger-ui-express` (+ possible YAML parser — see Design) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Spec/code drift over time | High | Accepted tradeoff; hand-written docs, no enforcement in scope; PR-review discipline |
| oneOf array branch misleads consumers into broken bulk-create | Med | Explicit caveat steering bulk callers to `/category/save` |
| Public `/docs` exposes full API shape | Low | Product decision (locked): public in all envs; no secrets in spec |
| YAML needs a runtime parse dependency | Med | Resolve exact parse mechanism in design (see For Design Phase) |

## Rollback Plan

Fully additive. Revert by removing the `/docs` mount line in `src/_routes.ts`, deleting `docs.route.ts` and `openapi.yaml`, and removing the new `package.json` dependencies. No runtime logic, data, or existing endpoint is touched, so revert is a clean git revert with zero migration.

## Dependencies

- `swagger-ui-express` + `@types/swagger-ui-express` (confirmed absent from current `package.json`).
- Possible YAML runtime parser (`js-yaml`/`yaml`) — TBD in design (see below).

## Success Criteria

- [ ] `openapi.yaml` documents all 14 endpoints (1 auth + 8 movement + 5 category), including `POST /movement/:startDate/:endDate`.
- [ ] `GET /docs` returns Swagger UI (200) in every environment, without a Bearer token.
- [ ] `bearerAuth` applied to all `/movement/*` and `/category/*` ops; NOT on `POST /auth/login`.
- [ ] `mount` field, bare-string delete body, and bare-array responses documented verbatim.
- [ ] `POST /category/` documented as `oneOf` with the bulk-use-`/category/save` caveat.
- [ ] No controller/validator/service/route/model behavior changed.

## Non-Goals

- No auto-generation from code, no JSDoc/TSDoc.
- No bug fixes for documented quirks.
- No drift/contract test.
- No environment gating.

## For Design Phase

- **YAML parse mechanism**: `swagger-ui-express.setup()` consumes a JS object, so YAML must be parsed at runtime. Decide: add `js-yaml`/`yaml` and load-parse `openapi.yaml` at startup, vs. author as JSON to avoid the extra dependency. Format is locked to **YAML**; only the parse approach is open.
- **Mount mechanics**: exact placement of the `/docs` router relative to `authenticate` in `src/_routes.ts` (public, before auth) and whether to also serve the raw spec at a machine-readable path (e.g. `/docs/openapi.json`).
- **Schema reuse**: YAML anchors / `components.schemas` factoring for `Movement`, `Category`, error envelope (`{ message, errors? }`), and the summary body.
