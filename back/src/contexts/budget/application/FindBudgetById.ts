import { Identity } from '../../../shared/domain/Identity';
import { BudgetRepository, BudgetView } from './ports/BudgetRepository';

export class FindBudgetById {
    constructor(private readonly repository: BudgetRepository) {}

    async execute(id: string): Promise<BudgetView | null> {
        return this.repository.findById(Identity.create(id));
    }
}
