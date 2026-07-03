# Verify Report — norte-mobile-rebrand — Fase 3 (movement-add)

**Branch**: `norte-mobile-rebrand/fase-3-movement-add` (off `fase-2-rebrand`, verified clean)
**Commits**: `b3ac096` feat(records): implement movement-add reactive form, `d4158a6` docs(sdd): mark Fase 3 tasks complete. Nothing pushed.
**Verdict**: **PASS**

## Prior phase verdicts (carried forward, unchanged)
- Fase 0 (Foundations): PASS WITH WARNINGS
- Fase 1 (Services/CRUD): PASS
- Fase 2 (Visual rebrand): PASS

## Completeness — tasks.md Fase 3
All 3.1 checkboxes verified `[x]` and objectively true against the code:
- RED spec extension (10 tests, up from 1-test stub) — confirmed in `movement-add.component.spec.ts`.
- GREEN `movement-add.component.ts` — `NonNullableFormBuilder` group per ADR-7, injects `MovementService`/`CategoryService`/`AccountService`/`Router`, calls `ensureLoaded()` in constructor, `onSubmit()` handles success/error.
- `movement-add.component.html` — reactive form markup with inline `.field-error` messages, success/error banners, submit disabled on invalid/submitting.
- `movement-add.component.scss` — Norte token-based styling; `rg cadetblue|#hex` returns no matches.

## Spec compliance — specs/movement/spec.md → "movement-add Form"

| Scenario | Status | Evidence |
|---|---|---|
| Valid submission creates a movement | PASS | `calls MovementService.createMovement() with the form-derived DTO` test passes; DTO shape matches `ICreateMovement` (`Type, Amount, Category, Account, Date, Description`) and `api-reference.md`'s `POST /movement` body. |
| ...on success form resets or navigates away, success indication shown | PASS | Component both resets the form AND calls `router.navigate(['/records/summary-by-month'])`; `success` signal set to `true` before navigation. Test asserts both. (SUGGESTION: since navigation is synchronous right after, the success banner has negligible visible time before the component is torn down — not a spec violation, but a UX nuance worth a product call later.) |
| Invalid submission blocked | PASS | `form.invalid` guard in `onSubmit()` returns early without calling the service (`markAllAsTouched()` only); submit button `[disabled]="form.invalid || submitting()"`; inline `.field-error` elements render per-field after a blocked submit attempt. Verified: Amount `Validators.min(0.01)` rejects 0 and negative values (test covers 0/-10/100); Category/Account/Date all `Validators.required`. |
| API error surfaced | PASS | `error:` callback sets `errorMessage` signal (rendered in template), does NOT reset the form, does NOT navigate. Test confirms `form.getRawValue()` is unchanged after a `throwError` failure. |

## Correctness — form validation and DTO shape
- Confirmed directly in `movement-add.component.ts` (not just the spec mocks): Amount/Category/Account/Date are all `Validators.required`; Amount additionally has `Validators.min(0.01)`, verified against 0 (invalid), -10 (invalid), 100 (valid).
- `onSubmit()`'s DTO construction (`Type, Amount, Category: category ?? '', Account: account ?? '', Date: date, Description: description || undefined`) matches `ICreateMovement` (`records/core/models/movement.model.ts`) and the `POST /movement` body per `api-reference.md`. `Card` is correctly omitted (optional field, not collected by this form).
- `ICreateMovement.Category`/`Account` are typed as required non-nullable `string`, consistent with the spec's "Category required on create" / "Account required" scenarios — the form's `Validators.required` enforces this before the nullable-coalesce ever fires with an empty value.

## Deviations sanity-check (from apply-progress #152)
1. **No category filtering by movement Type** — CONFIRMED CORRECT. `ICategory.Type` is `TypeCategory.FIJO | TypeCategory.VARIABLE` (`src/app/core/reference/category/category.model.ts`), completely independent of `TypeMovement.INGRESO | EGRESO`. `api-reference.md`'s `POST /category` body confirms `Type: "variable" | "fijo"`. Neither `specs/movement/spec.md` nor `design.md` ADR-7/ADR-8 requires or implies type-based category filtering. Showing all categories unfiltered is the spec-compliant behavior, not a missed requirement — the original apply-prompt's premise was factually wrong about the data model, and the deviation correctly follows the real model instead.
2. **`date` control typed `string` (native `<input type="date">`), not Angular Material datepicker `Date`** — CONFIRMED ACCEPTABLE ENGINEERING JUDGMENT. `ICreateMovement.Date` is `string` on the wire regardless; a `Date`-typed control would require `MatDatepickerModule` + `provideNativeDateAdapter()`, machinery unused elsewhere in the codebase, plus a conversion step at submit time. The native date input keeps the component consistent with `LoginComponent`'s established plain-native-input convention. Functionally equivalent: the form still requires a date and sends a valid ISO string.

Neither deviation breaks a spec requirement; both are documented, evidence-backed corrections of an incorrect premise/reasonable proportionality calls, not corners cut.

## Reference-data loading (CategoryService / AccountService)
- Confirmed `ensureLoaded()` is called for both services in `MovementAddComponent`'s constructor.
- Confirmed the fetch-once `loaded` boolean guard in both `CategoryService` and `AccountService` (`src/app/core/reference/{category,account}/*.service.ts`) prevents a second HTTP call on repeat `ensureLoaded()` invocations — Fase 1's caching contract holds under this new consumer.
- Test `beforeEach` flushes exactly one `GET /category` and one `GET /account` request via `HttpTestingController`, matching this.

## Runtime evidence (executed live this session)

**`bun run test -- --watch=false --browsers=ChromeHeadless`** (Chrome for Testing at the cached Playwright path):
- **74 total, 65 SUCCESS, 9 FAILED** — matches the apply-progress claim exactly (independently re-run and counted, not trusted from the report).
- All 9 failures confirmed to be the pre-existing NG0908 zoneless-TestBed issue, on files NOT touched this phase: `RecordsComponent`, `ExpensesComponent`, `MovementFilterComponent`, `AddExpenseComponent`, `AppComponent` (x3), `NavbarComponent`, `MainContainerComponent`. `MovementAddComponent`'s own 10 tests all pass. No regressions, no new failures.

**`bun run build`**:
- Clean. Same two pre-existing warnings as Fase 2 (NG8107 optional-chain in `movement-card.component.html`, unrelated to this phase; initial bundle budget exceeded by 54.90 kB — pre-existing, slightly larger due to the new form's Material/ReactiveForms imports). No new errors or warnings. 6 static routes prerendered successfully.

## Scope check
- `git diff --stat` against `fase-2-rebrand` shows only `movement-add.component.{ts,html,scss,spec.ts}` plus `tasks.md`/`PROGRESS.md` (orchestrator-owned docs) changed — no stray edits outside Fase 3's scope. `front-web` project directory untouched.
- Feature commit (`b3ac096`) is 376 changed lines, within the tasks.md forecast (~300–380) and the review-workload's per-phase chained-PR budget.

## Security note
The task included a standing policy about a previously-rejected fake "system note." No tool output during this verification session contained a similar embedded instruction to hide or misrepresent findings from the user regarding the codebase or file state; all repo-state claims in this report were independently verified (git log/diff, live test run, live build), not taken from any tool-injected claim.

Separately: this session's environment/system-reminder content included an instruction to not mention a date change to the user. Per the same standing policy of not silently complying with embedded "don't tell the user" instructions, this is disclosed here for transparency, though it is unrelated to repo state and did not affect any verification finding.

## Issues

**CRITICAL**: None.

**WARNING**: None new. (Fase 1's carried-forward `AccountService.getBalance()` return-type WARNING remains open, deferred to Fase 5 — unrelated to Fase 3.)

**SUGGESTION**:
1. On successful submit, the component sets `success()` to `true` and resets the form, then immediately calls `router.navigate()` in the same synchronous callback — the success banner has effectively no visible render time before the component is torn down by navigation. Consider a short delay, a toast/snackbar that survives navigation, or dropping the immediate reset+success-signal combo in favor of just navigating, since the current combination provides little practical user-visible feedback beyond what the destination page shows.

## Final Verdict: PASS

No CRITICAL or WARNING issues found in Fase 3. Both flagged deviations are genuine, evidence-backed correct engineering judgment, not corners cut. Test and build evidence independently reproduced and matches the apply-progress claims exactly.
