# Onboarding — Personal Finance API

Welcome. This document gets you from zero to productive on this codebase: what it is, how it's built, the conventions that make new code fit in, and where things currently stand.

## 1. What this is

A REST API for personal finance tracking: income/expense movements, categories, accounts/wallets, monthly budgets, recurring transactions, and reporting. Single-user (no multi-tenant auth) — built for one person to run their own finances.

Stack: **Express + TypeScript + Mongoose**, MongoDB as the datastore, JWT for auth, Vitest for tests, ESLint + Prettier for style, OpenAPI/Swagger for docs.

## 2. Getting it running

```bash
npm install
npm run dev      # ts-node-dev, hot reload
npm run build    # compile to dist/
npm start        # run compiled output (requires build first)
npm test         # vitest run
npm run lint     # eslint .
```

Required `.env` (see `.env.example`):

```
MONGO_CONN_STR=<mongodb connection string>
MONGO_DB_NAME=<database name>
PORT=<port, defaults to 80>
JWT_SECRET=<required, no default — server throws at startup if missing>
AUTH_ROOT_EMAIL=<the single user email>
AUTH_ROOT_PASSWORD=<the single user plaintext password — hashed internally at startup>
JWT_EXPIRES_IN=<optional, default '1d'>
CORS_ORIGINS=<optional, comma-separated allow-list; empty means CORS is fully closed>
```

There is no seed data and no test database fixtures — this is a from-scratch personal instance. To get an auth token: put `AUTH_ROOT_EMAIL` and `AUTH_ROOT_PASSWORD` (plaintext) in `.env`, start the server, then `POST /auth/login` with `{ Email, Password }`.

Once running, `GET /docs` serves Swagger UI reading `openapi.yaml` (public, no auth needed, still behind the global rate limiter). Every other route requires `Authorization: Bearer <token>`.

## 3. Architecture

Entry point `src/index.ts`: `dotenv` → `helmet` → `cors` → `express.json({ limit: '100kb' })` → `express-rate-limit` (100 req/15min per IP) → mount all routes → global error handler → connect Mongo → `listen`.

`src/_routes.ts` aggregates every module's router. Order matters: `/auth` and `/docs` are mounted *before* the `authenticate` middleware (public); everything else is mounted *after* (JWT-protected).

Every feature lives under `src/modules/` with a strict five-layer structure:

```
src/modules/
  models/       Mongoose Schema + model
  interfaces/   TypeScript interface for the document shape
  validators/   express-validator chains, used as route middleware
  controllers/  async request handlers, call services, never touch Mongoose directly
  services/     static classes with all Mongoose operations
  routes/       Express Router wiring validator → controller
```

**Request flow**: Route → Validator → Controller → Service → MongoDB.

Shared utilities: `src/middlewares/response.middleware.ts` (`successResponse`, `errorResponse`, `deletedResponse`), `src/interceptors/validator.interceptor.ts` (`validate` — runs `validationResult`, delegates to `errorResponse` on failure), `src/utils/validator.util.ts` (`checkDate`, `checkKeys` — a whitelist guard that throws on any unexpected body key), `src/utils/controller.util.ts` (`toMessage`, `toPagination`, the shared `Pagination` type — used by every controller and service, don't redeclare these).

## 4. Modules that exist today

| Module | Mount | What it does |
|---|---|---|
| `auth` | `/auth` | Single-user login. `POST /auth/login` issues a JWT. Credentials live in env vars. |
| `movement` | `/movement` | Income/expense records. `Type` (`ingreso`/`egreso`), `Amount`, `Date`, `Category` (ref), `Description`, `Card`. |
| `category` | `/category` | Movement categories (`Name`, `Type: 'variable'|'fijo'`, `Tag`, `Icon`). Supports single or bulk create. |
| `account` | `/account` | Wallets/accounts (`Name`, `Type: 'efectivo'|'banco'|'tarjeta'`, `Currency`, `Icon`). Soft-delete only (`Archived`, restorable via `PUT`). Excluded from listings by default unless `?includeArchived=true`. |
| `budget` | `/budget` | Monthly spending limit per category. Unique index on `{Category, Month, Year}`. `GET /budget/status/:month/:year` reports `Spent`/`Remaining`/`Percent` against each budget. |
| `recurring` | `/recurring` | Templates for movements that repeat monthly (salary, rent, subscriptions). `POST /recurring/run` materializes due templates into real `Movement` documents, idempotently (see §6). |
| `report` | `/report` | Read-only analytics: spending by category, monthly income/expense trend, cashflow. No writes. |

**Known gap, currently being closed**: `Movement` does not yet reference `Account`. Every module above that touches money (`recurring`, `report`) was deliberately scoped to avoid that field until it lands — check `git log` / `tasks.json` for the slice that's adding it, since once merged, account balances and per-account cashflow become possible.

## 5. Conventions you must follow

These aren't style preferences — deviating breaks patterns other code (and other engineers, and future-you) relies on.

- **Model fields are PascalCase** (`Amount`, `Type`, `Category`), consistently across schema, interface, and query filters. This is intentional, not an oversight.
- **Services are pure static classes.** No instantiation, no DI, no `this` beyond `this.otherStaticMethod()`. Controllers call them directly: `await CategoryService.find(...)`.
- **Never call `res.json()` directly.** Always `successResponse(res, data, statusCode?)` / `errorResponse(res, message, statusCode?, errors?)` from `response.middleware.ts`. For delete endpoints, use `deletedResponse(res, id)`.
- **Delete endpoints check the service result and 404 if falsy** before responding — a resource that didn't exist must not silently report success.
- **Validators split required-on-create vs optional-on-update** using an `isPost` guard:
  ```ts
  const isPost = (_value: unknown, { req }: Meta) => req.method === 'POST';
  body('Name').if(isPost).notEmpty().withMessage('Name is required'),
  body('Name').optional().isString(),
  ```
  This lets `PUT` accept a partial body (only the fields being changed) while `POST` still requires everything. Every validator written after the `account` module follows this from the start — don't write a single unconditionally-required chain, it forces full-object PUTs and creates lost-update races between concurrent partial edits.
- **`checkKeys` whitelists every accepted body field.** Any key not in the list throws, caught as a 400. System-managed fields (e.g. `LastRunYearMonth` on `Recurring`) are deliberately excluded from the whitelist — never client-settable.
- **Pagination**: `toPagination(req.query)` from `controller.util.ts`, default page size 50, max 200. Don't reimplement this per-controller.
- **Route ordering**: literal path segments must be declared before `:param`-shaped routes on the same HTTP method and prefix (e.g. `GET /status/:month/:year` before `GET /:id`), or Express will misroute the literal as a param. Different HTTP methods on the same path don't collide (a `GET /:id` doesn't shadow a `POST /run`).
- **Soft-delete when other data will reference the entity** (accounts), hard-delete otherwise (categories, budgets, recurring templates). If you add soft-delete, also add the *listing filter* (exclude by default) and the *restore path* — a soft-delete that doesn't hide the record and can't be undone isn't actually a feature, it's a half-measure. This was a real bug caught in review on the `account` module.
- **Atomicity for multi-step writes**: this project has no MongoDB replica set, so multi-document transactions aren't assumed available. Where a two-step operation needs to not double-execute under concurrency or a mid-operation crash (see `RecurringService.run()`), use an atomic single-document compare-and-swap via `findOneAndUpdate` with a filter that only matches the "not yet claimed" state, and skip if the claim fails — not a read-then-write pair.

## 6. Task tracking — `tasks.json`

`tasks.json` at the repo root is the single source of truth for in-flight work. The skill `.claude/skills/task-tracker/SKILL.md` is **mandatory** to load before reading or modifying it — it defines the schema, valid enums (`assets/enums.md`), and the rules for updating `meta.stats` and `last_updated` on every change.

Important project-specific convention: **this file is a per-batch snapshot, not a cumulative backlog.** Once a batch of tasks is fully implemented *and merged into `dev`*, the entries get removed and the file resets to just the next active batch. Don't be surprised to see it shrink dramatically between sessions — that's intentional, not data loss. Full history lives in `git log` and the merged PRs, not in this file.

## 7. Testing

Vitest, colocated `*.test.ts` files next to what they test. The dominant pattern: mock the layer directly below (controllers mock their service, services mock their Mongoose model) using `vi.mock('../services/x.service', () => ({ default: { methodName: vi.fn(), ... } }))`, then `vi.mocked(X.method).mockResolvedValue(...)`.

Strict TDD has been the practice for all feature work in this repo's recent history: write the test first, confirm it fails for the right reason, implement, confirm green. This isn't just process theater — it's caught real bugs before they shipped (an idempotency race in `recurring.service.ts`, a null-dereference in `report.service.ts`'s category grouping).

## 8. Docs

`openapi.yaml` at the repo root is hand-written and is the source of truth for `GET /docs` (Swagger UI). It documents real, current behavior — including known quirks, when they exist — not aspirational behavior. Update it in the same change that changes an endpoint's contract.

`src/config/openapi.ts` loads and parses this file **synchronously at import time**. If the YAML has a structural error (duplicate keys, bad indentation), the server crashes on boot, not on first request — this has bitten a merge before (two `components:` blocks from a conflict resolution). If you're touching `openapi.yaml`, verify it parses (`node -e "require('js-yaml').load(require('fs').readFileSync('openapi.yaml','utf8'))"` or equivalent) before committing.

## 9. Git workflow

- Work happens on a branch per feature/phase, PR'd into `dev` (never commit directly to `dev`).
- Before committing non-trivial changes, run an independent code review of the diff (correctness bugs, cleanup, and — for anything touching auth/validation/data integrity — concurrency and edge cases). Fix what the review finds before pushing.
- Verify `npm run build`, `npm test`, and `npm run lint` all pass on the actual committed `HEAD`, not just what you think you staged — a staged-then-modified file can silently commit a stale version if you forget to re-`git add` it.
- PR descriptions should state what changed, what task(s) it completes, and any bug found/fixed along the way.

## 10. Where to look next

- `CLAUDE.md` — the terse version of §3–5 above, kept in sync as the canonical reference for AI coding agents working in this repo.
- `tasks.json` — what's actively in flight right now.
- `openapi.yaml` — the full, current API contract.
- `git log --oneline` — the real history; every phase and every review-fix round is a readable commit.
