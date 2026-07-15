import { BudgetRepository, BudgetView, Pagination } from './ports/BudgetRepository';

export class FindBudgets {
    constructor(private readonly repository: BudgetRepository) {}

    async execute(filter: Record<string, unknown>, pagination?: Pagination): Promise<BudgetView[]> {
        return this.repository.find(filter, pagination);
    }
}
