export { default as RecurringModel } from './infrastructure/RecurringModel';
export type { RecurringView } from './application/ports/RecurringRepository';
export { createRecurringRouter } from './infrastructure/http/recurring.route';
export type { RecurringUseCases } from './application/RecurringUseCases';

// Wired (PR1b): `composition-root.ts` builds `container.recurring` from
// `MongooseRecurringRepository` + `MongooseMovementGateway`, and `_routes.ts`
// mounts `createRecurringRouter(getContainer().recurring)` at `/recurring`,
// replacing the legacy `modules/routes/recurring.route.ts` (design D1/D12/D16).
