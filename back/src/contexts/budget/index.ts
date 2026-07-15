export { default as BudgetModel } from './infrastructure/BudgetModel';
export type { BudgetView } from './application/ports/BudgetRepository';
export type { BudgetStatus } from './application/GetBudgetStatus';

// Wired (PR3): `composition-root.ts` builds `container.budget` from
// `MongooseBudgetRepository` + `MongooseMovementGateway`, and `_routes.ts`
// mounts `createBudgetRouter(getContainer().budget)` at `/budget`, replacing
// the legacy `modules/routes/budget.route.ts` (design D1/D11).
