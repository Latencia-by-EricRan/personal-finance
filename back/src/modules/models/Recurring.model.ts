// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/recurring/infrastructure/RecurringModel.ts` (the ONLY place
// that calls `mongoose.model('Recurring', schema)`). This re-export keeps
// existing consumers (e2e suites) working without a double registration,
// which would throw `OverwriteModelError` (see `Account.model.ts`/
// `Category.model.ts`/`Movement.model.ts`/`Budget.model.ts` for the same
// precedent).
// (The layer-first `recurring.service.ts`/`recurring.interface.ts` were
// deleted in PR1b and no longer use this shim.)
export { default } from '../../contexts/recurring/infrastructure/RecurringModel';
