import { Budget, BudgetProps } from '../domain/Budget';
import { BudgetRepository, BudgetView } from './ports/BudgetRepository';

export class CreateBudget {
    constructor(private readonly repository: BudgetRepository) {}

    async execute(props: BudgetProps): Promise<BudgetView> {
        const budget = Budget.create(props);

        return this.repository.create(budget);
    }
}
