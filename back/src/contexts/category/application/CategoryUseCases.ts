import { BulkSaveCategory } from './BulkSaveCategory';
import { DeleteCategory } from './DeleteCategory';
import { FindCategories } from './FindCategories';
import { FindCategoryById } from './FindCategoryById';
import { SaveCategory } from './SaveCategory';

/**
 * Aggregate of category use cases exposed by the composition root
 * (`composition-root.ts`'s `container.category`, design D1) and consumed by
 * the HTTP inbound adapter (`infrastructure/http/category.route.ts`). Neither
 * side depends on the other's construction details — the composition root
 * builds this shape from `MongooseCategoryRepository`, the HTTP adapter only
 * calls `.execute(...)` on each use case.
 */
export interface CategoryUseCases {
    saveCategory: SaveCategory;
    bulkSaveCategory: BulkSaveCategory;
    findCategories: FindCategories;
    findCategoryById: FindCategoryById;
    deleteCategory: DeleteCategory;
}
