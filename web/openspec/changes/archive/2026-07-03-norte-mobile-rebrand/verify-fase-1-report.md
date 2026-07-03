# Verify Report — Fase 1 (Services / CRUD) — norte-mobile-rebrand

**Branch**: `norte-mobile-rebrand/fase-1-servicios` (3 local commits: `c70810d`, `9c87ce5`, `c2c61cc`; branched off verified `fase-0-fundaciones`; not pushed)
**Verdict**: **PASS**

## Scope

Verified `specs/movement/spec.md` (Create/Update/Delete/Filtered Get — service
half only, `movement-add` form UI is Fase 3) and `specs/accounts/spec.md`
(List Categories, List Accounts, Account Balance, Transfer — **service half
only**, Cuentas Screen UI is Fase 5, not evaluated here) against
`design.md` ADR-4/ADR-8 and `tasks.md` Fase 1 (lines ~144-217).

## Completeness (tasks.md Fase 1)

| Task group | Status |
|---|---|
| 1.1 MovementService relocation + extension | `[x]` all items |
| 1.2 Migration cleanup | `[x]` import update + test run; `[ ]` compat re-export removal — **deliberately deferred to Fase 2**, documented inline in tasks.md (movement-card/movement-summary still consume it, out of this phase's scope). Not flagged as incomplete per orchestrator instruction. |
| 1.3 CategoryService | `[x]` all items |
| 1.4 AccountService | `[x]` all items |
| 1.5 Reference barrel | `[x]` |
| Fase 1 gate | `[x]` test + build |

Verified via `rg -n "\[ \]"` on the Fase 1 line range: exactly one unchecked
item, matching the documented deferral. No other incomplete tasks.

## Source-level verification

**MovementService** (`records/core/services/movement.service.ts`):
- Reads `environment.apiUrl` (not a literal) — `private readonly mainUrl = environment.apiUrl;`. Confirmed `src/environments/environment.ts` exists with `apiUrl`.
- `getMovements(startDate, endDate, filter?)`: branches on `Object.values(filter).some(v => v !== undefined)` — POST with `{Type, Category, Account}` body when any filter key is set, plain GET otherwise. Logic exists in code, not just asserted in spec. Matches `api-reference.md`'s `GET|POST /movement/:startDate/:endDate`.
- `createMovement` → `POST /movement`. `updateMovement` → **`PUT /movement/:id`** (confirmed `http.put`, not `patch`). `deleteMovement` → `DELETE /movement/:id`. All match `api-reference.md` verbatim.
- Spec file (`movement.service.spec.ts`) exercises all four methods plus the two `getMovements` branches (filtered/unfiltered) and an empty-result case via `HttpTestingController` — real runtime evidence, not just source inspection.

**summary-by-month.component.ts** (highest-risk item):
- Imports `MovementService` from `'../../core'` (the new `records/core` path) — resolves correctly (`node path.resolve` confirmed → `records/core`).
- `movement-card`/`movement-summary` still import via the old `summary-by-month/core` compat barrel (`export * from '../../../core'` — path also confirmed resolving to `records/core`), exactly as documented as the deliberate Fase-2-deferred deviation.
- Full test suite run live: `SummaryByMonthComponent` is one of the 13 pre-existing NG0908 failures (zoneless TestBed issue, unrelated to this change — same failure existed before Fase 1). No new failure introduced by the relocation.

**CategoryService** / **AccountService** (`src/app/core/reference/**`):
- Fetch-once caching verified in the actual implementation (`private loaded = false; ensureLoaded() { if (this.loaded) return; this.loaded = true; ... }`), not just asserted by a spec — and the spec's second-call assertion (`httpMock.expectNone(...)`) ran and passed live.
- `AccountService.transfer()`: pre-flight validation happens **before** any HTTP call — `if (dto.From === dto.To) return throwError(...)` and `if (dto.Amount <= 0) return throwError(...)` both precede `this.http.post(...)`. Confirmed via source read and via the live-passing specs `expectNone('.../account/transfer')` for both rejection cases.
- Both mirror the backend's real validation per `api-reference.md` ("Backend rejects: same account, non-positive amount, missing/archived accounts").

## Test execution (live)

Command: `CHROME_BIN=".../chromium-1228/.../Google Chrome for Testing" bun run test -- --watch=false --browsers=ChromeHeadless`

Result: **61 total — 48 SUCCESS, 13 FAILED**. Matches the apply report's claimed
counts exactly (19 new/extended Fase 1 cases: 8 movement.service + 4
category.service + 7 account.service, all passing as part of the 48).

All 13 failures are the same pre-existing `NG0908` zoneless-TestBed issue,
same component list as reported: `MainContainerComponent`, `AppComponent`
(x3: create/title/render), `AddExpenseComponent`, `NavbarComponent`,
`MovementAddComponent`, `MovementCardComponent`, `ExpensesComponent`,
`RecordsComponent`, `MovementSummaryComponent`, `MovementFilterComponent`,
`SummaryByMonthComponent`. Count (13) matches the apply report — not worse
than Fase 0's baseline (14, later 13 after the relocated
`movement.service.spec.ts` inherited `provideExperimentalZonelessChangeDetection()`).

## Build execution (live)

`bun run build` — succeeds, no Sass/TS errors. Same two pre-existing warnings
as Fase 0 (`NG8107` optional-chain-on-non-nullable on `movement-card.component.html`,
bundle budget exceeded by 11.73 kB — both explicitly out of Fase 1 scope,
deferred to Fase 2). Prerendered 6 static routes, no new errors.

## Open items (flagged, not blocking)

1. **Relative-path typo corrections** — design.md's literal snippets
   (`summary-by-month/core/index.ts` → `'../../core'`, category re-export →
   fewer `../` levels) were off by one directory level each. Verified the
   *actual* committed paths (`'../../../core'` and
   `'../../../../../../core/reference/category/category.model'`) resolve
   correctly via `node -e "path.resolve(...)"` from each file's real
   location. Both resolve to the intended target directories. No action
   needed — design.md's snippets were illustrative, not literal, and the
   implementation self-corrected during RED/GREEN (compile errors would have
   caught a wrong path immediately).
2. **`AccountService.getBalance()` return type** (`Observable<number>`) — the
   real backend response shape for `GET /account/:id/balance` was not
   inspected in this phase (`api-reference.md` doesn't specify it). This is
   correctly flagged as an open item for Fase 5 (`AccountListComponent`
   is the first consumer) — no UI exists yet that depends on the exact shape,
   so this does not block Fase 1. **WARNING**, not CRITICAL.

## Verdict

**PASS.** All Fase 1 tasks are complete except the one deliberately-deferred,
documented item (compat re-export removal → Fase 2). Runtime test evidence
(19/19 new cases + full suite counts) matches the apply report exactly.
Build is clean. The highest-risk item (summary-by-month untouched
functionally) is confirmed safe — it's in the pre-existing failing set for an
unrelated zoneless-TestBed reason, not a regression from the relocation.

No CRITICAL issues. One WARNING (getBalance return-type assumption, deferred
to Fase 5 by design). Zero SUGGESTIONs beyond what's already tracked in
tasks.md.

## Compliance matrix

| Spec requirement | Scenario | Covering test | Result |
|---|---|---|---|
| Create Movement | Valid creation | `movement.service.spec.ts` createMovement() | PASS (live) |
| Update Movement | Successful update | `movement.service.spec.ts` updateMovement() | PASS (live), confirmed PUT |
| Delete Movement | Successful delete | `movement.service.spec.ts` deleteMovement() | PASS (live) |
| Filtered Get | Filter by single criterion | `movement.service.spec.ts` getMovements() POST branch | PASS (live) |
| Filtered Get | Filter with no matches | `movement.service.spec.ts` empty-result case | PASS (live) |
| List Categories | List returns categories | `category.service.spec.ts` ensureLoaded() | PASS (live) |
| List Accounts | List returns accounts | `account.service.spec.ts` ensureLoaded() | PASS (live) |
| Account Balance | Balance for existing account | `account.service.spec.ts` getBalance() | PASS (live), return-type unverified against real backend (WARNING, Fase 5) |
| Transfer Between Accounts | Same-account rejected | `account.service.spec.ts` transfer() same-account case | PASS (live) |
| Transfer Between Accounts | Non-positive amount rejected | `account.service.spec.ts` transfer() non-positive case | PASS (live) |
| Transfer Between Accounts | Valid transfer | `account.service.spec.ts` transfer() valid case | PASS (live) |
