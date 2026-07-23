# Repository Guidelines

## Project Structure & Module Organization

This monorepo has two independent applications:

- `back/` — Express + TypeScript + MongoDB REST API on `:3000`.
- `web/` — Angular 19 SSR client on `:4200`.

Backend source lives in `back/src/`. Domain code is under `back/src/contexts/`, with legacy support in `back/src/modules/`. Shared utilities, middleware, config, and test helpers live in nearby support folders. Backend e2e tests live in `back/src/e2e/`.

Frontend source lives in `web/src/app/`; app-wide services are in `core/`, reusable UI in `components/`, styles in `web/src/styles/`, and assets in `web/src/assets/`.

## Build, Test, and Development Commands

- `./start-dev.sh up` — start the containerized MongoDB, backend, and web stack.
- `./start-dev.sh dev` — start the hot-reload Docker dev stack.
- `cd back && npm run dev` — run API hot reload.
- `cd back && npm run build && npm start` — run the compiled backend.
- `cd back && npm test` — run backend Vitest tests.
- `cd web && bun install && bun run start` — serve Angular.
- `cd web && bun run build` — build the Angular SSR app.
- `cd web && bun run test` — run frontend Karma/Jasmine tests.

## Coding Style & Naming Conventions

Use TypeScript throughout. Frontend `.editorconfig` enforces spaces, 2-space indentation, final newlines, and single quotes. Backend formatting uses Prettier and ESLint: `cd back && npm run format:check && npm run lint`.

Backend Mongo/Mongoose fields intentionally use PascalCase. Do not casually rename persisted fields to camelCase. Prefer existing Angular barrels.

## Testing Guidelines

Backend tests use Vitest, Supertest, and MongoDB Memory Server. Name files `*.test.ts` or `*.e2e.test.ts`; run focused tests with `npx vitest run path/to/file.test.ts`. Frontend specs use Karma/Jasmine and `*.spec.ts`.

Strict TDD is expected: add or update the failing test before implementation.

## Commit & Pull Request Guidelines

Use conventional commits, for example `fix: correct CORS origin port` or `feat: add context-aware API base URL token`. Never add AI attribution or `Co-Authored-By`.

Branch from `qa` and target PRs to `qa`. Use `<type>/<scope>/<short-description>`, such as `feature/back/budget-summary`. Hotfixes branch from `main` and must be brought back into `qa`.

PRs should include a clear summary, test evidence, linked issue when relevant, and screenshots for UI changes.

## Security & Configuration Tips

Do not commit secrets. Generate `back/.env` locally with `node back/scripts/onboarding.mjs --setup`. The web app expects the backend on `http://localhost:3000`, so start the API before testing frontend flows.
