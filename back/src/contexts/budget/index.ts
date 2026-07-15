export { default as BudgetModel } from './infrastructure/BudgetModel';
export type { BudgetView } from './application/ports/BudgetRepository';
export type { BudgetStatus } from './application/GetBudgetStatus';

// NOTE: still unwired (PR2a+PR2b are additive-only) — nothing in
// composition-root or _routes.ts references these exports yet. HTTP wiring
// (composition-root + `_routes.ts` flip) lands in PR3.
