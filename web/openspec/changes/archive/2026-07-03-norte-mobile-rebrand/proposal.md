# Rebrand the mobile app to "Norte" and make it work against the real API

Turn the existing `front/` Angular app into the capture-first "Norte Mobile" experience: apply the approved Norte design system, wire it to the real authenticated backend, and complete the stubbed movement and account flows. Today the app looks like a scaffold (hardcoded `cadetblue`, no tokens), can't authenticate (no login exists, yet every data endpoint needs a Bearer token), and its core screens (`movement-add`, `movement-filter`) are `<p>works!</p>` stubs. This change closes that gap for the mobile app only.

## Problem

- **The app cannot talk to the real API.** Every backend route except `POST /auth/login`, `/docs/*`, and `/health` requires `Authorization: Bearer <token>`. The frontend has **no login, no AuthService, no interceptor, no guard** — so nothing beyond the currently-mocked summary can function.
- **Core screens are stubs.** `movement-add` and `movement-filter` render placeholder markup with empty classes. `MovementService` exposes only `getMovementsByMonth` — no create/update/delete, no filtered reads.
- **No design system.** The UI uses a hardcoded `cadetblue` background and has zero design tokens, despite an approved Norte brand kit (dual-mode tokens, compass logo, Sora+Manrope type).
- **Config is hardcoded.** The API URL lives as a literal in `MovementService`; there is no `src/environments/`.
- **Broken build artifact.** `src/styles.css` carries a Sass import error from a build run without `bun install`.

## Why now

The Norte brand, voice, and the "Norte Mobile" captura-first UX are **already designed and approved** (3 published artifacts from a prior session). The reference mockup is settled: the home screen is a quick-add capture form, not a dashboard. With the design locked and the backend stable at 34 endpoints across 8 domains, the only thing standing between the app and real use is implementation — and the auth gap makes that implementation urgent, because without it the app is non-functional against production data.

## Scope

### In scope — the existing `front/` app only

| Phase | Deliverable |
|-------|-------------|
| **0 — Foundations** | Fix `src/styles.css` Sass error; Norte design tokens as CSS custom properties (light/dark); `src/environments/` config (API URL out of the service); **auth**: login screen + `AuthService` + HTTP interceptor (Bearer) + route guard |
| **1 — Services / CRUD** | Extend `MovementService` (create / update / delete / filtered get); new `CategoryService`; new `AccountService` (list / balance / transfer) |
| **2 — Visual rebrand** | Apply Norte tokens to `movement-card`, `summary-by-month`, `movement-summary`; remove `cadetblue` |
| **3 — `movement-add`** | Real reactive form (type, amount, category, account, date, description) per the Norte Mobile quick-add pattern |
| **4 — `movement-filter`** | Real filters (type / category / account) |
| **5 — Cuentas feature** | New screen: account list with balance + transfer sheet |

> **Note on auth:** Fase 0 auth was **not** in the original mockups. Exploration surfaced it as a hard prerequisite — it is a non-negotiable foundation, not an optional add-on.

### Out of scope (explicit)

- **The separate `front-web` project** ("Norte Web" decisions dashboard). This is an explicitly deferred, separate future change — do **not** scaffold it here.
- **Reports and budgets UI.** Per the Norte Mobile design, these live in Norte Web. The "Más" tab only notes their absence.
- Backend changes of any kind (the API is treated as fixed).
- Multi-user / roles (backend is single-user by design).

## Proposed approach

Sequential, foundation-first. Fase 0 unblocks everything: without auth and tokens, later phases have nothing real to render or call. Fases 1–5 then layer services, visuals, and screens on top.

```
Fase 0 (auth + tokens + config + build fix)   ← hard prerequisite
   └─> Fase 1 (services / CRUD)
          └─> Fase 2 (visual rebrand)
          └─> Fase 3 (movement-add form)
          └─> Fase 4 (movement-filter)
          └─> Fase 5 (Cuentas)
```

Each phase follows the codebase's existing conventions: feature-folder routing (`*.routes.ts` per level), barrel exports, per-feature `core/` for models/services, standalone components. Tests are written **alongside each component** (Strict TDD is active).

## Key risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Auth gap** | Nothing works without it — highest risk in the change | Front-load in Fase 0; treat login + interceptor + guard as the gate for all later phases |
| **No linter** | Style/token regressions won't be caught automatically | Rely on `.editorconfig` + reviewer discipline; centralize tokens so drift is visible |
| **Strict TDD overhead** | Every component needs a spec written with it | Budget for spec-first per Angular convention; `bun run test` is the gate |
| **Hardcoded config today** | Moving the API URL can break the working summary screen | Introduce `environments/` in Fase 0 and migrate the one existing service carefully |
| **SSR / zoneless constraints** | Browser-only APIs (auth token storage) can break prerender | Guard browser-only access for the server-rendering pass |

## Definition of done

- [ ] User can log in; a JWT is stored and attached to every API call via interceptor; protected routes are guarded.
- [ ] `src/styles.css` builds clean; Norte design tokens exist as CSS custom properties (light/dark) and `cadetblue` is gone.
- [ ] API base URL comes from `src/environments/`, not a service literal.
- [ ] `MovementService` supports create / update / delete / filtered get; `CategoryService` and `AccountService` exist and are wired.
- [ ] `movement-add` is a working reactive form that creates real movements.
- [ ] `movement-filter` filters the list by type / category / account.
- [ ] Cuentas screen lists accounts with balances and supports transfer.
- [ ] Norte tokens applied to `movement-card`, `summary-by-month`, `movement-summary`.
- [ ] Each new/changed component ships with a passing spec (`bun run test` green).
- [ ] `front-web` remains untouched and unscaffolded.

## Next step

Proceed to `sdd-spec` and `sdd-design` (they can run in parallel off this proposal).
