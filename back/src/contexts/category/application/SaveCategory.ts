import { Category, CategoryProps } from '../domain/Category';
import { CategoryRepository } from './ports/CategoryRepository';

export class SaveCategory {
    constructor(private readonly repository: CategoryRepository) {}

    async execute(input: CategoryProps): Promise<Category> {
        const category = Category.create(input);

        return this.repository.upsert(category);
    }
}
