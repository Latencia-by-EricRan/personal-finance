# AGENTS.md — personal-finance-back

> Agent ramp-up guide. Every line answers: "Would an agent miss this without help?"

## Commands

```bash
npm run dev          # ts-node-dev with hot reload (runs npm i first — intentional but slow)
npm run build        # tsc → dist/
npm start            # node dist/index.js (requires build first)
```

**No test runner is configured.** `npm test` exits with code 1. Do not assume tests pass or exist.

## Required `.env` variables

```
MONGO_CONN_STR=<mongodb connection string>
MONGO_DB_NAME=<database name>
PORT=<port, defaults to 80>
AUTH_ROOT_EMAIL=<single-user login email>
AUTH_ROOT_PASSWORD=<single-user plaintext password — hashed internally at startup>
```

Use `.env.example` as the template. Never commit `.env`.

## Architecture

Entry point: `src/index.ts` → connects MongoDB → starts Express.  
All routes aggregated in `src/_routes.ts`, mounted at `/`.

**Request flow:** `Route → Validator middleware → Controller → Service → MongoDB`

```
src/modules/
  controllers/   async handlers, call services directly
  interfaces/    TypeScript interfaces (some extend Document — known tech debt)
  models/        Mongoose Schema + model
  routes/        Express Router, wires validators → controllers
  services/      static classes with all Mongoose operations
  validators/    express-validator chains used as route middleware
```

Non-module shared code:
- `src/middlewares/responose.middleware.ts` — **note the typo in the filename** (`responose`). All controllers import from this path. Do not rename without updating every import.
- `src/interceptors/validator.interceptor.ts` — `validate` helper used in validators; `Validator` class and standalone functions are dead code.

## Critical conventions

- **Model field names are PascalCase** (`Amount`, `Date`, `Type`, `Category`) — intentional and consistent in schemas, interfaces, query filters, and body validators. Do not convert to camelCase.
- **`TypeMovement` enum**: `'ingreso'` | `'egreso'` — the canonical discriminator for movement records.
- **All responses go through `successResponse` / `errorResponse`** from the response middleware. Never call `res.json()` directly.
- **Auth is single-user JWT** — credentials live in `.env` (`AUTH_ROOT_EMAIL` + `AUTH_ROOT_PASSWORD`, both plaintext; the app hashes the password internally at config-load time). `POST /auth/login` issues the token; the `authenticate` middleware guards protected modules.

## Known bugs — do not workaround, fix from tasks.json

High-priority bugs already documented in `tasks.json` that affect correctness:

| ID | Impact |
|----|--------|
| DB-01 | `Category` field is `String` with `ref` — `populate()` silently does nothing |
| DB-02 | `findByIdAndUpdate` missing `{ new: true, runValidators: true }` — returns old doc, skips validation |
| ERR-02 | Validators call `throw error` instead of `next(error)` — can crash process in Express 4 |
| VAL-03 | Missing `return` after `next(error)` in `addUpdateValidator` — double `next()` call |
| ROUTE-01 | `GET /:month/:year` shadows `GET /:startDate/:endDate` — second route is unreachable |
| SEC-04 | `req.body` keys spread directly into Mongoose filter — mass-assignment risk |

Before implementing any feature that touches these areas, check the task status in `tasks.json` first.

## Task management

All work is tracked in `tasks.json` at the repo root. The skill `.claude/skills/task-tracker/SKILL.md` is **mandatory** — load it before reading or modifying any task.

- `tasks.json` is the single source of truth for task state.
- Always recalculate `meta` counters and update `last_updated` after any status change.

## TypeScript gotchas

- `tsconfig.json` has `strict: true` but the codebase bypasses it with `any` in most catch blocks and response types. Match the existing pattern or tighten it — do not silently introduce new `any` uses.
- `@types/mongoose@^5.x` is installed but Mongoose 8 ships its own types — both coexist. Known type conflict (TYPE-02 in tasks.json).
- `scripts/` is excluded from `tsc` compilation (`tsconfig.json` `exclude`). Scripts run via `ts-node` directly.

## What does not exist yet

- No linter (ESLint) or formatter (Prettier)
- No tests or test runner
- No global Express error middleware (`app.use((err, req, res, next) => ...)`)
- No pagination on list endpoints (`find()` returns all documents)
- No HTTP security hardening (helmet, CORS, rate-limit, body-size limit)
