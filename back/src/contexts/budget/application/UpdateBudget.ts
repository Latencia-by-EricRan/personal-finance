import { Identity } from '../../../shared/domain/Identity';
import { BudgetPatch, BudgetRepository, BudgetView } from './ports/BudgetRepository';

export class UpdateBudget {
    constructor(private readonly repository: BudgetRepository) {}

    async execute(id: string, patch: BudgetPatch): Promise<BudgetView | null> {
        return this.repository.update(Identity.create(id), patch);
    }
}
