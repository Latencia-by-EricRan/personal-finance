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
 * 1:1. `getBudgetStatus` is now included (PR2b) alongside the 5 CRUD use
 * cases from PR2a — still unwired until PR3's composition-root/`_routes.ts`
 * changes land.
 */
export interface BudgetUseCases {
    findBudgets: FindBudgets;
    findBudgetById: FindBudgetById;
    createBudget: CreateBudget;
    updateBudget: UpdateBudget;
    deleteBudget: DeleteBudget;
    getBudgetStatus: GetBudgetStatus;
}
