import { MovementRepository, MovementView, Pagination } from './ports/MovementRepository';

export class FindMovements {
    constructor(private readonly repository: MovementRepository) {}

    async execute(
        filter: Record<string, unknown>,
        select?: string,
        pagination?: Pagination,
    ): Promise<MovementView[]> {
        return this.repository.find(filter, select, pagination);
    }
}
