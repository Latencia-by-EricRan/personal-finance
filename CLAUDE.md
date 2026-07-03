# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace layout

This directory is **not** itself a git repository — it's a parent folder holding two independent, separately-versioned projects. Each has its own `.git`, `CLAUDE.md`, and dev workflow:

- **`back/`** — Express + TypeScript + MongoDB REST API. See `back/CLAUDE.md` (terse reference) and `back/ONBOARD.md` (comprehensive, most up-to-date source on testing/conventions/git workflow).
- **`front/`** — Angular 19 SSR web app. See `front/CLAUDE.md` (thorough and current).

Always `cd` into the relevant sub-project before running commands — there is no root `package.json` and no unified build/test/lint across both.

## Running both together

The backend must be up before the frontend, since the frontend calls a hardcoded `http://localhost:3000` (no environment-based API config yet):

```bash
cd back && ./start-dev.sh   # bootstraps Docker+Mongo+seed if needed, serves API on :3000
cd front && ./start-dev.sh  # bun install if needed, ng serve on :4200
```

## back/ — quick reference

Layered/modular architecture: each domain feature under `src/modules/` (`auth`, `movement`, `category`, `account`, `budget`, `recurring`, `report`) follows `models/ → interfaces/ → validators/ → controllers/ → services/ → routes/`, request flow `Route → Validator → Controller → Service → MongoDB`. Services are static classes, no DI. Cross-cutting code lives in `src/middlewares/`, `src/interceptors/`, `src/utils/`, `src/config/`, `src/environments/`.

```bash
npm install
npm run dev              # ts-node-dev, hot reload
npm run build && npm start
npm test                 # vitest run
npm run test:watch
npx vitest run path/to/file.test.ts   # single test file
npx vitest run -t "test name"          # single test by name
npm run lint / lint:fix / format / format:check
```

Non-obvious conventions:
- Mongoose model fields are intentionally **PascalCase** (`Amount`, `Date`, `Type`, `Category`) — do not "fix" to camelCase.
- Strict TDD is the established practice: write the failing test first.
- Vitest convention: mock the layer directly below (controllers mock services, services mock the Mongoose model).
- `tasks.json` at the `back/` root is the mandatory single source of truth for task tracking, governed by the `task-tracker` skill (`back/.claude/skills/task-tracker/SKILL.md`) — load it before touching tasks. It's a per-batch snapshot, not a full backlog.
- `back/AGENTS.md` tracks known bugs (mass-assignment risk, `populate()` no-op, missing `next(error)`, unreachable route) meant to be fixed via `tasks.json`, not worked around ad hoc.
- Note: `back/CLAUDE.md` and `back/AGENTS.md` both currently claim "no test runner configured" — that's stale; `npm test`/`npm run lint` are wired and working per `package.json`.

## front/ — quick reference

Angular 19, SSR + hydration + zoneless change detection, **standalone components only** (no NgModules). Feature-folder routing: `app.routes.ts` → `main-container.routes.ts` (top-level sections `records`, `expenses`) → nested `*.routes.ts` per section. Larger features keep a local `core/` (models + services scoped to that feature); there's also an app-wide `core/` for auth (guards/interceptors/models/services) and shared reference data (account, category). Nearly every directory exports via a barrel `index.ts` — import through the nearest barrel, not deep sibling paths. Styling: Angular Material + Bootstrap + SCSS.

Package manager is **bun**, not npm/yarn:

```bash
bun install
bun run start                          # ng serve, http://localhost:4200
bun run build                          # dist/front, prerendered + SSR
bun run watch
bun run serve:ssr:front                # run built SSR server (needs build first)
bun run test                           # Karma/Jasmine
ng test --include='**/movement.service.spec.ts'   # single test file
```

Non-obvious conventions:
- No lint script configured; style comes from `.editorconfig` (2-space indent, single quotes in `.ts`).
- SSR + hydration + zoneless are wired in `app.config.ts`/`app.config.server.ts` — guard any browser-only API usage since components render server-side too.
- API base URLs are hardcoded per-service (e.g. `MovementService.mainUrl = 'http://localhost:3000'`) — don't assume `environment.ts` drives the API URL.