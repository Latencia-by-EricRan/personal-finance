import { Identity } from '../../../shared/domain/Identity';
import { RecurringRepository, RecurringView } from './ports/RecurringRepository';

/**
 * REAL hard delete — mirrors legacy `recurring.service.ts`'s
 * `findByIdAndDelete` semantics exactly (no `Archived`/soft-delete analog).
 */
export class DeleteRecurring {
    constructor(private readonly repository: RecurringRepository) {}

    async execute(id: string): Promise<RecurringView | null> {
        return this.repository.delete(Identity.create(id));
    }
}
