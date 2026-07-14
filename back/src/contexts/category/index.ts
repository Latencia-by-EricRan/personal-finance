export { default as CategoryModel } from './infrastructure/CategoryModel';

/**
 * Read-model shape for other bounded contexts that only need the plain
 * persisted category fields (e.g. `report.service.ts`'s
 * `.populate('Category')` result, wired in PR3 per design D5), without
 * depending on the legacy `CategoryI` interface or reaching into
 * `contexts/category`'s internal document/domain types.
 */
export interface CategoryView {
    Description: string;
    Name: string;
    Tag: string;
    Type: 'variable' | 'fijo';
    Icon?: string;
}
