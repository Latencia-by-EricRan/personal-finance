import { Identity } from '../../../shared/domain/Identity';
import { BudgetRepository, BudgetView } from './ports/BudgetRepository';

/**
 * REAL hard delete (design D7) — budget has no `Archived`/soft-delete
 * analog, unlike account's `ArchiveAccount`. Mirrors legacy
 * `budget.service.ts`'s `findByIdAndDelete` semantics exactly.
 */
export class DeleteBudget {
    constructor(private readonly repository: BudgetRepository) {}

    async execute(id: string): Promise<BudgetView | null> {
        return this.repository.delete(Identity.create(id));
    }
}
