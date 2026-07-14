// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/movement/infrastructure/MovementModel.ts` (the ONLY place that
// calls `mongoose.model('Movement', schema)`). This re-export keeps existing
// consumers (account.service.ts, recurring.service.ts, report.service.ts,
// e2e suites, scripts/seed.ts, layer-first `movement.service.ts`) working
// without a double registration, which would throw `OverwriteModelError`.
export { default } from '../../contexts/movement/infrastructure/MovementModel';
