// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/movement/infrastructure/MovementModel.ts` (the ONLY place that
// calls `mongoose.model('Movement', schema)`). This re-export keeps existing
// consumers (account.service.ts, budget.service.ts, recurring.service.ts,
// e2e suites, scripts/seed.ts) working without a double registration, which
// would throw `OverwriteModelError`. (`report.service.ts` was repointed
// straight to the `contexts/movement` barrel in PR4 and the layer-first
// `movement.service.ts` was deleted in the same PR — neither uses this shim
// anymore.)
export { default } from '../../contexts/movement/infrastructure/MovementModel';
