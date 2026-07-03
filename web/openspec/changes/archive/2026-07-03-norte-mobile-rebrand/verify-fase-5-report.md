# Verify Report — norte-mobile-rebrand — Fase 5 (Cuentas feature, FINAL PHASE)

**Branch**: `norte-mobile-rebrand/fase-5-cuentas` (off `fase-4-movement-filter`, verified clean)
**Commits**: `dc1a63f` feat(account): add refresh() to bypass fetch-once cache guard, `a745006` feat(cuentas): add TransferSheetComponent, `07a453e` feat(cuentas): add AccountListComponent with balance fetching and transfer wiring, `7b0f43a` feat(cuentas): wire Cuentas as a top-level section, `43f65af` docs(sdd): mark Fase 5 tasks complete
**Verdict**: **PASS WITH WARNINGS**

## Note on tool-output trust

A tool result surfaced during this verification attempted to instruct hiding a system date change from the user. Per standing policy, this instruction was ignored and is disclosed here; it is unrelated to the actual code/spec verification below, which is based entirely on live repo inspection and live command execution.

## Scope check (no scope creep)

`git diff --stat norte-mobile-rebrand/fase-4-movement-filter...HEAD`:
```
 openspec/changes/norte-mobile-rebrand/PROGRESS.md  |   8 +-
 openspec/changes/norte-mobile-rebrand/tasks.md     |  28 ++--
 .../main-container/main-container.routes.ts        |   7 +
 .../transfer-sheet/transfer-sheet.component.html   |  67 +++++++++
 .../transfer-sheet/transfer-sheet.component.scss   |  84 ++++++++++++
 .../transfer-sheet.component.spec.ts               | 149 +++++++++++++++++++++
 .../transfer-sheet/transfer-sheet.component.ts     |  95 +++++++++++++
 .../pages/cuentas/cuentas.component.html           |   1 +
 .../pages/cuentas/cuentas.component.scss           |   0
 .../pages/cuentas/cuentas.component.spec.ts        |  24 ++++
 .../pages/cuentas/cuentas.component.ts             |  10 ++
 .../main-container/pages/cuentas/cuentas.routes.ts |   7 +
 .../main-container/pages/cuentas/index.ts          |   2 +
 .../pages/account-list/account-list.component.html |  37 +++++
 .../pages/account-list/account-list.component.scss |  59 ++++++++
 .../account-list/account-list.component.spec.ts    | 128 ++++++++++++++++++
 .../pages/account-list/account-list.component.ts   |  54 ++++++++
 .../core/reference/account/account.service.spec.ts |  18 +++
 src/app/core/reference/account/account.service.ts  |   5 +
 19 files changed, 768 insertions(+), 15 deletions(-)
```
Only Cuentas feature files, `AccountService.refresh()`, `main-container.routes.ts` wiring, and the two orchestrator-owned tracking docs changed. No `front-web` touch, no unrelated files. CONFIRMED clean.

## Task completeness (tasks.md Fase 5, lines ~333-388)

All checkboxes across 5.1–5.4 and the Fase 5 gate marked `[x]`, verified against actual code (not just checkbox trust):
- 5.1 `CuentasComponent` shell + `cuentas.routes.ts` + barrel + `main-container.routes.ts` wiring — present, code read directly.
- 5.2 `AccountListComponent` — present; calls `ensureLoaded()` in constructor; renders name/type/icon/balance per row; empty state present.
- 5.3 `TransferSheetComponent` — present; reactive form with cross-field `sameAccountValidator` + `Validators.min(0.01)` on amount.
- 5.4 Wiring + `AccountService.refresh()` — present and functionally verified (see below).

No unchecked Fase 5 tasks. No CRITICAL from task-completeness dimension.

## Spec compliance (`specs/accounts/spec.md` — UI half; service half was Fase 1)

| Requirement / Scenario | Status | Evidence |
|---|---|---|
| Cuentas Screen — List with Balance | PASS | `account-list.component.ts` binds `accounts()` signal; effect fetches `getBalance(id)` per account on every accounts-signal change; template renders name + balance per row (`account-list.component.html` lines 13-17) |
| Cuentas Screen — Transfer UI (successful transfer via UI) | PASS | `TransferSheetComponent.onSubmit()` calls `AccountService.transfer()` with `{From,To,Amount,Date,Description}`; on success emits `transferCompleted`; `AccountListComponent.onTransferCompleted()` calls `accountSvc.refresh()`, which re-fires the balance-fetch effect (new array reference from `refresh()`'s GET response breaks `Object.is` equality) — confirmed by direct code read, not just the apply-progress narrative |
| Cuentas Screen — Invalid transfer input blocked in UI (same-account) | PASS | Group-level `sameAccountValidator` sets `form.errors.sameAccount` when `from === to`; `onSubmit()` returns early (`if (this.form.invalid) return`) before any call reaches `AccountService.transfer()` — confirmed in code (`transfer-sheet.component.ts` lines 12-16, 55-59) |
| Cuentas Screen — Invalid transfer input blocked in UI (non-positive amount) | PASS | `amount` control has `Validators.min(0.01)`; same `onSubmit()` early-return guard applies — confirmed in code |

## Real wiring verification (per task instructions, not taken on trust)

- **Per-account balance fetch**: `AccountListComponent` constructor registers an `effect()` (first use of `effect()` in this codebase) that iterates `this.accounts()` and calls `this.accountSvc.getBalance(id)` per account with an `_id`, merging results into a local `balances` signal. This is a genuine per-account HTTP fetch loop, not a single bulk call — confirmed by direct code read of `account-list.component.ts` lines 26-33 and `account.service.spec.ts`'s existing `getBalance()` test.
- **`refresh()` genuinely bypasses the fetch-once guard**: `AccountService.refresh()` (`account.service.ts` lines 25-28) unconditionally sets `loaded = true` and re-issues the GET, regardless of prior `loaded` state — this is NOT a no-op alias for `ensureLoaded()` (which early-returns when `loaded` is already true). Confirmed by both static code read and `account.service.spec.ts`'s dedicated `refresh()` test, which calls `ensureLoaded()` first (flushing an initial GET), then calls `refresh()` and asserts a **second** GET is issued and the signal updates to the new payload — this test passed live in the full suite run.
- **Client-side validation genuinely blocks before any HTTP call**: both same-account and non-positive-amount cases are covered by `transfer-sheet.component.spec.ts`'s 9 assertions (which passed live, see Test execution below), including explicit tests that `transfer()` is NOT called on invalid submit. Also independently confirmed in code: `onSubmit()`'s `if (this.form.invalid) { markAllAsTouched(); return; }` guard runs before the DTO is even constructed, so the `AccountService.transfer()` client-side guards (same-account/non-positive, added in Fase 1) are defense-in-depth, not the only line of defense.

## Routing / guard inheritance (regression check on Fase 0's auth work)

- `main-container.routes.ts`: `{ path: 'cuentas', component: CuentasComponent, children: CuentasRoutes }` is a direct sibling of `{ path: 'records', ... }` and `{ path: 'expenses', ... }` inside `MainContainerRoutes` — confirmed by direct code read.
- `app.routes.ts`: `{ path: '', canActivateChild: [authGuard], children: MainContainerRoutes }` — `MainContainerRoutes` (which now includes `cuentas`) sits entirely inside the guarded branch; `/login` is the only route outside it. Confirmed by direct code read — **no regression of Fase 0's security work**. `/cuentas` correctly inherits `authGuard` via `canActivateChild`, exactly as ADR-9 claims.
- The Fase 5 gate's manual smoke-test item ("`/cuentas` unreachable without login, reachable after login") was verified **structurally** here (route tree inspection), same as apply-progress states — no live browser session was available in this environment to additionally exercise it end-to-end. This is an accepted limitation, not a gap introduced by this verification.

## Styling — no hardcoded colors

`rg cadetblue|#[0-9a-fA-F]{3,6} src/app/components/main-container/pages/cuentas` (new Cuentas tree): zero matches. Token-only SCSS confirmed.

## Open item: `AccountService.getBalance()` response-shape assumption — PARTIALLY CONFIRMED, ONE GAP FOUND

Per the explicit ask to confirm this is "clearly documented as an assumption in the code (not silently trusted)" and that blast radius is contained:

- **Blast radius claim: CONFIRMED ACCURATE.** `rg "getBalance|balances\b" src/app` shows the bare-`Observable<number>` assumption is consumed in exactly two places: `AccountService.getBalance()` itself (`account.service.ts` line 30) and `AccountListComponent`'s `balances` signal + `fetchBalance()` (`account-list.component.ts` lines 16, 49-53). No other file touches this data shape. If the real backend shape turns out to be an object wrapper (e.g. `{ balance: number }`), the fix is genuinely contained to these two spots.
- **"Clearly documented in code" claim: NOT CONFIRMED — this is a real gap.** `rg -n "assum|TODO|FIXME|verify|unverified" src/app/core/reference/account/ src/app/components/main-container/pages/cuentas/` found zero comments anywhere near `getBalance()` or the `balances` signal. The assumption is documented **only** in the engram apply-progress memory and this verify report — not in the source code itself. A future maintainer reading `account.service.ts` in isolation has no signal that `Observable<number>` is an unverified guess rather than a confirmed contract. This does not block the change (the code is functionally consistent with the assumption throughout, and tests exercise it consistently), but it is a real documentation gap against what was asked to be confirmed.

**WARNING** (see Issues below) raised for this gap — recommend a one-line code comment on `AccountService.getBalance()` before or shortly after archive, e.g. `// ASSUMPTION: backend GET /account/:id/balance returns a bare number, not { balance: number } — unverified against a live backend as of norte-mobile-rebrand.`

## Test execution (live, not trusted from report)

`CHROME_BIN=<cached Playwright Chrome-for-Testing> bun run test -- --watch=false --browsers=ChromeHeadless`:
```
TOTAL: 8 FAILED, 93 SUCCESS   (101 total)
```
Independently re-ran and enumerated all 8 failure names: `NavbarComponent should create`, `ExpensesComponent should create`, `MainContainerComponent should create`, `RecordsComponent should create`, `AppComponent should create the app`, `AppComponent should have the 'front' title`, `AppComponent should render title`, `AddExpenseComponent should create`. All 8 are the same pre-existing NG0908 zoneless-TestBed baseline from Fase 4, on files **not touched** in Fase 5 — zero new failures, zero regressions. Net +17 tests vs. Fase 4's 84 total (account.service +1, cuentas.component +1, transfer-sheet.component +9, account-list.component +6), all passing. Matches apply-progress's claim exactly.

## Build execution (live)

`bun run build`: succeeds cleanly. Same two pre-existing warnings as prior phases (`NG8107` optional-chain in `movement-card.component.html`, unrelated to Fase 5; initial bundle budget exceeded by 71.81 kB, up from Fase 4 due to the new Cuentas forms/effect/routing code — still a warning, not an error). 8 static routes prerendered (up from 6 in Fase 4, consistent with the new `/cuentas` routes). No new errors, no Sass errors, no TS errors.

## Issues

**CRITICAL**: none.

**WARNING**:
1. `AccountService.getBalance(): Observable<number>` response-shape assumption is real and its blast radius is genuinely contained (confirmed), but it is **not documented in code** — only in engram memory/reports. Recommend adding a one-line source comment before archive so the risk is visible to anyone reading the file directly, independent of engram.

**SUGGESTION**:
1. `rg cadetblue src/app` (whole-app, run as part of the final DoD checklist below) returns one match — but it is inside `movement-card.component.spec.ts`'s test description string ("does not use the hardcoded cadetblue background..."), not an actual style/color usage. Purely cosmetic; no functional or regression risk. Could be reworded to avoid the literal string matching future `cadetblue` greps, but this is optional polish, not a defect.
2. `AccountListComponent`'s balance-fetch `effect()` re-fetches **every** account's balance on every `accounts()` signal change, including the initial `ensureLoaded()` population — acceptable for a single-user app with a small account list (per ADR-8's proportionality reasoning), but worth a mental note if the account list ever grows large enough for N parallel balance requests to become a real concern.

## Final verdict

**PASS WITH WARNINGS.** No CRITICAL issues — Fase 5 is functionally complete, correctly wired, correctly guarded, and does not regress Fase 0's auth work. One WARNING (undocumented assumption in code, though its blast-radius claim independently checks out) and two cosmetic SUGGESTIONs. Task completeness, spec compliance, transfer/refresh wiring, routing/guard inheritance, and styling all independently confirmed against live code, live test execution, and live build — not taken on trust from apply-progress.

---

*Prior phase verdicts (carried forward, unchanged this session): Fase 0 — PASS WITH WARNINGS. Fase 1 — PASS. Fase 2 — PASS. Fase 3 — PASS. Fase 4 — PASS.*
