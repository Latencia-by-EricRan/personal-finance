# Technical Design — Norte Mobile Rebrand

How to build the six phases from the proposal against the existing Angular 19
standalone/zoneless SSR app. This document settles the HOW (architecture,
boundaries, file placement, data flow). It does not re-open the phase breakdown
or scope — those are settled in `proposal.md`.

## At a glance

| # | Decision | Choice |
|---|----------|--------|
| 1 | Token storage under SSR | Injectable `TokenStorageService` guarded by `isPlatformBrowser(PLATFORM_ID)`; no-op on server |
| 2 | HTTP interceptor | Functional `HttpInterceptorFn` via `withInterceptors([...])` |
| 3 | Route guard | Functional `CanActivateFn` applied to the guarded shell in `app.routes.ts` |
| 4 | Service/model homes | New app-level `src/app/core/` (auth + reference data); `MovementService` relocated to `records/core/` |
| 5 | Design tokens | `src/styles/_tokens.scss` partial `@use`d into `styles.scss`; self-hosted `@font-face` |
| 6 | Environment config | Standard `src/environments/` + `angular.json` `fileReplacements` |
| 7 | movement-add form | Typed `ReactiveFormsModule` via `NonNullableFormBuilder` |
| 8 | Category/Account sharing | Signal-backed cache inside each `root`-provided service (fetch-once) |
| 9 | Cuentas routing | New top-level section in `main-container.routes.ts`, sibling to `records` |

## Architecture approach

**Pattern:** feature-folder + per-feature `core/`, extended with a single new
**app-level `src/app/core/`** for genuinely cross-cutting concerns (auth and
reference data). Everything else stays standalone, barrel-exported, and
signal-first to match the zoneless runtime.

**Layering (top to bottom):**

```
Routing shell (app.routes.ts)
  ├─ /login            → LoginComponent            (public, unguarded)
  └─ [] canActivate    → MainContainerRoutes       (guarded shell)
        ├─ /records    → summary | movement/add | movement-filter
        └─ /cuentas    → account-list (+ transfer sheet)   [NEW section]

Presentational + container components (standalone, signals)
        │ inject
        ▼
Services (providedIn: 'root', signal-backed caches)
  app-level core/auth      → AuthService, TokenStorageService
  app-level core/reference → CategoryService, AccountService
  records/core             → MovementService (extended: CRUD + filtered get)
        │ HttpClient (withFetch) + authInterceptor
        ▼
Real backend API (environment.apiUrl) — treated as FIXED
```

**Why an app-level `core/` now:** the codebase convention is per-page `core/`,
which works while a concern lives inside one page. Auth is app-wide, and
account/category reference data is consumed by three `records` pages **and** the
new `cuentas` section — it crosses top-level sections. Forcing cross-section
concerns into one page's `core/` would create sibling deep-imports (exactly what
the barrel convention exists to avoid). An app-level `core/` is the idiomatic
Angular home for this and is the smallest structure that contains all consumers.

---

## ADR-1 — Auth token storage under SSR + zoneless

**Decision:** Introduce an injectable `TokenStorageService` (`providedIn: 'root'`)
that wraps `localStorage` and guards every access with
`isPlatformBrowser(inject(PLATFORM_ID))`. On the server-rendering pass it is a
silent no-op: `getToken()` returns `null`, `setToken()`/`clear()` do nothing.

```typescript
// src/app/core/auth/services/token-storage.service.ts
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private static readonly KEY = 'norte.token';

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TokenStorageService.KEY);
  }
  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(TokenStorageService.KEY, token);
  }
  clear(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(TokenStorageService.KEY);
  }
}
```

**Rationale:** the app is prerendered (`prerender: true`, `ssr.entry`), so any
direct `localStorage`/`window` reference during construction crashes the build.
A single guarded abstraction keeps every browser-only access in one auditable
place; the interceptor, guard, and `AuthService` all depend on the abstraction,
never on `localStorage` directly. This is also the seam that makes the services
testable without a DOM.

**Consequences:** during prerender the user is treated as unauthenticated;
guarded routes resolve on the client after hydration. That is acceptable — this
is a private app with no meaningful pre-rendered protected content, and the
login screen is the sensible prerender output for a cold visitor.

**Rejected alternatives:**
- *Direct `localStorage` in `AuthService`* — crashes the prerender pass; scatters
  browser coupling.
- *Cookie-based storage* — the backend issues a Bearer token, not a session
  cookie; cookies would need SSR request forwarding the current architecture
  doesn't have. Out of proportion for a single-user app.
- *In-memory only (signal, no persistence)* — loses the session on refresh; poor
  UX for the primary daily-use device.

---

## ADR-2 — HTTP interceptor shape

**Decision:** Functional interceptor (`HttpInterceptorFn`) named `authInterceptor`,
registered through `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`
in `app.config.ts`.

```typescript
// src/app/core/auth/interceptors/auth.interceptor.ts
const PUBLIC_PATHS = ['/auth/login', '/docs', '/health'] as const;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublic = PUBLIC_PATHS.some((p) => req.url.includes(p));
  if (isPublic) return next(req);

  const token = inject(TokenStorageService).getToken();
  if (!token) return next(req);

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
```

**Rationale:** functional interceptors are the Angular 15+/19 idiom and match
this codebase's standalone-everywhere posture (no `NgModule`, no
`HTTP_INTERCEPTORS` multi-provider). They use `inject()` inside the DI context,
compose cleanly, and are trivial to unit-test with `HttpTestingController`. The
public-path allowlist keeps `POST /auth/login`, `/docs/*`, and `/health`
token-free exactly as the backend expects.

**Rejected alternatives:**
- *Class-based `HttpInterceptor` + `HTTP_INTERCEPTORS`* — the legacy DI-token
  path; verbose and stylistically inconsistent with the standalone codebase.
- *Attaching the header manually per-service call* — duplicated, error-prone,
  and impossible to keep in sync across four services.

---

## ADR-3 — Route guard shape

**Decision:** Functional guard (`CanActivateFn`) named `authGuard`, applied to the
guarded shell branch of `app.routes.ts`. It reads `AuthService.isAuthenticated()`
(a signal) and, if false, redirects to `/login` via an injected `Router`
returning a `UrlTree`.

```typescript
// src/app/core/auth/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
```

**app.routes.ts restructure** — login must live *outside* the guarded shell:

```typescript
export const routes: Routes = [
  { path: 'login', loadComponent: () => import(...).then(m => m.LoginComponent) },
  { path: '', canActivateChild: [authGuard], children: MainContainerRoutes },
];
```

**Rationale:** `CanActivateFn` is the Angular 19 idiom and mirrors ADR-2's
functional style. Applying `canActivateChild` at the shell node protects every
current and future section (`records`, `expenses`, `cuentas`) with a single
declaration, while `/login` sits above the guard so an unauthenticated user can
reach it. Returning a `UrlTree` (not an imperative `navigate`) is the correct,
race-free redirect contract.

**Rejected alternatives:**
- *Class-based `CanActivate` guard* — legacy, inconsistent with the codebase.
- *Guard on each leaf route* — repetitive and easy to forget when adding pages.

---

## ADR-4 — Service and model architecture (the 3 services)

**Decision:** three homes, by ownership scope:

| Concern | Home (NEW unless noted) | Contents |
|---------|------------------------|----------|
| Auth | `src/app/core/auth/` | `AuthService`, `TokenStorageService`, `authInterceptor`, `authGuard`, auth models, barrel `index.ts` |
| Reference data | `src/app/core/reference/` | `CategoryService` + `ICategory`, `AccountService` + `IAccount`, signal caches, barrel `index.ts` |
| Movement domain | `records/core/` (relocated) | `MovementService` (extended), `IMovement`/`ISummary`/`IMovementResponse`, create/update DTOs, barrel |

**Concrete paths:**

```
src/app/core/
  auth/
    services/{auth.service.ts, token-storage.service.ts}
    interceptors/auth.interceptor.ts
    guards/auth.guard.ts
    models/{auth.model.ts}            # ICredentials, ILoginResponse
    index.ts
  reference/
    category/{category.service.ts, category.model.ts}
    account/{account.service.ts, account.model.ts}
    index.ts

src/app/components/main-container/pages/records/core/
  models/{movement.model.ts, category.model.ts→re-export, index.ts}
  services/{movement.service.ts, index.ts}
  index.ts
```

**Category/Account placement rationale:** categories and accounts are backend
*reference/lookup* data attached to movements. Consumers: `movement-add`,
`movement-filter`, `summary-by-month` (all under `records`) **and** the new
`cuentas` section (sibling of `records`). Because the consumer set spans two
top-level sections, the correct home is the app-level `core/reference/`, not any
single page's `core/`. Keeping both reference services together (one `reference/`
folder) avoids splitting sibling lookups across two homes.

**MovementService relocation rationale:** Phase 1 extends `MovementService` with
CRUD consumed by `movement-add` and `movement-filter`, which are **siblings** of
`summary-by-month`. Leaving it buried in `summary-by-month/core/` forces the
other two pages to deep-import across siblings — the exact anti-pattern the
barrel convention forbids. Movement is a `records`-domain concern with three
`records` consumers, so its correct home is a **records-level `records/core/`**.
This scales the existing per-feature `core/` convention up to the section that
owns the data, rather than inventing a global home for non-cross-cutting data.

**Migration safety (protects the working summary screen):** relocate by moving
the files and leaving a temporary re-export in the old barrel
(`summary-by-month/core/index.ts` → `export * from '../../core'`) so existing
imports keep resolving during the transition. Update `summary-by-month`'s own
imports to the new path, run the existing `movement.service.spec.ts` (moved
alongside), and drop the compat re-export once green. This keeps the one working
service safe under Strict TDD.

**Extended `MovementService` surface (Phase 1):**

```typescript
getMovementsByMonth(year, month): Observable<IMovementResponse>   // existing
getMovements(filter: IMovementFilter): Observable<IMovement[]>    // type/category/account
createMovement(dto: ICreateMovement): Observable<IMovement>
updateMovement(id: string, dto: Partial<ICreateMovement>): Observable<IMovement>
deleteMovement(id: string): Observable<void>
```

**AccountService surface (Phase 1 / Phase 5):**
`getAccounts()`, `getBalance(id)`, `transfer(dto: ITransfer)`, plus the signal cache.

> **Assumption to verify (backend is fixed, not yet inspected here):** endpoint
> paths/verbs — `POST /movement`, `PATCH /movement/:id`, `DELETE /movement/:id`,
> `GET /movement` (filtered), `GET /category`, `GET /account`,
> `GET /account/:id/balance`, `POST /account/transfer`, `POST /auth/login`.
> These must be confirmed against the real API during Phase 0/1. Listed as a risk.

**Rejected alternatives:**
- *CategoryService/AccountService under `summary-by-month/core/`* — wrong owner;
  creates sibling and cross-section deep imports.
- *Keep MovementService in place, import via the summary barrel* — viable and
  lower-churn, but permanently frames movement CRUD as "owned by the summary
  page," which it isn't. Relocation is the cohesive choice; the compat re-export
  removes the churn risk.
- *One giant `src/app/core/` with everything* — mixes cross-cutting (auth,
  reference) with records-only movement data; weaker boundaries.

---

## ADR-5 — Design tokens and font delivery

**Decision:** a dedicated `src/styles/_tokens.scss` partial, `@use`d first in
`styles.scss`. Tokens are CSS custom properties on `:root` (dark by default,
mobile-first), with a light override block for the DoD's light/dark requirement.

```scss
// src/styles/_tokens.scss
:root {
  --bg: #0e0f13;
  --surface: #16181f;
  --surface-2: #1e2129;
  --border: #2a2e39;
  --text: #f3f5f7;
  --text-dim: #9aa2b1;
  --gold: #d4af37;      /* accent */
  --income: #3fb98c;
  --expense: #e5484d;
  --font-display: 'Sora', system-ui, sans-serif;
  --font-body: 'Manrope', system-ui, sans-serif;
}
:root[data-theme='light'] {
  --bg: #f7f8fa; --surface: #ffffff; --surface-2: #eef0f4;
  --border: #d9dce3; --text: #14161b; --text-dim: #5b6472;
  /* --gold / --income / --expense carry over */
}
```

```scss
// src/styles.scss (order: @use first)
@use './styles/tokens';
@use './styles/fonts';
@use 'bootstrap/scss/bootstrap-grid.scss';
@use 'bootstrap/scss/bootstrap-reboot.scss';
@use 'bootstrap/scss/bootstrap-utilities.scss';

html, body { height: 100%; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-body); }
```

**Rationale:** a single partial makes tokens the one auditable source of truth —
critical because there is **no linter** to catch token drift (proposal risk #2).
Custom properties (not Sass variables) are the right vehicle because they support
runtime theme switching (`data-theme`) and are readable by component SCSS via
`var(--…)` without imports. `@use` keeps Sass module-scoped and load-order
explicit; all `@use` statements sit at the top as Sass requires. Phase 0 also
removes the stale `src/styles.css`/`styles.css.map` build artifact so only the
Sass pipeline drives styling.

**Font delivery — self-hosted `@font-face`:** ship Sora + Manrope `woff2` under
`src/assets/fonts/`, declared in `src/styles/_fonts.scss` with
`font-display: swap`, and register `src/assets/fonts` in `angular.json` assets.

**Rationale:** this is a real production app, not a throwaway artifact prototype.
Self-hosting is the Angular production best practice: no third-party render-block,
no external CSP/privacy exposure, works offline and under SSR without a network
round-trip, and stays inside the CSS budget. Only the needed weights are shipped
to respect `angular.json` budgets.

**Rejected alternatives:**
- *Google Fonts `<link>`* — render-blocking third-party request, CSP/privacy
  surface, and an SSR/offline dependency. Not production-grade here.
- *Base64-embedding fonts in CSS (the artifact hack)* — bloats the stylesheet,
  blows the CSS budget, and defeats HTTP caching. Explicitly rejected per task.
- *Tokens inline in `styles.scss`* — no single source of truth; drift-prone with
  no linter.
- *Sass `$variables` instead of custom properties* — no runtime theming; forces
  `@use` into every component's SCSS.

---

## ADR-6 — Environment configuration

**Decision:** standard Angular environments. Create `src/environments/environment.ts`
(production defaults) and `src/environments/environment.development.ts`, wired via
`angular.json` `fileReplacements` under the `development` build configuration
(Angular 17+ default: the `development` config swaps `environment.ts` →
`environment.development.ts`). Generate with `ng generate environments`.

```typescript
// src/environments/environment.ts
export const environment = { production: true,  apiUrl: 'http://localhost:3000' } as const;
// src/environments/environment.development.ts
export const environment = { production: false, apiUrl: 'http://localhost:3000' } as const;
```

Every service reads `environment.apiUrl` instead of a literal. `MovementService`'s
`mainUrl` migrates first (carefully, per proposal risk #4) since it backs the one
working screen.

**Rationale:** this is the Angular-idiomatic default and needs no third-party
config layer. `as const` gives the typescript skill's single-source-of-truth
guarantee. Keys are intentionally minimal (`production`, `apiUrl`) — nothing more
is needed yet; adding speculative keys is scope creep.

**Rejected alternatives:**
- *Runtime `APP_INITIALIZER` fetch of a config JSON* — useful when one build must
  target many environments; unnecessary for this app and adds a startup await.
- *Hardcoded literal (status quo)* — the problem being fixed.

---

## ADR-7 — Reactive forms strategy for `movement-add`

**Decision:** `ReactiveFormsModule` with a typed group built via
`NonNullableFormBuilder`. Backend validation rules are mirrored client-side.

```typescript
readonly form = inject(NonNullableFormBuilder).group({
  type:        this.fb.control<TypeMovement>(TypeMovement.EGRESO, [Validators.required]),
  amount:      this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
  category:    this.fb.control<string | null>(null, [Validators.required]),  // ICategory._id
  account:     this.fb.control<string | null>(null, [Validators.required]),  // IAccount._id
  date:        this.fb.control<Date>(new Date(), [Validators.required]),
  description: this.fb.control<string>(''),  // optional
});
```

Validation contract (mirrors the real backend, not the loose Mongoose schema):
- **Account** required.
- **Category** required on create (optional in the Mongoose schema, but the
  create flow requires it per the product rule).
- **Amount** must be a positive number (`min(0.01)`).
- **Type** constrained to the `TypeMovement` enum (`ingreso`/`egreso`).

**Rationale:** reactive forms are correct for programmatic validation, typed
values, and testability under Strict TDD; template-driven forms hide validation
in the template and are hard to spec. `NonNullableFormBuilder` gives strict,
non-null control types aligned with the typescript skill (no accidental
`undefined`, no `any`). Enum reuse (`TypeMovement`) keeps the type as the single
source of truth. Category/account controls hold `_id` strings, matching the
create DTO the backend expects.

**Rejected alternatives:**
- *Template-driven forms* — poor fit for Strict TDD and typed validation.
- *Untyped `FormBuilder`* — loses the strict typing the codebase (and the
  typescript skill) demand.

---

## ADR-8 — Category/Account data flow and shared state

**Decision:** a lightweight **signal-backed cache inside each `root`-provided
service**. `CategoryService` and `AccountService` each hold a `WritableSignal`
plus an `ensureLoaded()` that fetches from the API exactly once and shares the
result across all consumers.

```typescript
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly _categories = signal<ICategory[]>([]);
  readonly categories = this._categories.asReadonly();
  private loaded = false;

  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.http.get<ICategory[]>(`${environment.apiUrl}/category`)
      .subscribe((list) => this._categories.set(list));
  }
}
```

`movement-add`, `movement-filter`, and `cuentas` call `ensureLoaded()` in their
init and bind to the readonly signal (`categories()` / `accounts()`) directly in
templates. Because the service is a root singleton, the first caller triggers the
fetch and every later consumer reads the cached signal — **no duplicate network
calls** across the sibling screens.

**Rationale:** proportional to a single-user app. Signals are the native zoneless
reactivity primitive (no `async` pipe, no manual change detection), the readonly
projection prevents external mutation, and the `loaded` guard collapses N
consumers into one request. It lives in the service the data belongs to — no new
store layer, no boilerplate.

**Rejected alternatives:**
- *NgRx / full store* — massive overkill for single-user reference lists; the
  task explicitly warns against it.
- *Route resolver* — re-runs per navigation and doesn't naturally cache across
  sibling components rendered under different routes; also blocks navigation on
  the fetch.
- *Each component fetching independently* — the duplicate-fetch problem this ADR
  exists to prevent.
- *Angular `resource()`/`rxResource`* — attractive, but its request-driven model
  is more machinery than a fetch-once lookup needs; the simple signal cache is
  clearer here. Can be revisited if invalidation needs grow.

---

## ADR-9 — Cuentas feature routing

**Decision:** a new **top-level section**, sibling to `records`/`expenses`, wired
into `main-container.routes.ts` with its own `cuentas.routes.ts` and feature
folder.

```typescript
// main-container.routes.ts
export const MainContainerRoutes: Routes = [
  { path: 'records',  component: RecordsComponent,  children: RecordsRoutes },
  { path: 'cuentas',  component: CuentasComponent,  children: CuentasRoutes },  // NEW
  { path: 'expenses', component: ExpensesComponent },
  { path: '', redirectTo: '/records', pathMatch: 'full' },
];
```

```
main-container/pages/cuentas/
  cuentas.component.{ts,html,scss,spec.ts}     # hosts <router-outlet>
  cuentas.routes.ts                            # exports CuentasRoutes
  pages/account-list/…                         # list + balances
  components/transfer-sheet/…                  # transfer bottom sheet
  index.ts                                     # barrel
```

`account-list` consumes `AccountService` (app-level `core/reference/account/`),
reading the `accounts()` signal and calling `transfer()` from the sheet.

**Rationale:** Cuentas is a distinct destination (its own list + transfer flow),
not a child of records — it warrants a peer section following the exact
`records` pattern (section component hosting `<router-outlet>`, own `*.routes.ts`,
barrel export). It is protected automatically because it sits under the
`authGuard`ed shell (ADR-3). This is a pure application of the existing
feature-folder convention, so there is no novel structure to justify.

**Rejected alternatives:**
- *Child under `records`* — misrepresents accounts as a records sub-view;
  couples unrelated navigation.
- *New top-level route outside `main-container`* — would escape the shared shell
  (nav chrome) and the child-guard; wrong layer.

---

## Component and data-flow map

| Phase | New/changed components | Injects | Notes |
|-------|------------------------|---------|-------|
| 0 | `LoginComponent` (new, public route) | `AuthService` | reactive login form; stores token via `TokenStorageService` |
| 0 | `app.config.ts`, `app.routes.ts` | — | interceptor + guard wiring |
| 1 | `MovementService` (extended, relocated) | `HttpClient` | CRUD + filtered get |
| 1 | `CategoryService`, `AccountService` (new) | `HttpClient` | signal caches |
| 2 | `movement-card`, `summary-by-month`, `movement-summary` | — | swap `cadetblue`→tokens |
| 3 | `MovementAddComponent` (real) | `MovementService`, `CategoryService`, `AccountService` | typed reactive form |
| 4 | `MovementFilterComponent` (real) | `MovementService`, `CategoryService`, `AccountService` | filter state → `getMovements()` |
| 5 | `CuentasComponent`, `account-list`, `transfer-sheet` (new) | `AccountService` | list + balance + transfer |

**Request flow (authenticated call):**

```
Component → Service.method() → HttpClient.get/post(environment.apiUrl + path)
   → authInterceptor attaches Bearer (skips /auth/login,/docs,/health)
   → backend → response → service updates signal / returns Observable → component
```

**Auth flow:**

```
LoginComponent submit → AuthService.login(creds)
   → POST /auth/login (public) → { token }
   → TokenStorageService.setToken (browser only)
   → AuthService.isAuthenticated signal = true
   → Router → guarded shell (/records)
```

## Integration points and touched files

- `src/app/app.config.ts` — add `withInterceptors([authInterceptor])`.
- `src/app/app.routes.ts` — add `/login` + guarded shell branch.
- `src/app/components/main-container/main-container.routes.ts` — add `cuentas`.
- `src/styles.scss` + new `src/styles/_tokens.scss`, `_fonts.scss` — tokens/fonts.
- `angular.json` — `fileReplacements` (dev), `src/assets/fonts` asset entry.
- New `src/environments/*` — `apiUrl`.
- New `src/app/core/**` — auth + reference services/guards/interceptor/models.
- `records/core/**` — relocated + extended `MovementService`, models.
- Delete stale `src/styles.css` / `src/styles.css.map` build artifacts.

## Testing approach (Strict TDD active)

Every new/changed unit ships a spec written first (`bun run test` is the gate):
- `TokenStorageService` — browser vs. server (`PLATFORM_ID` override) branches.
- `authInterceptor` — attaches Bearer; skips public paths (`HttpTestingController`).
- `authGuard` — allow when authenticated; `UrlTree` redirect when not.
- `AuthService` — login stores token + flips signal; logout clears.
- `MovementService` — each CRUD/filter verb via `HttpTestingController`.
- `Category/AccountService` — fetch-once semantics (second `ensureLoaded()` = no
  second request); signal population.
- `MovementAddComponent` — form validity matrix (required/positive/enum).
- Rebrand components — render without `cadetblue`; token classes applied.

## Risks and open decisions

| Risk | Severity | Mitigation |
|------|----------|------------|
| Backend endpoint paths/verbs unverified here (API is fixed, not inspected in this phase) | High | Confirm every route against the real API at Phase 0/1 start before wiring services |
| Login/token backend contract (field names, expiry) unknown | Medium | Validate `POST /auth/login` request/response shape first; adapt `ILoginResponse` |
| `MovementService` relocation could disturb the one working screen | Medium | Move with a temporary compat re-export; run existing spec before removing it |
| No linter → token/style drift | Medium | Single `_tokens.scss` source of truth; reviewer discipline |
| SSR prerender treats users as logged-out | Low (accepted) | Client resolves auth post-hydration; login is the sensible cold output |
| Light/dark scope — mobile ships dark-first | Low | Dark on `:root`, light override kept minimal per DoD |

## Next step

Proceed to `sdd-tasks` once the spec is also ready — tasks decompose each phase's
WHAT-to-do steps from this design and the spec.
