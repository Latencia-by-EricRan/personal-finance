import { BudgetRepository } from './ports/BudgetRepository';
import { MovementGateway } from './ports/MovementGateway';

export interface BudgetStatus {
    Category: unknown;
    Limit: number;
    Spent: number;
    Remaining: number;
    Percent: number;
}

/**
 * Mirrors `BudgetService.getStatus` 1:1 (design D6). `budgetRepository.find`
 * is reused (rather than a bespoke status query) because it already
 * `.populate('Category')`s (design D3), keeping the response's `Category`
 * field byte-identical to legacy's populated echo (design D2).
 *
 * The date-window (`gteDate`/`lteDate`) is copied CHARACTER-FOR-CHARACTER
 * from `budget.service.ts:48-49` — no timezone reinterpretation.
 */
export class GetBudgetStatus {
    constructor(
        private readonly budgetRepository: BudgetRepository,
        private readonly movementGateway: MovementGateway,
    ) {}

    async execute(month: number, year: number): Promise<BudgetStatus[]> {
        const budgets = await this.budgetRepository.find({ Month: month, Year: year });

        const gteDate = new Date(year, month - 1, 0);
        const lteDate = new Date(year, month, 0);

        return Promise.all(
            budgets.map(async (budget) => {
                const categoryId = String(
                    (budget.Category as { _id?: unknown } | null)?._id ?? budget.Category,
                );
                const movements = await this.movementGateway.findEgresoAmounts(categoryId, gteDate, lteDate);

                const Spent = movements.reduce((acc, movement) => acc + movement.Amount, 0);
                const Percent = budget.Limit > 0 ? (Spent / budget.Limit) * 100 : 0;

                return {
                    Category: budget.Category,
                    Limit: budget.Limit,
                    Spent,
                    Remaining: budget.Limit - Spent,
                    Percent,
                };
            }),
        );
    }
}
