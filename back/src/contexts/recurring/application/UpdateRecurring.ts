import { Identity } from '../../../shared/domain/Identity';
import { RecurringPatch, RecurringRepository, RecurringView } from './ports/RecurringRepository';

export class UpdateRecurring {
    constructor(private readonly repository: RecurringRepository) {}

    async execute(id: string, patch: RecurringPatch): Promise<RecurringView | null> {
        return this.repository.update(Identity.create(id), patch);
    }
}
