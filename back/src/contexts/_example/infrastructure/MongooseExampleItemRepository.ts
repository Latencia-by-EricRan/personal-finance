import { Identity } from '../../../shared/domain/Identity';
import { ExampleItem } from '../domain/ExampleItem';
import { ExampleItemRepository } from '../application/ports/ExampleItemRepository';
import { ExampleItemMapper } from './ExampleItemMapper';
import ExampleItemModel from './ExampleItemModel';

export class MongooseExampleItemRepository implements ExampleItemRepository {
    private readonly mapper = new ExampleItemMapper();

    async save(entity: ExampleItem): Promise<void> {
        const document = this.mapper.toPersistence(entity);

        await ExampleItemModel.findByIdAndUpdate(
            document._id,
            { Name: document.Name, Quantity: document.Quantity },
            { upsert: true },
        );
    }

    async findById(id: Identity): Promise<ExampleItem | null> {
        const document = await ExampleItemModel.findById(id.toObjectId()).lean();

        return document ? this.mapper.toDomain(document) : null;
    }

    async delete(id: Identity): Promise<void> {
        await ExampleItemModel.findByIdAndDelete(id.toObjectId());
    }
}
