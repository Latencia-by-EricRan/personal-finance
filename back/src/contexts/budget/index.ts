export { default as BudgetModel } from './infrastructure/BudgetModel';

/**
 * Read-model stub for the `budget` context's CRUD read path (design D2/D3).
 * `Category` is intentionally `unknown`: on find/findById it is the FULL
 * populated Category sub-document (`.populate('Category')`), while on
 * create/update it is the bare Category id string — both are echoed
 * verbatim, so no narrower type is safe here yet. This is a PR1 placeholder;
 * PR2a replaces it with the real type re-exported from
 * `./application/ports/BudgetRepository` once that port exists.
 */
export interface BudgetView {
    _id: string;
    Category: unknown;
    Month: number;
    Year: number;
    Limit: number;
    createdAt?: Date;
    updatedAt?: Date;
}
