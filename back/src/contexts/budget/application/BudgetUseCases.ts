import { CreateBudget } from './CreateBudget';
import { DeleteBudget } from './DeleteBudget';
import { FindBudgetById } from './FindBudgetById';
import { FindBudgets } from './FindBudgets';
import { GetBudgetStatus } from './GetBudgetStatus';
import { UpdateBudget } from './UpdateBudget';

/**
 * Aggregate of budget use cases exposed by the composition root (wired in
 * PR3, `container.budget`) and consumed by the HTTP inbound adapter. Neither
 * side depends on the other's construction details — the composition root
 * builds this shape from `MongooseBudgetRepository` + `MongooseMovementGateway`
 * (budget-local, PR2b), the HTTP adapter only calls `.execute(...)` on each
 * use case. Mirrors `AccountUseCases`/`MovementUseCases`/`CategoryUseCases`
 * 1:1. `getBudgetStatus` was added in PR2b alongside the 5 CRUD use cases
 * from PR2a; PR3 wires this shape into `composition-root.ts`/`_routes.ts`.
 */
export interface BudgetUseCases {
    findBudgets: FindBudgets;
    findBudgetById: FindBudgetById;
    createBudget: CreateBudget;
    updateBudget: UpdateBudget;
    deleteBudget: DeleteBudget;
    getBudgetStatus: GetBudgetStatus;
}
