import { Identity } from '../../../shared/domain/Identity';
import { ExampleItem } from '../domain/ExampleItem';
import { ExampleItemRepository } from '../application/ports/ExampleItemRepository';

export class InMemoryExampleItemRepository implements ExampleItemRepository {
    private readonly items = new Map<string, ExampleItem>();

    async save(entity: ExampleItem): Promise<void> {
        this.items.set(entity.id.value, entity);
    }

    async findById(id: Identity): Promise<ExampleItem | null> {
        return this.items.get(id.value) ?? null;
    }

    async delete(id: Identity): Promise<void> {
        this.items.delete(id.value);
    }
}
