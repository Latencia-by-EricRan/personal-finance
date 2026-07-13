import { Identity } from '../../../shared/domain/Identity';
import { Mapper } from '../../../shared/domain/Mapper';
import { ExampleItem } from '../domain/ExampleItem';
import { ExampleItemDocument } from './ExampleItemModel';

export class ExampleItemMapper implements Mapper<ExampleItem, ExampleItemDocument> {
    toDomain(raw: ExampleItemDocument): ExampleItem {
        return ExampleItem.create(Identity.fromObjectId(raw._id), raw.Name, raw.Quantity);
    }

    toPersistence(entity: ExampleItem): ExampleItemDocument {
        return {
            _id: entity.id.toObjectId(),
            Name: entity.name,
            Quantity: entity.quantity,
        };
    }
}
