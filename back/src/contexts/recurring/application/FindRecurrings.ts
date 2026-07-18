import { Pagination, RecurringRepository, RecurringView } from './ports/RecurringRepository';

export class FindRecurrings {
    constructor(private readonly repository: RecurringRepository) {}

    async execute(filter: Record<string, unknown>, pagination?: Pagination): Promise<RecurringView[]> {
        return this.repository.find(filter, pagination);
    }
}
