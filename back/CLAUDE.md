# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start with hot reload (ts-node-dev)
npm run build    # compile TypeScript → dist/
npm start        # run compiled output (requires build first)
```

No test runner is configured yet.

## Environment Variables

Required in `.env`:
```
MONGO_CONN_STR=<mongodb connection string>
MONGO_DB_NAME=<database name>
PORT=<port, defaults to 80>
```

## Architecture

Express + TypeScript + Mongoose REST API. Entry point is `src/index.ts`, which connects to MongoDB then starts the server.

All routes are aggregated in `src/_routes.ts` and mounted at `/`. Each domain feature lives under `src/modules/` with a strict five-layer structure:

```
src/modules/
  models/       → Mongoose Schema + model
  interfaces/   → TypeScript interface extending Document
  validators/   → express-validator chains (used as route middleware)
  controllers/  → async request handlers calling services
  services/     → static class with all Mongoose operations
  routes/       → Express Router wiring validators → controllers
```

**Request flow**: Route → Validator middleware → Controller → Service → MongoDB

### Key conventions

- **Model field names use PascalCase** (`Amount`, `Date`, `Type`, `Category`) — this is intentional and consistent across schemas, interfaces, and query filters.
- **Services are pure static classes** — no instantiation, no DI; controllers call them directly.
- **Response shape is centralized** in `src/middlewares/responose.middleware.ts` via `successResponse` / `errorResponse` — every controller uses these, never `res.json()` directly.
- **Validation is split**: `src/interceptors/validator.interceptor.ts` provides `validateContext` and `validateSchema` (functional) plus a `Validator` class with sequential validation (stops on first error). Route validators in `modules/validators/` compose these helpers.
- `TypeMovement` enum (`ingreso` / `egreso`) is the canonical type discriminator for movement records.

### Adding a new module

Follow the existing `movement` or `category` pattern: create interface → model → service → validators → controller → route → register in `src/_routes.ts`.

## Task Management

All project work is tracked in `tasks.json` at the root. The skill `.claude/skills/task-tracker/SKILL.md` is mandatory — load it before reading or modifying any task.

- `tasks.json` is the single source of truth for task state
- `readme-tasks.md` documents the schema and dependency graph
- Never update a task without recalculating `meta` counters and `last_updated`
