// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/budget/infrastructure/BudgetModel.ts` (the ONLY place that
// calls `mongoose.model('Budget', schema)`). `budget.service.ts` was deleted
// in PR4; the remaining direct consumer of this shim is `budget.e2e.test.ts`,
// kept working without a double registration, which would throw
// `OverwriteModelError`. `Category`'s `ref:'Category'` is a string ref
// resolved by the preserved registration name, so it is unaffected by this
// shim too.
export { default } from '../../contexts/budget/infrastructure/BudgetModel';
