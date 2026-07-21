# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 19 (standalone components, zoneless change detection) SSR frontend for a personal finance app. Package manager is **bun** (see `bun.lockb`, `angular.json` → `cli.packageManager`), not npm/yarn — use `bun install` / `bun run <script>` / `bunx`.

## Commands

- `bun run start` — dev server at `http://localhost:4200` (`ng serve`)
- `bun run build` — production build to `dist/front` (`ng build`)
- `bun run watch` — dev build with `--watch`
- `bun run test` — unit tests via Karma/Jasmine (`ng test`)
- Single test file: `ng test --include='**/movement.service.spec.ts'`
- `bun run serve:ssr:front` — run the built SSR server (`node dist/front/server/server.mjs`), requires `bun run build` first

There is no lint script configured; style conventions come from `.editorconfig` (2-space indent, single quotes in `.ts`).

## Architecture

**Feature-folder routing.** Each route level owns a `*.routes.ts` file and a component that hosts a `<router-outlet>` for its children:
- `app.routes.ts` → `main-container.routes.ts` (top-level sections: `records`, `expenses`) → `records.routes.ts` (`summary-by-month`, `movement/add`), etc.
- Follow this pattern when adding a new page: create the component under `pages/<name>/`, then wire it into the parent's `*.routes.ts`.

**Barrel exports.** Nearly every directory has an `index.ts` re-exporting its public members (components, models, services, routes). Import from the nearest barrel (e.g. `from './core'`, `from './components'`) rather than deep-importing a sibling file directly — this matches existing usage throughout the codebase.

**Per-feature `core/` module.** Larger pages (e.g. `summary-by-month`) keep a local `core/` folder with `models/` and `services/`, scoped to that feature rather than shared globally. `MovementService` and `IMovement`/`ISummary` types live under `records/pages/summary-by-month/core/`. There's also a per-feature `angular-material.module.ts` re-exporting the Material modules that feature needs.

**Components are standalone** (Angular 19 default) — no `NgModule` declarations; each `@Component` lists its own `imports`.

**SSR + hydration + zoneless.** `app.config.ts` wires `provideClientHydration()`, `provideExperimentalZonelessChangeDetection()`, and `provideHttpClient(withFetch())`. `app.config.server.ts` adds `provideServerRendering()` for the server bundle. The app is prerendered (`angular.json` build options: `"prerender": true`, `"ssr": { "entry": "server.ts" }`). Keep this in mind when writing components that touch browser-only APIs — guard them appropriately for the server-rendering pass.

**API base URL is hardcoded** in services (e.g. `MovementService.mainUrl = 'http://localhost:3000'`) — there's no environment-based config yet.
