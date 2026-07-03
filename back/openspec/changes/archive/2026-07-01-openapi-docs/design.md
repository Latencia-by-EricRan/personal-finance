# Design: OpenAPI 3.x Documentation + Swagger UI

## Technical Approach

Add a hand-written `openapi.yaml` (source of truth, repo root) and serve it via `swagger-ui-express` at a public `/docs` route mounted **before** `authenticate` in `src/_routes.ts`. `swaggerUi.setup()` needs a plain JS object, so a tiny config-layer module (`src/config/openapi.ts`) reads and parses the YAML once at module load — mirroring how `src/config/database.ts` and `src/config/auth.config.ts` do load-time setup. The route file (`src/modules/routes/docs.route.ts`) only wires the router, matching the existing `modules/routes/*.route.ts` convention. No controller/validator/service/model/route behavior changes; the only edit to existing code is one mount line in `_routes.ts` plus a `/docs`-scoped CSP override.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| YAML parse mechanism | Add `js-yaml` (runtime) + `@types/js-yaml` (dev); `readFileSync` + `load()` at module load in `src/config/openapi.ts` | `yaml` pkg; author spec as JSON | `js-yaml.load()` returns `unknown` (not `any`), so a single explicit cast to `swaggerUi.JsonObject` satisfies `no-explicit-any: error`. `yaml.parse()` returns `any`. JSON avoids a dep but is unpleasant to hand-author for 14 paths; proposal locked format to YAML. |
| Spec load location | `src/config/openapi.ts` (load + parse), consumed by the route | Inline in `docs.route.ts` | Config layer already owns load-time side effects; keeps the route file purely about wiring. |
| Router file | New `src/modules/routes/docs.route.ts` | Inline in `_routes.ts` / `index.ts` | Matches the `modules/routes/*.route.ts` pattern. `docs` is route-only (no controller/service/validator) — a legitimate thin exception to the 5-layer module. |
| Mount point | `router.use('/docs', docsRoute)` between `router.use('/auth', authRoute)` and `router.use(authenticate)` | Mount on `app` in `index.ts` before the limiter | Keeps docs public (before `authenticate`) AND under the global rate limiter, exactly as the proposal locked ("no exemption"). |
| Machine-readable spec | Serve parsed spec at `GET /docs/openapi.json` | UI-only | Cheap, additive; lets tooling consume the contract without scraping HTML. |
| CSP for `/docs` | Route-scoped `helmet.contentSecurityPolicy()` override on the docs router only | Relax global `helmet()`; disable CSP | Global `helmet()` sets `script-src 'self'` / `style-src 'self'`, which blocks Swagger UI's inline init `<script>`/`<style>`. Re-setting CSP inside the docs router overwrites the header for `/docs` alone; global posture is untouched. |

## Data Flow

```text
module load:  openapi.yaml ──readFileSync/load──▶ src/config/openapi.ts (openApiSpec: JsonObject)
request:      GET /docs  ──▶ _routes(before authenticate) ──▶ docsRoute
                                   │
                    docsRoute: scoped-CSP ─▶ /openapi.json (JSON) | swaggerUi.serve+setup (UI)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `openapi.yaml` | Create | Hand-authored spec, all 14 endpoints, `bearerAuth`, `components.schemas`, quirk caveats |
| `src/config/openapi.ts` | Create | `readFileSync` + `js-yaml.load()`, export `openApiSpec` cast to `swaggerUi.JsonObject` |
| `src/modules/routes/docs.route.ts` | Create | Router: scoped CSP + `/openapi.json` + `swaggerUi.serve/setup` |
| `src/_routes.ts` | Modify | Add import + `router.use('/docs', docsRoute)` before `authenticate` (no existing line altered) |
| `package.json` | Modify | deps: `swagger-ui-express`, `js-yaml`; devDeps: `@types/swagger-ui-express`, `@types/js-yaml` |

## Interfaces / Contracts

### `src/config/openapi.ts` (load + parse, no `any`)

```ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import type { JsonObject } from 'swagger-ui-express';

// __dirname resolves to <root>/src/config (dev) or <root>/dist/config (build);
// ../../openapi.yaml lands on the repo-root spec in both cases.
const specPath = join(__dirname, '..', '..', 'openapi.yaml');
export const openApiSpec = load(readFileSync(specPath, 'utf8')) as JsonObject;
```

### `src/modules/routes/docs.route.ts` (wiring + scoped CSP)

```ts
import { Router, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../../config/openapi';

const docsRoute = Router();

// Overwrites the global helmet CSP header for /docs ONLY (Swagger UI needs inline script/style).
docsRoute.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
        },
    }),
);

docsRoute.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(openApiSpec);
});

docsRoute.use('/', swaggerUi.serve);
docsRoute.get('/', swaggerUi.setup(openApiSpec));

export default docsRoute;
```

### `src/_routes.ts` mount (public, before `authenticate`)

```ts
router.use('/auth', authRoute);
router.use('/docs', docsRoute); // public + before authenticate; still under global limiter
router.use(authenticate);
router.use('/movement', movementRoute);
router.use('/category', categoryRoute);
```

### `openapi.yaml` — `components` skeleton (factor shapes once, reuse across 14 paths)

```yaml
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Movement:
      type: object
      properties:
        _id: { type: string, readOnly: true }
        Amount: { type: number }
        Category: { type: string, description: ObjectId ref; populated on GET /movement/month }
        Date: { type: string, format: date-time }
        Type: { type: string, enum: [ingreso, egreso] }
        Card: { type: string }
        Description: { type: string }
      required: [Amount, Category, Date, Type]
    Category:
      type: object
      properties:
        _id: { type: string, readOnly: true }
        Name: { type: string }
        Description: { type: string }
        Tag: { type: string }
        Type: { type: string, enum: [variable, fijo] }
        Icon: { type: string }
      required: [Name, Description, Tag, Type]
    MonthlySummary: # NOTE: field is `mount` (typo), NOT `amount` — documented verbatim
      type: object
      properties:
        month: { type: integer }
        year: { type: integer }
        summary:
          type: object
          properties:
            items: { type: array, items: { $ref: '#/components/schemas/Movement' } }
            mount:
              type: object
              properties:
                income: { type: number }
                expense: { type: number }
        movements: { type: array, items: { $ref: '#/components/schemas/Movement' } }
    Error: # errorResponse envelope
      type: object
      properties:
        message: { type: string }
        errors: { type: array, items: { type: string } }
      required: [message]
security:
  - bearerAuth: [] # global default; POST /auth/login overrides with `security: []`
```

`POST /category/` requestBody reuses `Category` via `oneOf` (with the bulk caveat in `description`):

```yaml
requestBody:
  content:
    application/json:
      schema:
        oneOf:
          - $ref: '#/components/schemas/Category'
          - type: array
            items: { $ref: '#/components/schemas/Category' }
      description: >
        Array branch is validator-accepted but NOT persisted correctly by
        CategoryService.save. Use POST /category/save for bulk creation.
```

`DELETE /movement/:id` response is a bare string: `schema: { type: string }`. Paginated list responses (`GET /movement/:startDate/:endDate`, `GET /category/`) are bare arrays (`type: array`) with `page`/`limit` query params (default 50, max 200) and NO total/count metadata.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Static | Compiles + lints clean | `npm run build`, `npm run lint` (verify no `any`) |
| Integration | `GET /docs` 200 without Bearer; `GET /docs/openapi.json` returns valid object; movement/category routes still 401 without token | Optional Vitest smoke test (`supertest`) — nice-to-have, not required by scope |
| Manual | Spec loads in UI; 14 paths present; quirks documented verbatim | Open `/docs`, confirm against explore.md inventory |

## Migration / Rollout

No migration. Fully additive: revert = remove the `/docs` mount line, delete `docs.route.ts`, `src/config/openapi.ts`, `openapi.yaml`, and the new deps.

## Open Questions

- [ ] None blocking. During apply, confirm the installed `swagger-ui-express` version exports the `JsonObject` type; if not, cast to a locally-defined `Record<string, unknown>` alias instead (still `any`-free).
