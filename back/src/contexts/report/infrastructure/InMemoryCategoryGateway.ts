import { CategoryGateway, CategoryRefView } from '../application/ports/CategoryGateway';

/**
 * Array-backed fake used by report's use-case tests and one side of the
 * shared `CategoryGateway.contract.test.ts`. `seed` is a TEST-ONLY helper —
 * deliberately NOT part of the `CategoryGateway` interface (the real port is
 * read-only).
 */
export class InMemoryCategoryGateway implements CategoryGateway {
    private readonly categories: CategoryRefView[] = [];

    seed(category: CategoryRefView): void {
        this.categories.push(category);
    }

    async findByIds(ids: string[]): Promise<CategoryRefView[]> {
        const idSet = new Set(ids);
        return this.categories.filter((category) => idSet.has(category._id));
    }
}
