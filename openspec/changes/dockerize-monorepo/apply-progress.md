# Apply Progress: dockerize-monorepo

**Mode**: Strict TDD
**Delivery strategy**: auto-chain (per session decision) — one autonomous slice per apply batch
**Chain strategy**: stacked-to-qa (reconciled per tasks.md branch-model note)
**Branch**: `fix/back/onboarding-cors-port` (off `qa`)

## Completed Tasks

- [x] Task 1 — Fix CORS origin port in onboarding.mjs

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `back/scripts/onboarding.mjs` | Modified | Line 82: `CORS_ORIGINS=http://localhost:5173` → `CORS_ORIGINS=http://localhost:4200` |
| `back/scripts/onboarding.test.mjs` | Modified | Added assertion `expect(contents).toContain('CORS_ORIGINS=http://localhost:4200')` to the existing `'creates a private file containing only hashed credentials'` test |
| `openspec/changes/dockerize-monorepo/tasks.md` | Modified | Checked off Task 1 |

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1 | `back/scripts/onboarding.test.mjs` | Unit | ✅ 10/10 (baseline before edit) | ✅ Written — new assertion failed against pre-fix source (`Expected 'CORS_ORIGINS=http://localhost:4200'` vs received `...5173`) | ✅ Passed — 10/10 after one-line fix | ➖ Skipped: purely structural single-value config string, no branching/logic to generalize (exempt per strict-tdd.md) | ➖ None needed — one-line literal change, nothing to extract or clean |

### Test Summary
- **Total tests written**: 1 (new assertion added to existing test)
- **Total tests passing**: 10/10 (`onboarding.test.mjs`), 203/203 (full `back` suite via `npm test`)
- **Layers used**: Unit (1)
- **Approval tests** (refactoring): None — no refactoring tasks
- **Pure functions created**: 0 (no new functions; existing `createEnvironment` template literal edited)

## Verification against tasks.md "Done when" criteria

- `cd back && npm test` (vitest run) passes, including the new assertion — ✅ 22 files / 203 tests passed
- `rg "5173" back/scripts/onboarding.mjs` returns no matches — ✅ confirmed
- `rg "CORS_ORIGINS=http://localhost:4200" back/scripts/onboarding.mjs` matches — ✅ confirmed

## Deviations from Design

None — implementation matches design.md and tasks.md exactly (one-line fix, one new assertion).

## Issues Found

None.

## Remaining Tasks

- [ ] Task 2 — DI token + environment-aware API base URL wiring (Angular-side only, no Docker)
- [ ] Task 3 — web/Dockerfile + web/.dockerignore
- [ ] Task 4 — Root docker-compose.yml (full-stack orchestration)

## Workload / PR Boundary

- Mode: stacked PR slice (auto-chain)
- Current work unit: Task 1 — Fix CORS origin port in onboarding.mjs
- Boundary: starts from `qa`, ends at this single-file fix + its test; independent, no dependency on Tasks 2-4
- Estimated review budget impact: ~5 changed lines — well under the 400-line budget

## Status

1/4 tasks complete. Ready for next batch (Task 2) or for a scoped PR/commit of this slice.
