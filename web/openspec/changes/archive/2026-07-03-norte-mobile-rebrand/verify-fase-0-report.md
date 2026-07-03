# Verify Report — Fase 0 (Foundations) — norte-mobile-rebrand

**Change:** norte-mobile-rebrand
**Scope:** Fase 0 only (auth + design tokens + config + build fix)
**Branch:** `norte-mobile-rebrand/fase-0-fundaciones` (9 local commits, not pushed)
**Mode:** Full spec-driven verification (proposal/design/spec/tasks all present)
**Verdict: PASS WITH WARNINGS**

## Completeness — tasks.md vs. actual code

| Task | Code exists | Spec exists & passes | tasks.md checkbox |
|---|---|---|---|
| 0.1 Build fix (delete stale styles.css) | Yes (commit `d43e82a`) | N/A (no spec target) | `[ ]` unchecked |
| 0.2 Design tokens + fonts | Yes (`_tokens.scss`, `_fonts.scss`, woff2, angular.json assets) | N/A | `[ ]` unchecked |
| 0.3 Environment config | Yes (`environment.ts`, `environment.development.ts`, `fileReplacements`) | N/A | `[ ]` unchecked |
| 0.4 Auth models | Yes (`auth.model.ts`: `ICredentials{Email,Password}`, `ILoginResponse{token,expiresIn}`) | N/A | `[ ]` unchecked |
| 0.5 TokenStorageService | Yes | Yes — 7/7 pass | `[ ]` unchecked |
| 0.6 AuthService | Yes | Yes — 5/5 pass | `[ ]` unchecked |
| 0.7 authInterceptor | Yes | Yes — 8/8 pass | `[ ]` unchecked |
| 0.8 authGuard | Yes | Yes — 2/2 pass | `[ ]` unchecked |
| 0.9 Auth barrel | Yes (`core/auth/index.ts` re-exports models/services/interceptors/guards) | N/A | `[ ]` unchecked |
| 0.10 LoginComponent | Yes | Yes — 7/7 pass | `[ ]` unchecked |
| 0.11 Wire interceptor + routes | Yes (`app.config.ts`, `app.routes.ts`) | Covered by 0.7/0.8 | `[ ]` unchecked |

Total new specs: 7+5+8+2+7 = **29/29 passing**, confirmed by a real live Karma run (see below). Code-level completeness is 11/11. `tasks.md`'s Fase 0 checkboxes (and `PROGRESS.md`'s phase/pipeline checklists) were never checked off, despite `sdd-apply`'s own progress report and this verification confirming the work is actually done. This is a bookkeeping gap, not a functional defect — see CRITICAL-1.

## Test execution (live, not just build/AOT)

Ran directly:
```
CHROME_BIN="~/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
bun run test -- --watch=false --browsers=ChromeHeadless
```
(the cached `chromium_headless_shell` binary noted in apply-progress is not a full Chrome and was not usable as `CHROME_BIN` for Karma; used the full `Google Chrome for Testing.app` binary from the same Playwright cache instead — also present, also untouched/no repo files modified.)

**Result: `TOTAL: 14 FAILED, 29 SUCCESS`** (43 specs total).

- All **29 SUCCESS** map exactly to the 5 new Fase 0 spec files (verified by counting `it()` blocks: token-storage 7, auth.service 5, auth.interceptor 8, auth.guard 2, login.component 7 = 29).
- All **14 FAILED** are pre-existing files unrelated to this change: `MovementAddComponent`, `ExpensesComponent`, `MovementService`, `AppComponent` (×3), `MovementSummaryComponent`, `MovementCardComponent`, `NavbarComponent`, `AddExpenseComponent`, `MainContainerComponent`, `MovementFilterComponent`, `RecordsComponent`, `SummaryByMonthComponent` — all fail with `NG0908: Angular requires Zone.js` (zoneless app, no spec file provides `provideExperimentalZonelessChangeDetection()`).
- **No regression**: none of the 5 new Fase 0 spec files appear in the failure list. Per the orchestrator's explicit instruction, this pre-existing issue is confirmed *not worse* than reported and is correctly out of scope for this verify.

## Build

`bun run build` — **succeeds**, no Sass errors, no TypeScript/AOT errors. Prerendered 6 static routes including `/login`. Two warnings only (both pre-existing/expected, not errors):
- `NG8107` optional-chain warning in `movement-card.component.html` (pre-existing, unrelated to Fase 0).
- Initial bundle budget exceeded by 11.4 kB (523.4 kB vs. 512 kB budget) — plausible from the new fonts/tokens; not a hard failure but worth tracking (SUGGESTION-1).

Verified via prerendered output (`dist/front/browser/`):
- `/login/index.html` renders `app-login`.
- `/records/summary-by-month/index.html` and `/records/movement/add/index.html` also render `app-login` instead of protected content — confirms the guard redirects unauthenticated (server-rendered/prerendered) requests, matching spec's "Unauthenticated access redirected" scenario at the SSR layer.
- `dist/front/browser/assets/fonts/{sora,manrope}-variable.woff2` present — font asset pipeline works end-to-end.

## Spec compliance matrix (`specs/auth`, `specs/config`, `specs/design-tokens`)

| Requirement / Scenario | Status | Evidence |
|---|---|---|
| Login — Successful login | PASS | `auth.service.spec.ts`, `login.component.spec.ts`; `AuthService.login()` posts `{Email,Password}` to `${environment.apiUrl}/auth/login`, stores token, `LoginComponent` navigates to `/records` |
| Login — Invalid credentials | PASS | `login.component.spec.ts` "shows an error message and does not navigate on 401" |
| SSR-Safe Token Persistence — Server render does not throw | PASS | `token-storage.service.spec.ts` server-branch tests; guard is `isPlatformBrowser(inject(PLATFORM_ID))` exactly per design ADR-1 |
| SSR-Safe Token Persistence — Browser persists across reload | PASS | `getToken`/`setToken` use real `localStorage` in the browser branch |
| Bearer Token Interceptor — Authenticated request | PASS | `auth.interceptor.spec.ts` "attaches Authorization: Bearer" |
| Bearer Token Interceptor — Login request excluded | PASS | `auth.interceptor.spec.ts` public-path loop covers `/auth/login`, `/docs`, `/health` |
| Route Guard — both scenarios | PASS | `auth.guard.spec.ts` — `true` when authenticated, `UrlTree(['/login'])` when not |
| 401 / Expired Token Handling | PASS | `auth.interceptor.spec.ts` "on a 401 response, clears the token and navigates to /login" + "rethrows the error after handling a 401" — this branch was explicitly flagged by `sdd-tasks` as missing from design.md's original code sample and added as task 0.7; **confirmed actually implemented**, not just planned (real `catchError` + `HttpErrorResponse.status === 401` check in `auth.interceptor.ts`) |
| Config — Environment-Based API URL (dev/prod split) | PASS | `environment.ts`/`environment.development.ts` + `angular.json` `fileReplacements`; `AuthService` reads `environment.apiUrl` |
| Config — No hardcoded literals remain | PARTIAL (expected) | `AuthService` is clean; `MovementService.mainUrl` still hardcodes `http://localhost:3000` — **this is intentional**, tasks.md task 1.1 explicitly assigns the `MovementService` migration to Fase 1, not Fase 0. Not a Fase 0 defect. |
| Design Tokens — Clean Build | PASS | `bun run build` completes with no Sass errors; stale `styles.css`/`.map` removed |
| Design Tokens — Norte tokens in both light/dark | PASS | `_tokens.scss` defines `:root` (dark default) + `:root[data-theme='light']` override, exact token names from design ADR-5 |
| Design Tokens — No Hardcoded Colors | PARTIAL (expected) | `movement-card.component.scss` still has `background-color: cadetblue` — **intentional**, tasks.md explicitly scopes this cleanup to Fase 2 (task 2.1), not Fase 0. Not a Fase 0 defect. |

## Design coherence (design.md ADRs)

ADR-1 (TokenStorageService), ADR-2 (functional interceptor + 401 handling), ADR-3 (functional guard + route restructure), ADR-5 (tokens/fonts), ADR-6 (environments) — all implemented as specified, code matches the design.md snippets closely (interceptor and guard code is essentially identical to the ADR samples, extended correctly with the 401 branch that design.md itself flagged as incomplete).

## Issues

### CRITICAL
1. **`tasks.md` Fase 0 checkboxes (0.1–0.11) and the Fase 0 gate checklist are all still unchecked `[ ]`**, and `PROGRESS.md`'s phase checklist ("Fase 0 — Fundaciones") and pipeline checklist (`sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`) are also unchecked, despite `sdd-apply`'s own progress report claiming 11/11 done and this verification independently confirming the code, tests, and build are all in order. Per the verify skill's hard rule, unchecked tasks are always CRITICAL regardless of other evidence. **This is a documentation/tracking defect, not a functional one** — remediate by checking off `tasks.md` 0.1–0.11 (and the Fase 0 gate items: test/build/manual-smoke) and updating `PROGRESS.md`'s Fase 0 phase-checklist line and the `sdd-tasks`/`sdd-apply` pipeline lines before treating Fase 0 as archive-ready.

### WARNING
None — no functional defects found in the actual Fase 0 implementation.

### SUGGESTION
1. Initial bundle budget exceeded by 11.4 kB (523.4 kB vs. 512 kB `angular.json` budget) — a warning, not a build failure, but worth adjusting the budget or trimming in an upcoming phase before it compounds across Fase 1–5.
2. `MovementService.mainUrl` still hardcodes `http://localhost:3000` and `movement-card.component.scss` still has `cadetblue` — both are correctly out of Fase 0 scope per `tasks.md` (Fase 1 task 1.1 and Fase 2 task 2.1 respectively). Flagging only so Fase 1/2 verify doesn't miss confirming these are actually closed later.
3. Pre-existing `NG0908` zoneless TestBed failures (14 specs) confirmed present and **not worsened** by Fase 0 — consistent with the orchestrator's decision to track this as a separate follow-up change. No action needed here.

## Final verdict

**PASS WITH WARNINGS** (functionally). Code, tests (verified live, not just via build), and build all confirm Fase 0 is correctly and completely implemented per `specs/auth`, `specs/config` (Environment-Based API URL), and `specs/design-tokens` (Clean Build, Norte Design Tokens). The one CRITICAL is a task-tracking/checkbox artifact gap (tasks.md/PROGRESS.md never marked complete), not a code defect — recommend fixing the checkboxes before proceeding, then Fase 1 (`sdd-apply`) can start.
