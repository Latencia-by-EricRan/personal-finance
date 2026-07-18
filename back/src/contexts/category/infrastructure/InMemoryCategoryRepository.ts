import { Identity } from '../../../shared/domain/Identity';
import { Category, CategoryType } from '../domain/Category';
import { BulkUpsertResult, CategoryRepository, Pagination } from '../application/ports/CategoryRepository';

export class InMemoryCategoryRepository implements CategoryRepository {
    private readonly categories = new Map<string, Category>();

    async upsert(category: Category): Promise<Category> {
        const existing = this.findByNaturalKey(category);
        const saved = this.rehydrateWithId(existing?.id ?? Identity.create(Identity.generate()), category);

        this.categories.set(saved.id!.value, saved);

        return saved;
    }

    async bulkUpsert(categories: Category[]): Promise<BulkUpsertResult> {
        const result: BulkUpsertResult = {
            insertedCount: 0,
            matchedCount: 0,
            modifiedCount: 0,
            deletedCount: 0,
            upsertedCount: 0,
            upsertedIds: {},
            insertedIds: {},
        };

        categories.forEach((category, index) => {
            const existing = this.findByNaturalKey(category);

            if (existing) {
                result.matchedCount += 1;
                result.modifiedCount += 1;
                const saved = this.rehydrateWithId(existing.id!, category);
                this.categories.set(saved.id!.value, saved);
                return;
            }

            const id = Identity.create(Identity.generate());
            result.upsertedCount += 1;
            result.upsertedIds[index] = id.value;
            const saved = this.rehydrateWithId(id, category);
            this.categories.set(saved.id!.value, saved);
        });

        return result;
    }

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<Category[]> {
        let items = Array.from(this.categories.values()).filter((category) => this.matchesFilter(category, filter));

        if (pagination) {
            items = items.slice(pagination.skip, pagination.skip + pagination.limit);
        }

        return items;
    }

    async findById(id: Identity): Promise<Category | null> {
        return this.categories.get(id.value) ?? null;
    }

    async delete(id: Identity): Promise<Category | null> {
        const existing = this.categories.get(id.value) ?? null;

        if (existing) {
            this.categories.delete(id.value);
        }

        return existing;
    }

    private rehydrateWithId(id: Identity, category: Category): Category {
        return Category.rehydrate(id, {
            Description: category.description,
            Name: category.name,
            Type: category.type,
            Tag: category.tag,
            Icon: category.icon,
            Color: category.color,
        });
    }

    private findByNaturalKey(category: Category): Category | undefined {
        const key = category.naturalKey();

        return Array.from(this.categories.values()).find((candidate) =>
            'Tag' in key ? candidate.tag === key.Tag : candidate.name === key.Name,
        );
    }

    private matchesFilter(category: Category, filter: Record<string, unknown>): boolean {
        return Object.entries(filter).every(([field, value]) => {
            switch (field as keyof { Tag: string; Name: string; Description: string; Type: CategoryType }) {
                case 'Tag':
                    return category.tag === value;
                case 'Name':
                    return category.name === value;
                case 'Description':
                    return category.description === value;
                case 'Type':
                    return category.type === value;
                default:
                    return true;
            }
        });
    }
}
