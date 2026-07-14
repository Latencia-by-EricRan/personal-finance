// Compatibility shim: the canonical Mongoose model registration now lives in
// `src/contexts/category/infrastructure/CategoryModel.ts` (the ONLY place that
// calls `mongoose.model('Category', schema)`). This re-export keeps existing
// consumers (e2e suites, `scripts/seed.ts`, layer-first `category.service.ts`)
// working without a double registration, which would throw `OverwriteModelError`.
export { default } from '../../contexts/category/infrastructure/CategoryModel';
