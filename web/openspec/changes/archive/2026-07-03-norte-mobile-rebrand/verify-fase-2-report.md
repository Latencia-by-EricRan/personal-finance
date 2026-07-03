# Verify Report — Fase 2 (Visual Rebrand) — norte-mobile-rebrand

**Branch**: `norte-mobile-rebrand/fase-2-rebrand` (off `fase-1-servicios`)
**Commits** (5 local, nothing pushed): `9c87ce5`, `c2c61cc`, `c4a7ea4` (Fase 1 docs), `08d4489`, `1525ca3`, `e9c2e91`, `b80c93d`, `72fd990` — the 4 substantive Fase 2 commits are `08d4489` (retire compat barrel), `1525ca3` (movement-card tokens), `e9c2e91` (movement-summary tokens), `b80c93d` (summary-by-month tokens), plus `72fd990` (docs).
**Verdict**: **PASS**. No CRITICAL issues found.

## Scope

Verified against:
- `openspec/changes/norte-mobile-rebrand/specs/design-tokens/spec.md` (Clean Build, Norte Design Tokens, No Hardcoded Colors)
- `design.md` ADR-5 (design tokens)
- `tasks.md` Fase 2 section (2.1–2.3 + gate) and the Fase-1-deferred compat-barrel-removal item (task 1.2, line ~175–181)
- Engram `sdd/norte-mobile-rebrand/apply-progress` (merged Fase 0+1+2 report, obs #152)

## Completeness (tasks.md)

| Task | Status |
|---|---|
| 2.1 movement-card RED+GREEN | [x] confirmed in code |
| 2.2 summary-by-month RED+GREEN | [x] confirmed in code |
| 2.3 movement-summary RED+GREEN | [x] confirmed in code |
| Fase 2 gate: `bun run test` green | [x] confirmed live (see below) |
| Fase 2 gate: `rg cadetblue` no matches | [x] confirmed live |
| Fase 1 deferred: compat-barrel removal | [x] confirmed — genuinely gone |

No unchecked Fase 2 tasks found.

## No Hardcoded Colors — spec compliance

Ran `rg -n "cadetblue|#[0-9a-fA-F]{3,6}" src/app` (whole app tree): the only hit is the word "cadetblue" inside the movement-card spec's own test description string (`it('does not use the hardcoded cadetblue background...')`), not a live style value. Zero raw color literals remain in `movement-card.component.scss`, `movement-summary.component.scss`, `summary-by-month.component.scss` — all three now reference `var(--surface)`, `var(--surface-2)`, `var(--border)`, `var(--text)`, `var(--bg)`, `var(--gold)`, `var(--income)`, `var(--expense)`.

**Vacuous-test check (performed independently, not just trusted from the apply report):** temporarily edited `movement-card.component.scss` to restore `background-color: cadetblue;`, ran `bun run test -- --watch=false --browsers=ChromeHeadless --include='**/movement-card.component.spec.ts'`. Result: the "does not use the hardcoded cadetblue background" spec **FAILED** with `Expected 'rgb(95, 158, 160)' not to be 'rgb(95, 158, 160)'` and `Expected 'rgb(95, 158, 160)' to be 'rgb(30, 33, 41)'` — the exact expected mismatch. Restored the file from a pre-edit backup; `git diff --stat` on the file is empty (byte-identical restore). Conclusion: the spec assertion is real — it compares the rendered element's computed `background-color` against `getComputedStyle` of a throwaway probe bound to `var(--surface-2)`, so it fails whenever the SCSS doesn't route through that token. Same reasoning holds for `movement-summary.component.spec.ts` (`--income`/`--expense` via `resolveTextToken`) and `summary-by-month.component.spec.ts` (`--bg`/`--text` via `resolveToken`) — same probe-element pattern, same non-vacuous structure.

## Compat barrel removal (Fase 1 deferred item, tasks.md line ~175)

`summary-by-month/core/index.ts` now contains only:
```
export * from './angular-material/angular-material.module';
```
No re-export of `IMovement`/`ISummary`/`MovementService` remains. Grepped the whole `src/app` tree for any lingering import expecting those symbols through the old barrel path — none found. `movement-card.component.ts` and `movement-summary.component.ts` now import `IMovement`/`ISummary` directly from `records/core` via `'../../../../core'` (verified this resolves correctly: `summary-by-month/components/movement-card` → up 4 → `records/core`). `summary-by-month.component.ts` imports `MovementService` from `'../../core'`, which resolves to `records/core` (2 levels up from `summary-by-month.component.ts`'s own directory) — correct, not a stale path. `records/core/index.ts` only re-exports `models`/`services`, no compat shim.

## Safe-navigation regression check (flagged risk)

`movement-card.component.html` line 10: `[fontIcon]="_movement.Category?.Icon ?? iconDefault"` — the `?.` operator **is present**. Confirmed `IMovement.Category: ICategory` is typed as required (non-optional) in `records/core/models/movement.model.ts`, meaning the type system would allow removing `?.` without a compile error — this is exactly the trap the earlier interrupted apply attempt fell into (and which a prior batch correctly reverted). No regression found in the current state. `bun run build` still emits the pre-existing NG8107 warning at this exact line (expected/accepted, out of scope for this phase — the type mismatch itself is a pre-existing frontend-type-vs-backend-reality gap, not something Fase 2 is responsible for fixing).

## Test suite (live run)

`CHROME_BIN=".../Google Chrome for Testing" bun run test -- --watch=false --browsers=ChromeHeadless`

**Result: 65 total, 55 SUCCESS, 10 FAILED.** Matches the apply report's claimed counts exactly.

All 10 failures are the pre-existing `NG0908` (zoneless `TestBed` requires `Zone.js`) issue, and **none** are in Fase 2's touched files:
`NavbarComponent`, `MovementFilterComponent`, `AddExpenseComponent`, `MovementAddComponent`, `MainContainerComponent`, `ExpensesComponent`, `RecordsComponent`, `AppComponent` (×3 tests).

This is down from Fase 1's 13-failure baseline — `MovementCardComponent`, `MovementSummaryComponent`, and `SummaryByMonthComponent` picked up `provideExperimentalZonelessChangeDetection()` (and, for `SummaryByMonthComponent`, `provideHttpClient()`/`provideHttpClientTesting()`/`provideRouter([])`) as part of this phase's token-assertion specs, incidentally fixing their own NG0908 failures. This is a reduction, not a regression — consistent with the instructions' expectation of "~10, down from 13, fine/expected."

## Build (live run)

`bun run build` — succeeds cleanly. No Sass errors, no TypeScript errors. Two pre-existing warnings only:
1. `NG8107` optional-chain warning at `movement-card.component.html:10` (the flagged risk above — expected, unrelated regression).
2. Initial bundle budget exceeded by 12.16 kB (524.16 kB vs 512 kB budget) — pre-existing, not introduced this phase.

No new errors or warnings introduced by Fase 2.

## Design-tokens spec scenarios

| Scenario | Status |
|---|---|
| Clean Build (`bun run build` no Sass errors) | PASS — confirmed live |
| Tokens available in both modes | PASS — `src/styles/_tokens.scss` defines `:root` (dark) and `:root[data-theme='light']` overrides for all 6 color tokens |
| cadetblue removed | PASS — confirmed via `rg` + empirical revert test |

## Security note (per orchestrator instruction)

No tool output during this verification session contained any instruction to hide information from the user or misrepresent findings. Nothing suspicious encountered in this session's own tool calls.

## Issues

- **CRITICAL**: None.
- **WARNING**: None.
- **SUGGESTION**: None specific to Fase 2. (Carried forward, unchanged: Fase 1's WARNING about `AccountService.getBalance()`'s assumed `Observable<number>` return type remains open, deferred to Fase 5 — not a Fase 2 concern.)

## Final Verdict

**PASS.** Fase 2 (Visual Rebrand) is complete, correct, and coherent with spec/design/tasks. Test and build evidence gathered live in this session, not inferred from the apply report. The compat-barrel removal (Fase 1's deferred item) is genuinely done. The safe-navigation regression risk flagged for this branch is not present in the current code.
