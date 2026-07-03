# Tasks — Norte Mobile Rebrand

Decomposition of `proposal.md` + `design.md` + specs into ordered, checkbox-level
work. Strict TDD is active: every `.ts` unit below ships with its spec file
written first (RED), then the implementation (GREEN). Refactor only after green.

Legend: `[P]` = can run in parallel with sibling `[P]` tasks in the same phase.
Everything else is sequential within its phase. **Fase 0 is a hard gate** — no
Fase 1+ task starts until Fase 0's gate checklist passes.

---

## Fase 0 — Foundations (auth + tokens + config + build fix)

Satisfies: `specs/auth/spec.md` (all 5 requirements), `specs/config/spec.md`
(Environment-Based API URL), `specs/design-tokens/spec.md` (Clean Build, Norte
Design Tokens).

### 0.1 Build fix
- [x] Delete stale `src/styles.css` and `src/styles.css.map` (Sass-error build
  artifact). No spec — verified by `bun run build` succeeding at the gate.

### 0.2 Design tokens [P]
- [x] `src/styles/_tokens.scss` — `:root` dark tokens + `:root[data-theme='light']`
  override, per design ADR-5 (`--bg`, `--surface`, `--surface-2`, `--border`,
  `--text`, `--text-dim`, `--gold`, `--income`, `--expense`, `--font-display`,
  `--font-body`).
- [x] `src/styles/_fonts.scss` — self-hosted `@font-face` for Sora + Manrope
  (`woff2`, `font-display: swap`).
- [x] `src/assets/fonts/` — add the woff2 files referenced by `_fonts.scss`.
- [x] Modify `src/styles.scss` — `@use './styles/tokens'; @use './styles/fonts';`
  first, then existing bootstrap `@use`s; `body` reads `var(--bg)`/`var(--text)`/
  `var(--font-body)` instead of the literal `Roboto` stack.
- [x] Modify `angular.json` — add `src/assets/fonts` to the `build`/`test`
  `assets` array.
- No spec file for pure SCSS (no test runner target); satisfied at the Fase 2
  component specs and the Fase 0 gate's `bun run build`.

### 0.3 Environment config [P]
- [x] New `src/environments/environment.ts` — `{ production: true, apiUrl: 'http://localhost:3000' } as const`.
- [x] New `src/environments/environment.development.ts` — same shape, `production: false`.
- [x] Modify `angular.json` — `fileReplacements` under `build.configurations.development`
  swapping `environment.ts` → `environment.development.ts`.
- No spec file (config generation is declarative); verified via Fase 1's
  `MovementService` spec asserting the URL comes from `environment.apiUrl`.

### 0.4 Auth models
- [x] New `src/app/core/auth/models/auth.model.ts` — `ICredentials` (`Email`,
  `Password` — PascalCase per verified API), `ILoginResponse` (`token`,
  `expiresIn`). Flat interfaces, no `any`, per the typescript skill.

### 0.5 `TokenStorageService` (RED → GREEN)
- [x] RED: `src/app/core/auth/services/token-storage.service.spec.ts` — covers
  browser branch (mock/override `PLATFORM_ID` = browser, asserts
  `localStorage` read/write/clear) and server branch (`PLATFORM_ID` = server,
  asserts `getToken()` returns `null` and `setToken`/`clear` are no-ops, and
  that construction never throws).
- [x] GREEN: `src/app/core/auth/services/token-storage.service.ts` — per design
  ADR-1 exactly (`isPlatformBrowser(inject(PLATFORM_ID))` guard, `norte.token`
  key).
- Satisfies: `specs/auth/spec.md` → SSR-Safe Token Persistence.

### 0.6 `AuthService` (RED → GREEN)
- [x] RED: `src/app/core/auth/services/auth.service.spec.ts` — `login()` posts
  `ICredentials` to `${environment.apiUrl}/auth/login` via
  `HttpTestingController`; on success calls `TokenStorageService.setToken` and
  flips `isAuthenticated()` to `true`; on 401 leaves the signal `false` and no
  token stored; `logout()` clears the token and flips the signal to `false`.
- [x] GREEN: `src/app/core/auth/services/auth.service.ts` — `providedIn: 'root'`,
  injects `HttpClient` + `TokenStorageService`, exposes `isAuthenticated`
  (readonly signal) and `login`/`logout`.
- Satisfies: `specs/auth/spec.md` → Login (both scenarios).

### 0.7 `authInterceptor` (RED → GREEN)
- [x] RED: `src/app/core/auth/interceptors/auth.interceptor.spec.ts` — attaches
  `Authorization: Bearer <token>` to a non-public request when a token exists;
  omits the header for `/auth/login`, `/docs`, `/health`; **and** on a `401`
  response from any protected call, clears the stored token (via
  `TokenStorageService`) and navigates to `/login` (`Router`).
- [x] GREEN: `src/app/core/auth/interceptors/auth.interceptor.ts` — extends
  design ADR-2's snippet with a `catchError` branch that detects
  `HttpErrorResponse.status === 401`, calls `TokenStorageService.clear()` and
  `Router.navigateByUrl('/login')`, then rethrows.
- Satisfies: `specs/auth/spec.md` → Bearer Token Interceptor, 401 / Expired
  Token Handling. (Design ADR-2's code sample only shows the Bearer-attach
  half; the 401 branch is required by the spec and must be added here.)

### 0.8 `authGuard` (RED → GREEN)
- [x] RED: `src/app/core/auth/guards/auth.guard.spec.ts` — returns `true` when
  `AuthService.isAuthenticated()` is `true`; returns a `UrlTree` to `/login`
  when `false`.
- [x] GREEN: `src/app/core/auth/guards/auth.guard.ts` — per design ADR-3.
- Satisfies: `specs/auth/spec.md` → Route Guard.

### 0.9 Auth barrel
- [x] New `src/app/core/auth/index.ts` — re-export services, interceptor,
  guard, models.

### 0.10 `LoginComponent` (RED → GREEN)
- [x] RED: `src/app/components/login/login.component.spec.ts` — form invalid
  when email/password empty; valid submit calls `AuthService.login()` with
  form values; on success navigates to the authenticated home
  (`/records`); on 401 shows an error message and does not navigate.
- [x] GREEN: `src/app/components/login/login.component.ts` (+ `.html`, `.scss`)
  — standalone, `ReactiveFormsModule` via `NonNullableFormBuilder` (email +
  password controls, both `Validators.required`), injects `AuthService` +
  `Router`.
- [x] New `src/app/components/login/index.ts` (barrel), consistent with the
  codebase convention.
- Satisfies: `specs/auth/spec.md` → Login (UI half of both scenarios).

### 0.11 Wire interceptor + routes
- [x] Modify `src/app/app.config.ts` — `provideHttpClient(withFetch(),
  withInterceptors([authInterceptor]))`.
- [x] Modify `src/app/app.routes.ts` — restructure per design ADR-3: `/login`
  route outside the guard, `{ path: '', canActivateChild: [authGuard],
  children: MainContainerRoutes }`.
- No new spec — covered by 0.7/0.8 unit specs; routing behavior is exercised
  manually at the gate (`bun run start` smoke check optional, not required to
  pass CI).

### Fase 0 gate (blocking — do not start Fase 1 until this passes)
- [x] `bun run test` — full suite green (all specs above).
- [x] `bun run build` — completes with no Sass import errors (0.1) and no
  TypeScript errors.
- [x] Manual smoke: unauthenticated visit to `/records` redirects to `/login`;
  successful login reaches `/records` with a stored token.

---

## Fase 1 — Services / CRUD

Depends on: Fase 0 gate passed (needs `environment.apiUrl`, and app-level
`core/` now exists as a precedent). Satisfies: `specs/movement/spec.md` (Create,
Update, Delete, Filtered Get), `specs/accounts/spec.md` (List Categories, List
Accounts, Account Balance, Transfer — service half only, UI half is Fase 5).

> **Verified endpoints in play** (`api-reference.md`, overrides design.md's
> "assumption to verify" placeholders): `POST /movement`, **`PUT /movement/:id`**
> (not PATCH), `DELETE /movement/:id`, `GET|POST /movement/:startDate/:endDate`
> (POST body = optional `{ Type, Category, Account }` filters), `GET /category`,
> `GET /account`, `GET /account/:id/balance`, `POST /account/transfer`.

### 1.1 `MovementService` relocation + extension (sequential — gate for 1.6)
- [x] Move `movement.service.ts`, `movement.service.spec.ts`, `movement.model.ts`,
  `category.model.ts` from
  `records/pages/summary-by-month/core/{services,models}/` to new
  `records/core/{services,models}/` (per design ADR-4's concrete paths).
- [x] New `records/core/services/index.ts`, `records/core/models/index.ts`,
  `records/core/index.ts` barrels.
- [x] Temporary compat: `summary-by-month/core/index.ts` → `export * from
  '../../core';` (keeps existing imports resolving during transition).
- [x] RED (extend moved spec): `records/core/services/movement.service.spec.ts`
  — add cases for `getMovements()` (POST to
  `/movement/${startDate}/${endDate}` with `{Type, Category, Account}` body
  when any filter is set; plain GET when no filter given), `createMovement()`
  (`POST /movement`), `updateMovement()` (`PUT /movement/:id`),
  `deleteMovement()` (`DELETE /movement/:id`); assert `movementUrl` derives
  from `environment.apiUrl`, not a literal.
- [x] GREEN: extend `records/core/services/movement.service.ts` — read
  `environment.apiUrl`; add `getMovements(startDate: string, endDate: string,
  filter?: IMovementFilter)`, `createMovement(dto: ICreateMovement)`,
  `updateMovement(id: string, dto: Partial<ICreateMovement>)`,
  `deleteMovement(id: string)`.
- [x] New `records/core/models/movement.model.ts` additions: `IMovementFilter`
  (`Type?`, `Category?`, `Account?`), `ICreateMovement` (`Type`, `Amount`,
  `Category`, `Account`, `Date`, `Description?`, `Card?`).

### 1.2 Migration cleanup (sequential, after 1.1 green)
- [x] Modify `summary-by-month.component.ts` — import `MovementService` /
  `IMovement` / `ISummary` from the new `records/core` path instead of the old
  local `./core`.
- [x] Run `bun run test` scoped to `summary-by-month` + `movement.service.spec`
  — confirm green.
- [x] Remove the temporary compat re-export from
  `summary-by-month/core/index.ts` (delete the file if it now has no other
  exports, or trim it to whatever `summary-by-month` still legitimately owns).
  **Done in Fase 2** (commit `08d4489`), as deferred: `movement-card` and `movement-summary`
  still import through this barrel and aren't in scope this phase — removing
  it now would break two currently-working components. Fase 2's rebrand work
  should fix those two imports directly, then retire this barrel.

### 1.3 `CategoryService` [P]
- [x] RED: `src/app/core/reference/category/category.service.spec.ts` — `GET
  /category` on first `ensureLoaded()`; second call makes **no** second
  request (`HttpTestingController.expectNone` or single `expectOne`); signal
  populated with the response.
- [x] GREEN: `src/app/core/reference/category/category.service.ts` — signal
  cache per design ADR-8.
- [x] New `src/app/core/reference/category/category.model.ts` — `ICategory`
  (`Name`, `Description?`, `Type`, `Tag?`, `Icon?`, `_id?`), flat interface.
- Satisfies: `specs/accounts/spec.md` → List Categories.

### 1.4 `AccountService` [P]
- [x] RED: `src/app/core/reference/account/account.service.spec.ts` — `GET
  /account` fetch-once semantics (same pattern as 1.3); `getBalance(id)` → `GET
  /account/:id/balance`; `transfer(dto)` → same-account rejected client-side
  (no HTTP call), non-positive amount rejected client-side (no HTTP call),
  valid transfer → `POST /account/transfer`.
- [x] GREEN: `src/app/core/reference/account/account.service.ts` — signal
  cache + `getBalance` + `transfer` with pre-flight validation mirroring the
  backend (per `specs/accounts/spec.md` → Transfer Between Accounts).
- [x] New `src/app/core/reference/account/account.model.ts` — `IAccount`
  (`Name`, `Type`, `Currency`, `Icon?`, `_id?`), `ITransfer` (`From`, `To`,
  `Amount`, `Date?`, `Description?`).
- Satisfies: `specs/accounts/spec.md` → List Accounts, Account Balance,
  Transfer Between Accounts (service half).

### 1.5 Reference barrel
- [x] New `src/app/core/reference/index.ts` — re-export `CategoryService`,
  `AccountService`, and both model files.

### Fase 1 gate
- [x] `bun run test` — full suite green, including moved + extended
  `movement.service.spec.ts` and both new reference-service specs.
- [x] `bun run build` clean.

---

## Fase 2 — Visual rebrand

Depends on: Fase 0 gate (tokens exist). Independent of Fase 1 (no service
coupling) — **can run in parallel with Fase 1** if desired, though the
proposal's dependency diagram lists it after Fase 1; sequencing here follows
the diagram for review-ordering simplicity, not a technical blocker.
Satisfies: `specs/design-tokens/spec.md` → No Hardcoded Colors.

### 2.1 `movement-card` [P]
- [x] RED: extend `movement-card.component.spec.ts` — computed
  `background-color`/text color is **not** the literal `cadetblue` value
  (`rgb(95, 158, 160)`); assert it resolves to a `--` custom property instead.
- [x] GREEN: modify `movement-card.component.scss` — replace `cadetblue` (and
  any other raw literal) with `var(--surface)` / `var(--text)` / etc. per
  ADR-5 tokens.

### 2.2 `summary-by-month` [P]
- [x] RED: extend `summary-by-month.component.spec.ts` — smoke-asserts the
  root element's background/text resolve to token custom properties, not
  hardcoded values.
- [x] GREEN: modify `summary-by-month.component.scss` — apply `--bg`/`--text`/
  spacing tokens.

### 2.3 `movement-summary` [P]
- [x] RED: extend `movement-summary.component.spec.ts` — income/expense
  figures use `--income`/`--expense` token-driven classes, not hardcoded green/red.
- [x] GREEN: modify `movement-summary.component.scss` (and template class
  bindings if needed) — apply `--income`/`--expense`/`--surface` tokens.

### Fase 2 gate
- [x] `bun run test` green.
- [x] `rg cadetblue src/app` (or equivalent) returns no matches.

---

## Fase 3 — `movement-add`

Depends on: Fase 1 (`MovementService.createMovement`, `CategoryService`,
`AccountService`) + Fase 0 (tokens for styling, though styling is secondary
here). Satisfies: `specs/movement/spec.md` → movement-add Form (all 3
scenarios).

### 3.1 `MovementAddComponent` (RED → GREEN)
- [x] RED: extend `movement-add.component.spec.ts` — form invalid when
  Amount/Category/Account/Date missing or `Amount <= 0`; valid submit calls
  `MovementService.createMovement()` with the exact form-derived DTO; on
  success the form resets (or navigates back per product decision) and a
  success indicator renders; on service error (mocked `throwError`) an error
  message renders and the form value is preserved (not cleared).
- [x] GREEN: modify `movement-add.component.ts` — `NonNullableFormBuilder`
  group per design ADR-7 (`type`, `amount`, `category`, `account`, `date`,
  `description`); injects `MovementService`, `CategoryService`,
  `AccountService`; calls `ensureLoaded()` on both reference services in
  `ngOnInit`/constructor; binds `categories()`/`accounts()` signals in the
  template for the select options; `onSubmit()` calls `createMovement()`,
  handles success/error.
- [x] Modify `movement-add.component.html` — reactive form markup: type
  select (enum values), amount input, category select (bound to
  `categories()`), account select (bound to `accounts()`), date input,
  description textarea, submit button disabled when `form.invalid`, inline
  validation messages, success/error banners.
- [x] Modify `movement-add.component.scss` — token-based styling (ADR-5),
  mobile-first quick-add layout per the Norte Mobile capture-first pattern.

---

## Fase 4 — `movement-filter`

Depends on: Fase 1 (`MovementService.getMovements`, `CategoryService`,
`AccountService`) + Fase 3 optional (no hard coupling, listed after 3 per the
proposal's phase order). Satisfies: `specs/movement-filter/spec.md` (both
requirements).

### 4.1 `MovementFilterComponent` (RED → GREEN)
- [x] RED: extend `movement-filter.component.spec.ts` — emits a filter-changed
  output (`{ Type?, Category?, Account? }`) when the user changes any control,
  individually and combined; renders category/account options from the
  injected services' signals.
- [x] GREEN: modify `movement-filter.component.ts` — reactive filter form
  (type select, category select bound to `CategoryService.categories()`,
  account select bound to `AccountService.accounts()`); emits an `output<IMovementFilter>()`
  (`filterChange`) on every value change (or a "clear" affordance resetting
  to no filter).
- [x] Modify `movement-filter.component.html` — filter control markup, token
  styling.

### 4.2 Wire filter into `SummaryByMonthComponent` (sequential, after 4.1)
- [x] RED: extend `summary-by-month.component.spec.ts` — when
  `MovementFilterComponent` emits a filter, the component calls
  `MovementService.getMovements(startDate, endDate, filter)` for the current
  month's range and renders the returned list instead of the original
  `respMovements$.movements`; when the filter yields no matches, an explicit
  empty-state message renders (not a blank list) — per
  `specs/movement-filter/spec.md` → Empty Result State.
- [x] GREEN: modify `summary-by-month.component.ts` — hold a `filter` signal,
  compute the current month's `startDate`/`endDate`, react to
  `(filterChange)="onFilterChange($event)"` from `<app-movement-filter />` by
  calling `getMovements()` and updating a `movements` signal/observable the
  template renders from; template shows the empty-state block when the
  resolved list is empty.
- [x] Modify `summary-by-month.component.html` — bind `(filterChange)` on
  `<app-movement-filter />`; add the empty-state `@if` branch.

---

## Fase 5 — Cuentas feature

Depends on: Fase 1 (`AccountService` complete: list, balance, transfer) + Fase
0 (guard — Cuentas inherits `authGuard` automatically as a child of the
guarded shell, no extra guard work needed) + Fase 2 (tokens available for
styling). Satisfies: `specs/accounts/spec.md` → Cuentas Screen — List with
Balance, Cuentas Screen — Transfer UI.

### 5.1 `CuentasComponent` shell (sequential — gate for 5.2/5.3)
- [x] RED: `cuentas.component.spec.ts` — renders a `<router-outlet>` (smoke
  create test, following the `RecordsComponent` pattern).
- [x] GREEN: `cuentas.component.ts` (+ `.html`, `.scss`) — standalone, hosts
  `<router-outlet>`, per design ADR-9.
- [x] New `cuentas.routes.ts` — exports `CuentasRoutes` (`{ path: '',
  redirectTo: 'account-list', pathMatch: 'full' }`, `{ path: 'account-list',
  component: AccountListComponent }`).
- [x] New `cuentas/index.ts` barrel.
- [x] Modify `main-container.routes.ts` — add `{ path: 'cuentas', component:
  CuentasComponent, children: CuentasRoutes }` sibling to `records`, per
  design ADR-9.

### 5.2 `AccountListComponent` [P]
- [x] RED: `pages/account-list/account-list.component.spec.ts` — calls
  `AccountService.ensureLoaded()` on init; renders one row per account with
  name + current balance (fetched via `getBalance(id)` per account, or
  derived from the account payload if the backend returns balance inline —
  confirm against `GET /account` response shape during implementation and
  adjust the spec accordingly); renders empty state when the list is empty.
- [x] GREEN: `pages/account-list/account-list.component.ts` (+ `.html`,
  `.scss`) — binds `AccountService.accounts()`, resolves/display balances,
  token-based styling; hosts the entry point to open the transfer sheet
  (5.3).

### 5.3 `TransferSheetComponent` [P]
- [x] RED: `components/transfer-sheet/transfer-sheet.component.spec.ts` — form
  invalid when source/destination are the same account, or amount is
  non-positive (blocks submit client-side, mirroring `specs/accounts/spec.md`
  → Transfer Between Accounts); valid submit calls
  `AccountService.transfer()` with `{ From, To, Amount, Date?, Description?
  }`; on success emits a completion event the account list uses to refresh
  balances.
- [x] GREEN: `components/transfer-sheet/transfer-sheet.component.ts` (+
  `.html`, `.scss`) — `NonNullableFormBuilder` group (`from`, `to`, `amount`,
  `description?`), cross-field validator for `from !== to`, injects
  `AccountService`.

### 5.4 Wire transfer sheet into account list (sequential, after 5.2 + 5.3)
- [x] Modify `account-list.component.ts`/`.html` — open `transfer-sheet` (e.g.
  Angular Material bottom sheet/dialog, or a simple toggled panel — pick the
  lightest option consistent with `AngularMaterialModule` already used
  elsewhere in the codebase); on the sheet's completion event, re-call
  `AccountService.ensureLoaded()`'s underlying fetch (or a new
  `refresh()`/re-fetch method) so balances update per
  `specs/accounts/spec.md` → Successful transfer via UI.
- [x] Extend `account.service.spec.ts` / `account.service.ts` if a `refresh()`
  method is added (forces a re-fetch bypassing the `loaded` guard).

### Fase 5 gate
- [x] `bun run test` — full suite green.
- [x] `bun run build` clean.
- [x] Manual smoke: `/cuentas` unreachable without login (guard inherited);
  reachable and functional after login.

---

## Cross-cutting / final checklist (maps to proposal Definition of Done)

- [x] `bun run test` green across the whole suite (all phases). **Caveat**: 101
  total, 93 pass, 8 fail — all 8 are the pre-existing NG0908 zoneless-TestBed
  gap on files this change never touches (confirmed pre-existing at Fase 0,
  unchanged in nature/count through every subsequent phase). Out of scope by
  explicit orchestrator decision; tracked as a separate follow-up change.
- [x] `bun run build` clean, no Sass errors, no TS errors.
- [x] `rg cadetblue src/app` — no matches in real styling. **Caveat**: one hit
  is a test *description string* ("does not use the hardcoded cadetblue
  background...") in `movement-card.component.spec.ts`, not actual CSS.
- [x] `rg "http://localhost:3000" src/app/**/*.service.ts` — no matches outside
  `src/environments/*` (confirms Environment-Based API URL requirement).
- [x] `front-web` project directory untouched (diff check before merge) —
  confirmed never created.

---

## Review Workload Forecast

| Phase | Rough changed/added lines | Notes |
|---|---|---|
| 0 — Foundations (auth + tokens + config + build fix) | ~600–700 | Largest phase: 4 new services/guard/interceptor + specs, new LoginComponent + spec, tokens/fonts SCSS, environments, routing/config wiring |
| 1 — Services / CRUD | ~380–450 | MovementService relocation+extension+spec, 2 new reference services + models + specs |
| 2 — Visual rebrand | ~120–180 | 3 components, mostly SCSS + small spec assertions |
| 3 — movement-add | ~300–380 | Real reactive form + validity-matrix spec |
| 4 — movement-filter | ~250–320 | Real filter form + summary-by-month wiring + spec |
| 5 — Cuentas | ~450–560 | New section: shell + 2 components (list, transfer sheet) + routes + specs |
| **Total** | **~2,100–2,600** | |

- **Chained PRs recommended: Yes** — total estimate is roughly 5–6x the
  400-line single-PR budget, and the phases have a real dependency chain
  (Fase 0 gates everything), which maps naturally onto a chained-PR sequence
  (one PR per phase, or per phase-pair for 2+3 and 4+5 if a reviewer wants
  fewer, larger checkpoints).
- **400-line budget risk: High** — even the smallest phase (2) is plausible
  within budget alone, but every other phase individually exceeds or
  approaches 400 lines, and Fase 0 alone is already ~1.5–1.75x the budget.
- **Decision needed before apply: Yes** — this must be split into chained PRs
  (or explicitly exempted with `size:exception` per phase) before
  `sdd-apply` starts. Recommend chaining strictly in phase order (0 → 1 → 2 →
  3 → 4 → 5) since Fase 0 is a hard technical gate and Fases 2/3/4 depend on
  Fase 1's services; Fase 5 depends on Fase 1's `AccountService` and can be
  its own final PR.
