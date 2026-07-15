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
import { AccountRepository } from './contexts/account/application/ports/AccountRepository';
import { MovementGateway } from './contexts/account/application/ports/MovementGateway';
import { AccountUseCases } from './contexts/account/application/AccountUseCases';
import { FindAccounts } from './contexts/account/application/FindAccounts';
import { FindAccountById } from './contexts/account/application/FindAccountById';
import { CreateAccount } from './contexts/account/application/CreateAccount';
import { UpdateAccount } from './contexts/account/application/UpdateAccount';
import { ArchiveAccount } from './contexts/account/application/ArchiveAccount';
import { GetAccountBalance } from './contexts/account/application/GetAccountBalance';
import { Transfer } from './contexts/account/application/Transfer';
import { MongooseAccountRepository } from './contexts/account/infrastructure/MongooseAccountRepository';
import { MongooseMovementGateway } from './contexts/account/infrastructure/MongooseMovementGateway';
import { BudgetRepository } from './contexts/budget/application/ports/BudgetRepository';
import { MovementGateway as BudgetMovementGateway } from './contexts/budget/application/ports/MovementGateway';
import { BudgetUseCases } from './contexts/budget/application/BudgetUseCases';
import { FindBudgets } from './contexts/budget/application/FindBudgets';
import { FindBudgetById } from './contexts/budget/application/FindBudgetById';
import { CreateBudget } from './contexts/budget/application/CreateBudget';
import { UpdateBudget } from './contexts/budget/application/UpdateBudget';
import { DeleteBudget } from './contexts/budget/application/DeleteBudget';
import { GetBudgetStatus } from './contexts/budget/application/GetBudgetStatus';
import { MongooseBudgetRepository } from './contexts/budget/infrastructure/MongooseBudgetRepository';
import { MongooseMovementGateway as MongooseBudgetMovementGateway } from './contexts/budget/infrastructure/MongooseMovementGateway';

export interface AppContainer {
    exampleItemRepository: ExampleItemRepository;
    category: CategoryUseCases;
    movement: MovementUseCases;
    account: AccountUseCases;
    budget: BudgetUseCases;
}

export interface CompositionOptions {
    exampleItemRepository?: ExampleItemRepository;
    categoryRepository?: CategoryRepository;
    movementRepository?: MovementRepository;
    accountRepository?: AccountRepository;
    movementGateway?: MovementGateway;
    budgetRepository?: BudgetRepository;
    budgetMovementGateway?: BudgetMovementGateway;
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

// Only builder taking a second dependency: getAccountBalance/transfer need
// the MovementGateway seam to read/write movement persistence (see
// application/ports/MovementGateway.ts), unlike category/movement's
// single-repository use cases.
const buildAccountUseCases = (repository: AccountRepository, gateway: MovementGateway): AccountUseCases => ({
    findAccounts: new FindAccounts(repository),
    findAccountById: new FindAccountById(repository),
    createAccount: new CreateAccount(repository),
    updateAccount: new UpdateAccount(repository),
    archiveAccount: new ArchiveAccount(repository),
    getAccountBalance: new GetAccountBalance(repository, gateway),
    transfer: new Transfer(repository, gateway),
});

// Second builder taking a second dependency (mirrors buildAccountUseCases):
// getBudgetStatus needs the budget-local, read-only MovementGateway seam to
// read egreso movements for its Spent/Remaining/Percent computation (design
// D5/D11), unlike category/movement's single-repository use cases.
const buildBudgetUseCases = (repository: BudgetRepository, gateway: BudgetMovementGateway): BudgetUseCases => ({
    findBudgets: new FindBudgets(repository),
    findBudgetById: new FindBudgetById(repository),
    createBudget: new CreateBudget(repository),
    updateBudget: new UpdateBudget(repository),
    deleteBudget: new DeleteBudget(repository),
    getBudgetStatus: new GetBudgetStatus(repository, gateway),
});

export const createCompositionRoot = (options: CompositionOptions = {}): AppContainer => ({
    exampleItemRepository: options.exampleItemRepository ?? new MongooseExampleItemRepository(),
    category: buildCategoryUseCases(options.categoryRepository ?? new MongooseCategoryRepository()),
    movement: buildMovementUseCases(options.movementRepository ?? new MongooseMovementRepository()),
    account: buildAccountUseCases(
        options.accountRepository ?? new MongooseAccountRepository(),
        options.movementGateway ?? new MongooseMovementGateway(),
    ),
    budget: buildBudgetUseCases(
        options.budgetRepository ?? new MongooseBudgetRepository(),
        options.budgetMovementGateway ?? new MongooseBudgetMovementGateway(),
    ),
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
