import { Recurring, RecurringProps } from '../domain/Recurring';
import { RecurringRepository, RecurringView } from './ports/RecurringRepository';

export class CreateRecurring {
    constructor(private readonly repository: RecurringRepository) {}

    async execute(props: RecurringProps): Promise<RecurringView> {
        const recurring = Recurring.create(props);

        return this.repository.create(recurring);
    }
}
