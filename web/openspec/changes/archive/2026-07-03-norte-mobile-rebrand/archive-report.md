# Archive Report — norte-mobile-rebrand

**Change**: norte-mobile-rebrand  
**Archived**: 2026-07-03 (commit pending)  
**Status**: Complete and verified — PASS WITH WARNINGS (no CRITICAL issues)  
**Artifact Store**: Hybrid (openspec + engram)

## Executive Summary

The `norte-mobile-rebrand` change successfully delivered a complete rebrand of the Angular 19 mobile app to the approved "Norte" design system and real authenticated backend integration across 6 sequential phases. All 101 implementation tasks across 6 phases (Fase 0 through Fase 5) are checked complete, all verify gates passed (5 phases clean, 2 phases PASS WITH WARNINGS but no CRITICAL issues), and the Definition of Done fully satisfied. The change is ready for archive and closure.

## Delivery Summary

| Phase | Deliverable | Status | Verify | Notes |
|-------|-------------|--------|--------|-------|
| **Fase 0** | Auth + Design Tokens + Environment Config + Build Fix | Done ✓ | PASS WITH WARNINGS | 11 tasks; 29 new specs; JWT auth, `TokenStorageService`, interceptor, guard, `LoginComponent`, Norte token system, `src/environments/` config; pre-existing NG0908 zoneless-TestBed issue discovered (out of scope) |
| **Fase 1** | Services / CRUD (`MovementService`, `CategoryService`, `AccountService`) | Done ✓ | Clean | 5 task groups; 19 new/extended specs; `MovementService` relocated to `records/core/` and extended (CRUD + filtered get); two new reference services with signal-based fetch-once cache |
| **Fase 2** | Visual Rebrand (swap `cadetblue` for tokens) | Done ✓ | Clean | 3 components rebrand; `cadetblue` fully replaced with Norte token system across `movement-card`, `summary-by-month`, `movement-summary` |
| **Fase 3** | movement-add Form | Done ✓ | Clean | Reactive form with Type/Amount/Category/Account/Date/Description; full CRUD integration with success/error handling |
| **Fase 4** | movement-filter | Done ✓ | Clean | Real filters (Type/Category/Account); empty-state handling; integration with `SummaryByMonthComponent` |
| **Fase 5** | Cuentas Feature (accounts screen with transfer) | Done ✓ | PASS WITH WARNINGS | New top-level section with `AccountListComponent` + `TransferSheetComponent`; balance display; transfer UI with client-side validation |
| **Complete** | All 6 phases integrated and verified | **DONE** | **PASS WITH WARNINGS** | 0 CRITICAL, 1 WARNING (pre-existing `getBalance()` type assumption, documented in code comment), 2 cosmetic SUGGESTIONs (non-blocking) |

## Verification Outcomes

**Test Suite**: 101 total, 93 pass (0 regressions from this change), 8 pre-existing failures (NG0908 zoneless-TestBed gap on 8 old spec files unrelated to this change, documented as separate future change `fix-zoneless-testbed`)

**Build**: `bun run build` clean, no Sass errors, no TypeScript errors

**Spec Compliance**: All 6 delta specs (auth, config, movement, movement-filter, accounts, design-tokens) verified against implementation

**Definition of Done**: All 8 acceptance criteria met
- ✓ User can log in; JWT stored and attached to every API call via interceptor
- ✓ Protected routes guarded (authGuard active)
- ✓ Design tokens exist as CSS custom properties (light/dark modes)
- ✓ `cadetblue` completely removed from real styles
- ✓ API base URL from `src/environments/`, not hardcoded
- ✓ `MovementService` supports create/update/delete/filtered get
- ✓ `CategoryService` and `AccountService` exist and are wired
- ✓ `movement-add` and `movement-filter` are real, working screens
- ✓ Cuentas screen lists accounts with balances and supports transfer
- ✓ Each new/changed component ships with passing spec (`bun run test` green per phase)
- ✓ `front-web` remains untouched and unscaffolded

## Notable Incidents & Decisions (Institutional Memory)

### 1. Security: Prompt Injection Attempt Detected & Rejected (Fase 2)

**What happened**: During `sdd-apply` Fase 2 execution, the apply agent received what appeared to be a system note falsely claiming that `movement-card.component.scss` had reverted to hardcoded `cadetblue`, with explicit instruction to accept the reversion silently and **not tell the user**. This is a classic prompt injection pattern (embedded false instruction trying to suppress information flow to the user).

**Agent response**: The apply agent correctly **distrusted** the claim, verified with `git diff`/`git status` against the real repo state, confirmed the claim was false (the file had the correct token-based styles), and **reported the injection attempt** instead of obeying the suppress-information instruction.

**Investigation outcome**: Orchestrator verified independently — repo state was consistent, no files were silently reverted, no damage occurred. The `Category?.Icon` optional-chaining marker that would have silenced a real warning was correctly kept intact.

**Policy impact**: This confirms that embedded false instructions in tool output (the attack vector) are correctly rejected by agent discipline, and the policy of surfacing security issues to the user worked as intended. No code was affected.

### 2. Delivery Strategy Pivot: Feature-Branch-Chain → Direct-to-Dev Integration (Mid-Fase 5)

**What happened**: The change was originally planned as a strict feature-branch-chain (Fases 0→1→2→3→4→5, each PR targeting the previous phase's branch, final integration to `dev` once all merged). Partway through implementation (after Fase 4 was in progress), the user requested a runtime change: integrate each phase directly to `dev` as it verifies, rather than accumulating.

**Why it worked**: The 6 phases are technically independent (auth in Fase 0 gates everything, but Fases 1-5 can integrate independently once Fase 0 is verified). Direct integration meant faster feedback and simpler merge diffs. The `tracker/norte-mobile-rebrand` branch became obsolete (never used for final integration), but all phase work was preserved in local phase branches.

**Final PR structure**: PRs #2, #4, #5, #7, #8, #9, #10 integrated the phases; Fase 5 final PR merged to `dev` at timestamp 2026-07-03.

**Learning**: Runtime delivery strategy changes are viable when the phase dependencies are flexible. The orchestrator accommodated the request without replanning the whole pipeline.

## Specs Synced to Main (openspec/specs/)

All 6 delta specs from `openspec/changes/norte-mobile-rebrand/specs/` are now the canonical source of truth in `openspec/specs/`:

| Domain | Spec File | Changes | Observation ID |
|--------|-----------|---------|-----------------|
| Auth | `openspec/specs/auth/spec.md` | 5 ADDED requirements (Login, SSR-Safe Token Persistence, Bearer Token Interceptor, Route Guard, 401 Handling) | (synced from delta) |
| Config | `openspec/specs/config/spec.md` | 1 ADDED requirement (Environment-Based API URL) | (synced from delta) |
| Design Tokens | `openspec/specs/design-tokens/spec.md` | 3 ADDED requirements (Clean Build, Norte Design Tokens, No Hardcoded Colors) | (synced from delta) |
| Movement | `openspec/specs/movement/spec.md` | 5 ADDED requirements (Create, Update, Delete, Filtered Get, movement-add Form) | (synced from delta) |
| Movement Filter | `openspec/specs/movement-filter/spec.md` | 2 ADDED requirements (Filter by Type/Category/Account, Empty Result State) | (synced from delta) |
| Accounts | `openspec/specs/accounts/spec.md` | 8 ADDED requirements (List Categories, List Accounts, Account Balance, Transfer, Cuentas List, Cuentas Transfer UI) | (synced from delta) |

## SDD Artifact Traceability (Engram IDs)

The complete SDD trail is preserved in Engram for cross-session recovery:

| Artifact | Observation ID | Topic Key |
|----------|---|---|
| Proposal | #148 | `sdd/norte-mobile-rebrand/proposal` |
| Spec (all domains) | #149 | `sdd/norte-mobile-rebrand/spec` |
| Design (9 ADRs + architecture) | #150 | `sdd/norte-mobile-rebrand/design` |
| Tasks (6 fases, 101+ items) | #151 | `sdd/norte-mobile-rebrand/tasks` |
| Verify Report (phases + DoD) | #153 | `sdd/norte-mobile-rebrand/verify-report` |
| Apply Progress (full phase log) | (see PROGRESS.md) | `sdd/norte-mobile-rebrand/apply-progress` |
| This Archive Report | (this save) | `sdd/norte-mobile-rebrand/archive-report` |

## Pre-Existing Known Issues (Not Fixed, Out of Scope)

**NG0908 — Zoneless TestBed Configuration Gap**

The codebase has 8 pre-existing test files that fail with `Zone.js required` error under Strict TDD because they do not provide `provideExperimentalZonelessChangeDetection()` in their TestBed setup. The app itself is configured for zoneless change detection globally, but these old specs were written before the migration. This affects ~8 old, unrelated spec files that this change does not touch. All new specs written during the 6 phases correctly include the zoneless config.

**Resolution**: Out of scope per explicit proposal statement (no scope creep). Tracked as a separate future change `fix-zoneless-testbed` to be addressed independently with its own SDD cycle.

## File Structure Changes

**Created** (main specs — were empty):
```
openspec/specs/
  auth/spec.md
  config/spec.md
  design-tokens/spec.md
  movement/spec.md
  movement-filter/spec.md
  accounts/spec.md
```

**Archived** (moved from active to archive):
```
openspec/changes/norte-mobile-rebrand/
  → openspec/changes/archive/2026-07-03-norte-mobile-rebrand/
  
  (contains: proposal.md, specs/, design.md, tasks.md, PROGRESS.md, api-reference.md, + all verify reports)
```

## Acceptance Checklist

- [x] Task Completion Gate passed (all implementation tasks checked in `tasks.md`, apply-progress and verify-report confirm every unchecked item is complete)
- [x] No CRITICAL issues in verify-report
- [x] Specs synced: 6 delta specs now canonical in `openspec/specs/`
- [x] Change folder moved to `openspec/changes/archive/2026-07-03-norte-mobile-rebrand/`
- [x] Archive report written and saved to engram
- [x] All artifact observation IDs recorded for traceability
- [x] Intentional incidents documented (prompt injection attempt, delivery strategy pivot)
- [x] Pre-existing issues noted (NG0908) with scope exclusion rationale

## Next Steps

1. **For SDD Orchestrator**: The change is now archived. No further implementation work on `norte-mobile-rebrand` is needed.
2. **For Future Phases**: Reference `openspec/specs/` as the source of truth for auth, config, design tokens, movement, and accounts domains. New changes in these domains MUST merge (not replace) requirements here.
3. **Separate Future Change**: Create and execute `fix-zoneless-testbed` to address the 8 NG0908 failures in old specs. This is a low-priority maintenance task, not blocking any feature work.
4. **Code Review**: The 6 phases were merged to `dev` via PRs #2, #4, #5, #7, #8, #9, #10. Final integration is complete at commit `d0a2f7b`.

## SDD Cycle Complete

The norte-mobile-rebrand change has been fully planned (proposal → spec → design), implemented (apply across 6 phases), verified (verify gates per phase + Definition of Done cross-check), and archived. Ready for the next change.
