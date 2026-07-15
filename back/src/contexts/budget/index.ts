export { default as BudgetModel } from './infrastructure/BudgetModel';
export type { BudgetView } from './application/ports/BudgetRepository';

// NOTE: still unwired (PR2a is additive-only) — nothing in composition-root
// or _routes.ts references these exports yet. `getBudgetStatus` and the
// `MovementGateway` port are added in PR2b; HTTP wiring lands in PR3.
