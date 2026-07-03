# SDD Init — personal-finance-back

_Generated: 2026-06-23 — Updated: 2026-06-23_

## Project

| Field | Value |
|---|---|
| Name | personal-finance-back |
| Workspace | `/Users/ericrangel/WebstormProjects/PersonalFinance/back` |
| Language | TypeScript 5.6 |
| Runtime | Node.js |
| Package manager | npm |

## Stack

| Layer | Technology | Version |
|---|---|---|
| HTTP framework | Express | ^4.21.1 |
| ODM | Mongoose | ^8.7.3 |
| Validation | express-validator | ^7.2.0 |
| Env config | dotenv | ^16.4.5 |
| Dev runtime | ts-node-dev | ^2.0.0 |
| Type definitions | @types/express, @types/node | latest |

## Architecture

**Pattern**: Layered / screaming architecture with per-domain five-layer modules.

```
src/
  index.ts              → entry point (DB connect → server start)
  _routes.ts            → aggregates all module routes, mounted at /
  config/               → env/db config
  interceptors/         → validateContext, validateSchema, Validator class
  middlewares/          → successResponse / errorResponse (centralized response shape)
  utils/                → shared utilities
  modules/
    controllers/        → async handlers, call services
    interfaces/         → TypeScript interfaces extending Document
    models/             → Mongoose Schema + model
    routes/             → Express Router wiring validators → controllers
    services/           → static classes with all Mongoose operations
    validators/         → express-validator chains (route middleware)
```

**Request flow**: Route → Validator middleware → Controller → Service → MongoDB

## Key Conventions

- **Model field names**: PascalCase (`Amount`, `Date`, `Type`, `Category`) — intentional, consistent across schemas, interfaces, and query filters
- **Services**: pure static classes — no instantiation, no DI
- **Response shape**: always via `successResponse` / `errorResponse` from `src/middlewares/responose.middleware.ts`; never `res.json()` directly
- **Type discriminator**: `TypeMovement` enum with values `ingreso` / `egreso`
- **Validation approach**: `validateContext` and `validateSchema` (functional) + `Validator` class (sequential, stops on first error)

## Testing Capabilities

| Field | Value |
|---|---|
| Test runner | **None** |
| Test command | `npm test` (exits with error — placeholder only) |
| Coverage tooling | None |
| Strict TDD mode | **false** |

> No test infrastructure is configured. `npm test` is a placeholder that exits 1.
> Adding a test runner is a prerequisite before Strict TDD can be enabled.

## Task Management

- Tasks tracked in `tasks.json` at workspace root
- Schema documented in `readme-tasks.md`
- Skill: `.claude/skills/task-tracker/SKILL.md` (mandatory before reading/modifying tasks)

## Commands

```bash
npm run dev    # start with hot reload (ts-node-dev)
npm run build  # compile TypeScript → dist/
npm start      # run compiled output (requires build first)
```

## Environment Variables

Required in `.env`:
```
MONGO_CONN_STR=<mongodb connection string>
MONGO_DB_NAME=<database name>
PORT=<port, defaults to 80>
```

## SDD Session Configuration

| Preference | Value |
|---|---|
| Execution mode | interactive |
| Artifact store | hybrid (Engram + OpenSpec) |
| PR strategy | ask-always |
| Review budget | 400 lines |
