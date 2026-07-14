import { ExampleItemRepository } from './contexts/_example/application/ports/ExampleItemRepository';
import { MongooseExampleItemRepository } from './contexts/_example/infrastructure/MongooseExampleItemRepository';
import { CategoryRepository } from './contexts/category/application/ports/CategoryRepository';
import { CategoryUseCases } from './contexts/category/application/CategoryUseCases';
import { SaveCategory } from './contexts/category/application/SaveCategory';
import { BulkSaveCategory } from './contexts/category/application/BulkSaveCategory';
import { FindCategories } from './contexts/category/application/FindCategories';
import { FindCategoryById } from './contexts/category/application/FindCategoryById';
import { DeleteCategory } from './contexts/category/application/DeleteCategory';
import { MongooseCategoryRepository } from './contexts/category/infrastructure/MongooseCategoryRepository';

export interface AppContainer {
    exampleItemRepository: ExampleItemRepository;
    category: CategoryUseCases;
}

export interface CompositionOptions {
    exampleItemRepository?: ExampleItemRepository;
    categoryRepository?: CategoryRepository;
}

const buildCategoryUseCases = (repository: CategoryRepository): CategoryUseCases => ({
    saveCategory: new SaveCategory(repository),
    bulkSaveCategory: new BulkSaveCategory(repository),
    findCategories: new FindCategories(repository),
    findCategoryById: new FindCategoryById(repository),
    deleteCategory: new DeleteCategory(repository),
});

export const createCompositionRoot = (options: CompositionOptions = {}): AppContainer => ({
    exampleItemRepository: options.exampleItemRepository ?? new MongooseExampleItemRepository(),
    category: buildCategoryUseCases(options.categoryRepository ?? new MongooseCategoryRepository()),
});

let container: AppContainer | undefined;

/**
 * Lazy singleton entrypoint (design D1). `_routes.ts` calls
 * `getContainer().category` exactly once at module load to build
 * `createCategoryRouter(...)`, so the live app always gets one composition
 * root wired to the real Mongoose adapters. Unit/use-case tests never call
 * this — they construct use cases directly against
 * `InMemoryCategoryRepository`/`InMemoryExampleItemRepository`.
 */
export const getContainer = (): AppContainer => {
    if (!container) {
        container = createCompositionRoot();
    }
    return container;
};
