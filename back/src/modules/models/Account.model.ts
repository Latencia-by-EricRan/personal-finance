// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/account/infrastructure/AccountModel.ts` (the ONLY place that
// calls `mongoose.model('Account', schema)`). This re-export keeps existing
// consumers (account.service.ts, recurring.service.ts, e2e suites,
// scripts/seed.ts) working without a double registration, which would throw
// `OverwriteModelError`. `Recurring.model.ts`'s `ref:'Account'` and
// `MovementModel.ts`'s `ref:'Account'` are string refs resolved by the
// preserved registration name, so they are unaffected by this shim too.
export { default } from '../../contexts/account/infrastructure/AccountModel';
