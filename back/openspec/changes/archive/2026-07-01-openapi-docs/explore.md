# Exploration: openapi-docs — Add OpenAPI/Swagger documentation

## Current State

No OpenAPI/Swagger setup exists. `rg -i "swagger|openapi"` across `src/` returns zero matches; `package.json` has no swagger/openapi dependency of any kind.

**Route inventory (re-verified against current source — CORRECTS the count given in the task brief):**

- `src/modules/routes/auth.route.ts`, mounted `/auth`, public (before `authenticate` in `src/_routes.ts`):
  - `POST /auth/login` — body `{ Email: string, Password: string }` (validated by `loginValidator`) → `successResponse(res, { token, expiresIn })`. Invalid creds → 401 via `errorResponse`.

- `src/modules/routes/movement.route.ts`, mounted `/movement`, all behind `authenticate` (Bearer JWT) — **8 endpoints, not 7**:
  1. `GET /movement/month` → current-month movements (populates `Category`)
  2. `GET /movement/summary/:month/:year` (`paramDateValidator`) → summary with the `mount` field typo (see below)
  3. `GET /movement/:startDate/:endDate` (`paramBodyValidator`) → filtered movements + pagination
  4. `POST /movement/:startDate/:endDate` (`paramBodyValidator`) — **same path as #3, different verb**, same filter semantics (body filters instead of/along with query) — this is the endpoint the original 7-count likely missed
  5. `POST /movement/` (`addUpdateValidator`) → create, 201
  6. `POST /movement/save` (`manySaveValidator`) → bulk create, 201
  7. `PUT /movement/:id` (`addUpdateValidator` + id check) → update
  8. `DELETE /movement/:id` (`idValidator`) → delete, returns bare string

- `src/modules/routes/category.route.ts`, mounted `/category`, all behind `authenticate` — 5 endpoints (matches original count):
  1. `GET /category/` → paginated list
  2. `GET /category/:id` (`idValidator`)
  3. `POST /category/` (`bodyValidator`) → single-or-array in the SAME route (see oneOf note below), 201
  4. `POST /category/save` (`manySaveValidator`) → **separate** bulk-only route → `manySaveCategory` → `CategoryService.manySave` (proper `bulkWrite`), 201
  5. `DELETE /category/:id` (`idValidator`)

**Corrected total: 14 endpoints (1 + 8 + 5), not 13.** This must be corrected in the proposal/spec phase.

**Response envelope** (`src/middlewares/response.middleware.ts` — filename already renamed from `responose.middleware.ts`, contrary to `openspec/sdd-init.md` which still references the old typo'd name and says "no test runner" — both are stale; current `package.json` has `vitest` configured):
- `successResponse(res, data, statusCode=200)` → `res.status(code).json(data)` — **no wrapper**, raw payload.
- `errorResponse(res, message, statusCode=500, errors?)` → `{ message: string, errors?: string[] }`.

**Confirmed quirks (byte-for-byte, in current source):**
- `getSummaryByMonth` (movement.controller.ts:87-100): response body is `{ month, year, summary: { items, mount: { income, expense } }, movements }` — field is literally `mount`, not `amount`. Must document as-is.
- `deleteMovement` (movement.controller.ts:125-133): `successResponse(res, \`Movement ${id}, deleted\`)` — a bare JSON string, not an object. OpenAPI response schema must be `type: string`, not an object schema.
- `POST /category/` oneOf case is real but **has a downstream inconsistency worth flagging to the proposal phase**: `bodyValidator` (category.validator.ts:59-70) branches on `Array.isArray(req.body)` and validates either a single object or an array of objects. But the controller (`saveCategory` → `CategoryService.save(req.body)`, category.service.ts:10-17) only implements single-object upsert logic (`data.Tag ? {Tag: data.Tag} : {Name: data.Name}`) — if an array is actually POSTed to `/category/`, the service does not bulk-upsert it; behavior is effectively undefined/broken at the persistence layer even though the validator accepts it. **Open question for propose/spec: document the oneOf as the validator's stated contract (aspirational, since that's the current express-validator behavior and this is a docs-only change with no logic fixes allowed), or add an explicit `x-known-issue` / description note that array bodies to this endpoint are not correctly persisted (use `POST /category/save` instead)?** Since scope forbids fixing behavior, the safer default is: document the literal validator-accepted request shape, but add a caveat note in the description that bulk creation should use `/category/save`.
- Pagination (`page`/`limit`, default 50, max 200) exists on `GET /movement/:startDate/:endDate` (via `toPagination` in movement.controller.ts) and `GET /category/` (via `toPagination` in category.controller.ts) — both cap at `MAX_PAGE_SIZE=200`. Responses remain bare arrays with no `total`/`count` metadata — must document as-is (no wrapper to add).

**Middleware order** (`src/index.ts`): `helmet()` → CORS (env-driven origin allow-list, `credentials: true`) → `express.json({limit:'100kb'})` → rate limiter (`express-rate-limit`, 100 req/15min/IP, global — not scoped per-route) → `mainRoutes` (`/`) → global error handler. The rate limiter is a top-level `app.use()` BEFORE `mainRoutes`, so anything mounted inside `_routes.ts` (including a docs router, if mounted there) is subject to the 100/15min limit; only mounting a docs router directly on `app` before the limiter would bypass it.

**Toolchain constraints confirmed still valid:**
- `eslint.config.mjs` enforces `@typescript-eslint/no-explicit-any` as `error` (2 files reference `no-explicit-any`: `tasks.json`, `eslint.config.mjs`).
- `tsconfig.json`: `module: commonjs`, `esModuleInterop: true` (so `import swaggerUi from 'swagger-ui-express'` works cleanly), `strict: true`.
- No test runner blocker: `package.json` now has `vitest` configured (`test`/`test:watch` scripts) — contradicts the stale `openspec/sdd-init.md` claim of "no test runner"; irrelevant to this docs-only change either way since no runtime logic is added, but worth a heads-up for the tasks phase if any doc-validation test is desired (e.g., a smoke test asserting `/docs` returns 200).

## Affected Areas (if this change proceeds)

- New file: `openapi.yaml` (or `.json`) — hand-authored spec, not generated. No existing file to modify.
- New file: `src/modules/routes/docs.route.ts` (or mounted inline in `src/index.ts`) — wires `swagger-ui-express`.
- `src/index.ts` — one new `app.use('/docs', ...)` line; placement relative to `helmet`, CORS, rate limiter, and `authenticate` is the key open decision (see below). No existing line should be removed or altered.
- `package.json` — add `swagger-ui-express` (+ `@types/swagger-ui-express`) as the only new dependency; optionally `js-yaml`/`yaml` if the spec is authored as `.yaml` and needs runtime parsing (or skip entirely by authoring as `.json`/`.ts` object literal to avoid the extra dependency).
- No changes to any controller, validator, service, model, or interface file — this is strictly additive and documentation-only, consistent with the stated scope.

## Approaches

1. **Hand-written static OpenAPI 3.x spec + `swagger-ui-express`** — author `openapi.yaml` by hand describing all 14 endpoints, security schemes, and the documented quirks (mount typo, bare-string delete response, oneOf category body); serve via `swagger-ui-express` at a dedicated path.
   - Pros: full control over documenting exact real behavior including all quirks and the oneOf case; zero coupling to validator/controller code so no risk of behavior drift being introduced by the docs tooling itself; no runtime parsing surprises; works cleanly with `esModuleInterop`; trivial to keep `no-explicit-any` clean (spec is data, not code).
   - Cons: manual sync burden — nothing enforces the spec matches the code if either changes later (mitigated only by process, e.g. PR review checklist); front-loaded authoring effort for 14 endpoints with two edge-case schemas.
   - Effort: Medium (mostly authoring time, near-zero code risk).

2. **`swagger-jsdoc`** — generate the spec from JSDoc-style annotations placed above route handlers/definitions.
   - Pros: keeps spec "close to code" in theory.
   - Cons: explicitly ruled out by the user (no TSDoc/JSDoc code comments in scope); also technically weaker here — annotation blocks would need to hand-encode the exact same oneOf/typo/bare-string edge cases as free-form YAML embedded in comments, with none of the benefits of a real spec file (no schema reuse via YAML anchors, harder to review as a diff, output only regenerated at build time and easy to silently drift from annotations). No net benefit over approach 1 for this codebase.
   - Effort: Medium-High, and out of scope per explicit user instruction.

3. **express-validator → OpenAPI auto-bridge** (e.g. community converters) — attempt to derive the spec from the existing `express-validator` chains.
   - Pros: theoretical single source of truth.
   - Cons: this codebase's validators use bespoke composition (`checkKeys`, `checkDate`, `.if(isPost)` conditional chains, and the `Array.isArray(req.body)` branch in `category.validator.ts`/`movement.validator.ts`'s `manySaveValidator`) that no maintained open-source bridge tool understands; would require writing custom introspection over the validator functions with no existing library support. Re-confirmed against current validator files — the conditional/branching logic is unchanged and still not expressible as static metadata a bridge could read.
   - Effort: High, with low confidence of correctness, and still would not resolve the "should we document the buggy array case" judgment call, which is a product decision, not a mechanical extraction.

## Recommendation

Approach 1 (hand-written OpenAPI 3.x YAML + `swagger-ui-express`) — this fully reconfirms the prior `documentation-add` exploration's conclusion on the current codebase state. Nothing in the current source changes that recommendation. Additional specifics to carry into `sdd-propose`:
- Apply `securitySchemes.bearerAuth` (type `http`, scheme `bearer`, `bearerFormat: JWT`) to all `/movement/*` and `/category/*` operations; leave `/auth/login` unauthenticated.
- Document all 14 endpoints (corrected count), including the previously-uncounted `POST /movement/:startDate/:endDate`.
- Document `getSummaryByMonth`'s `mount` field verbatim (not `amount`).
- Document `deleteMovement`'s response as `type: string`, not an object.
- Document `POST /category/` request body as `oneOf: [CategoryI, array of CategoryI]` per the validator's literal accepted shape, with an explicit description caveat steering bulk callers to `/category/save` (the only route with a correct bulk-persistence implementation) instead of asserting the array branch on `/category/` is safe.
- Document pagination params (`page`, `limit`, default 50, max 200) on the two endpoints that support them, and be explicit in each response description that the response is a bare array with no total-count metadata (do not imply pagination metadata exists).

## Risks

- **Spec/code drift over time** — inherent to hand-written docs; no automated enforcement exists or is being proposed. Should be called out as an accepted tradeoff in the proposal, possibly with a lightweight future follow-up (e.g., a contract test asserting `/docs` spec loads and matches route count) — but that is a scope decision for later, not this exploration.
- **`POST /category/` oneOf documentation risk** — documenting the array branch as if it works correctly could mislead API consumers into relying on genuinely broken behavior (service layer does not bulk-upsert arrays). Must be resolved explicitly in `sdd-propose` (see open question below), not silently decided during spec-writing.
- **Rate limiter / auth boundary interaction** — where `/docs` is mounted determines whether Swagger UI itself burns into the shared 100 req/15min/IP budget and whether it needs a Bearer token to view (open question, not yet decided).
- **Stale project artifacts** — `openspec/sdd-init.md` and the project's own `CLAUDE.md` both contain stale claims (old middleware filename, "no test runner") that should NOT be treated as current truth for this or future explorations; this exploration relied on live source-of-truth files instead.

## Open Questions for sdd-propose

1. **Auth boundary**: mount `/docs` before or after `authenticate` in `_routes.ts`/`index.ts`? (Prior exploration recommended public/before — confirm this is still the desired product decision, since anyone with the URL could read full API shape including the oneOf/bearer requirements.)
2. **Docs path**: confirm `/docs` as the final path (vs. `/api-docs`, `/swagger`, etc.) and whether the raw spec file itself should also be served at a separate machine-readable path (e.g. `/docs/openapi.json`).
3. **Rate limiter policy**: should `/docs` be exempt from the 100 req/15min/IP limiter (mount before the limiter on `app` directly), or share the same budget as the rest of the API (mount inside `mainRoutes`)?
4. **Environment gating**: available in all environments (including production) or only non-production? Prior exploration recommended "all environments" — confirm.
5. **Spec format and location**: `openapi.yaml` at repo root vs. under `src/` or a new `docs/` folder; YAML vs. JSON (YAML is more readable for hand-authoring but needs a parse step — either a small runtime `js-yaml` dependency or a build-time step; JSON avoids the extra dependency but is less pleasant to hand-author for 14 endpoints).
6. **`POST /category/` oneOf documentation stance**: document the array branch as literally validator-accepted (with a caveat note), or omit the array branch entirely from the documented contract and only describe the single-object shape, pointing bulk callers exclusively to `/category/save`? This is a product/documentation-honesty decision, not a technical one.
7. **Endpoint count correction**: confirm the proposal/spec phases use the corrected count of 14 endpoints (not 13), including the previously-missed `POST /movement/:startDate/:endDate`.

## Ready for Proposal

Yes. All prior assumptions re-verified against current source and one materially important correction found (endpoint count 14 not 13, plus the `POST /category/` array-branch persistence gap) that the proposal phase must account for. No code changes were made during this exploration.
