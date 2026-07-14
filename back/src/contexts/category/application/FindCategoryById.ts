import { Identity } from '../../../shared/domain/Identity';
import { Category } from '../domain/Category';
import { CategoryRepository } from './ports/CategoryRepository';

export class FindCategoryById {
    constructor(private readonly repository: CategoryRepository) {}

    async execute(id: string): Promise<Category | null> {
        return this.repository.findById(Identity.create(id));
    }
}
