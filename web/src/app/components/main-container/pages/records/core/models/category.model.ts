// Re-export: ICategory/TypeCategory canonical home is src/app/core/reference/category
// (ADR-4) — categories are cross-section reference data (records + cuentas), so
// records/core keeps only a re-export to avoid a duplicate type definition.
export * from '../../../../../../core/reference/category/category.model';
