import { Category, CategoryProps } from '../domain/Category';
import { BulkUpsertResult, CategoryRepository } from './ports/CategoryRepository';

/**
 * Typed error the HTTP controller (wired in PR3) maps to the existing 400
 * `Validation failed` response, mirroring the wording
 * `validateArrayBody`/`category.validator.ts` uses today. Batch dedup is
 * business logic of the batch operation itself (mongo's `bulkWrite` upserts
 * would otherwise silently last-write-wins), so it belongs to this use case,
 * not the HTTP validator (design D2).
 */
export class DuplicateCategoryKeyError extends Error {
    constructor(
        public readonly key: string,
        public readonly indexes: number[],
    ) {
        super(`Duplicate Tag/Name "${key}" at indexes [${indexes.join(', ')}]`);
        this.name = 'DuplicateCategoryKeyError';
    }
}

export class BulkSaveCategory {
    constructor(private readonly repository: CategoryRepository) {}

    async execute(inputs: CategoryProps[]): Promise<BulkUpsertResult> {
        const categories = inputs.map((input) => Category.create(input));

        this.assertNoDuplicateKeys(categories);

        return this.repository.bulkUpsert(categories);
    }

    private assertNoDuplicateKeys(categories: Category[]): void {
        const keyToIndexes = new Map<string, number[]>();

        categories.forEach((category, index) => {
            const naturalKey = category.naturalKey();
            const key = 'Tag' in naturalKey ? naturalKey.Tag : naturalKey.Name;
            const indexes = keyToIndexes.get(key) ?? [];
            indexes.push(index);
            keyToIndexes.set(key, indexes);
        });

        for (const [key, indexes] of keyToIndexes) {
            if (indexes.length > 1) {
                throw new DuplicateCategoryKeyError(key, indexes);
            }
        }
    }
}
