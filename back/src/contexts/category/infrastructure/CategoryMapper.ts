import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Mapper } from '../../../shared/domain/Mapper';
import { Category } from '../domain/Category';
import { BulkUpsertResult } from '../application/ports/CategoryRepository';
import { CategoryDocument } from './CategoryModel';

export class CategoryMapper implements Mapper<Category, CategoryDocument> {
    toDomain(raw: CategoryDocument): Category {
        if (!raw._id) {
            throw new Error('Cannot map a CategoryDocument without a persisted _id to a domain Category');
        }

        // `raw._id` is typed as `Schema.Types.ObjectId` (a legacy typing
        // artifact inherited from `category.interface.ts`'s `CategoryI`,
        // where it actually refers to the SchemaType constructor, not the
        // runtime ObjectId value type). At runtime this is always a real
        // `mongoose.Types.ObjectId` instance, matching `Identity.fromObjectId`'s
        // parameter type.
        const id = Identity.fromObjectId(raw._id as unknown as Types.ObjectId);

        return Category.rehydrate(id, {
            Description: raw.Description,
            Name: raw.Name,
            Type: raw.Type,
            Tag: raw.Tag,
            Icon: raw.Icon,
        });
    }

    toPersistence(entity: Category): CategoryDocument {
        return {
            Description: entity.description,
            Name: entity.name,
            Tag: entity.tag,
            Type: entity.type,
            Icon: entity.icon,
        };
    }

    /**
     * Reconstructs the exact `POST /category/save` wire body from the
     * driver-free `BulkUpsertResult` DTO. The DTO already mirrors the 7 fields
     * the current live route serializes (see
     * `src/e2e/category-bulk.characterization.e2e.test.ts`), so this is an
     * identity passthrough today — its purpose is to be the single named seam
     * PR3's HTTP controller calls, so the wire-shape decision lives in one
     * place instead of being re-derived at the call site.
     */
    toBulkResponse(dto: BulkUpsertResult): BulkUpsertResult {
        return { ...dto };
    }
}
