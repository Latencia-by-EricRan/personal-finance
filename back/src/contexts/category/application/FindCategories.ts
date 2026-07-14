import { Category } from '../domain/Category';
import { CategoryRepository, Pagination } from './ports/CategoryRepository';

export class FindCategories {
    constructor(private readonly repository: CategoryRepository) {}

    async execute(filter: Record<string, unknown>, pagination?: Pagination): Promise<Category[]> {
        return this.repository.find(filter, pagination);
    }
}
