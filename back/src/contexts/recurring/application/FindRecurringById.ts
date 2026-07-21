import { Identity } from '../../../shared/domain/Identity';
import { RecurringRepository, RecurringView } from './ports/RecurringRepository';

export class FindRecurringById {
    constructor(private readonly repository: RecurringRepository) {}

    async execute(id: string): Promise<RecurringView | null> {
        return this.repository.findById(Identity.create(id));
    }
}
