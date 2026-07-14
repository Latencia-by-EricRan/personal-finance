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
import { MovementRepository } from './contexts/movement/application/ports/MovementRepository';
import { MovementUseCases } from './contexts/movement/application/MovementUseCases';
import { CreateMovement } from './contexts/movement/application/CreateMovement';
import { UpdateMovement } from './contexts/movement/application/UpdateMovement';
import { DeleteMovement } from './contexts/movement/application/DeleteMovement';
import { FindMovements } from './contexts/movement/application/FindMovements';
import { SaveManyMovements } from './contexts/movement/application/SaveManyMovements';
import { GetMonthlySummary } from './contexts/movement/application/GetMonthlySummary';
import { MongooseMovementRepository } from './contexts/movement/infrastructure/MongooseMovementRepository';

export interface AppContainer {
    exampleItemRepository: ExampleItemRepository;
    category: CategoryUseCases;
    movement: MovementUseCases;
}

export interface CompositionOptions {
    exampleItemRepository?: ExampleItemRepository;
    categoryRepository?: CategoryRepository;
    movementRepository?: MovementRepository;
}

const buildCategoryUseCases = (repository: CategoryRepository): CategoryUseCases => ({
    saveCategory: new SaveCategory(repository),
    bulkSaveCategory: new BulkSaveCategory(repository),
    findCategories: new FindCategories(repository),
    findCategoryById: new FindCategoryById(repository),
    deleteCategory: new DeleteCategory(repository),
});

const buildMovementUseCases = (repository: MovementRepository): MovementUseCases => ({
    createMovement: new CreateMovement(repository),
    updateMovement: new UpdateMovement(repository),
    deleteMovement: new DeleteMovement(repository),
    findMovements: new FindMovements(repository),
    saveManyMovements: new SaveManyMovements(repository),
    getMonthlySummary: new GetMonthlySummary(repository),
});

export const createCompositionRoot = (options: CompositionOptions = {}): AppContainer => ({
    exampleItemRepository: options.exampleItemRepository ?? new MongooseExampleItemRepository(),
    category: buildCategoryUseCases(options.categoryRepository ?? new MongooseCategoryRepository()),
    movement: buildMovementUseCases(options.movementRepository ?? new MongooseMovementRepository()),
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
