// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/account/infrastructure/AccountModel.ts` (the ONLY place that
// calls `mongoose.model('Account', schema)`). This re-export keeps existing
// consumers (scripts/seed.ts, scripts/backfill-movement-accounts.ts, e2e
// suites) working without a double registration, which would throw
// `OverwriteModelError`. `Recurring.model.ts`'s `ref:'Account'` and
// `MovementModel.ts`'s `ref:'Account'` are string refs resolved by the
// preserved registration name, so they are unaffected by this shim too.
// (The layer-first `account.service.ts` was deleted in PR4 and no longer
// uses this shim.)
export { default } from '../../contexts/account/infrastructure/AccountModel';
