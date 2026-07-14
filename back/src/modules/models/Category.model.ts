// Compatibility shim: the canonical Mongoose model registration lives in
// `src/contexts/category/infrastructure/CategoryModel.ts` (the ONLY place that
// calls `mongoose.model('Category', schema)`). This re-export keeps existing
// consumers (e2e suites for budget/category/recurring/report/movement,
// `scripts/seed.ts`) working without a double registration, which would throw
// `OverwriteModelError`. PR3 deleted the layer-first `category` module
// (`modules/{controllers,services,validators,routes,interfaces}/category*.ts`)
// that previously also depended on this shim; the remaining consumers listed
// above are outside this migration's scope (design D4), so this shim stays.
export { default } from '../../contexts/category/infrastructure/CategoryModel';
