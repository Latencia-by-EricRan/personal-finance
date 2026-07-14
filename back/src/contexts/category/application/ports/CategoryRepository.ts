import { Identity } from '../../../../shared/domain/Identity';
import { Category } from '../../domain/Category';

/**
 * Application-layer pagination shape. Deliberately NOT imported from
 * `src/utils/controller.util.ts` (which pulls in `express.Request`) to keep
 * the application layer framework-free, per the same "driver-free port"
 * principle as `BulkUpsertResult` below (design D3).
 */
export interface Pagination {
    limit: number;
    skip: number;
}

/**
 * Application-layer DTO mirroring the fields the current wire response
 * exposes for `POST /category/save`. Contains NO `mongodb` import — the only
 * adapter aware of the driver's `BulkWriteResult` type is
 * `MongooseCategoryRepository`, which maps it to this DTO internally
 * (design D3).
 */
export interface BulkUpsertResult {
    insertedCount: number;
    matchedCount: number;
    modifiedCount: number;
    deletedCount: number;
    upsertedCount: number;
    upsertedIds: Record<number, string>;
    insertedIds: Record<number, string>;
}

/**
 * Bespoke port for `category` (not the generic `Repository<T, Id>`):
 * category's real current behavior is upsert-by-business-key (Tag or Name),
 * batch bulk write, and filtered/paginated find — none of which fit
 * `save(entity): Promise<void>` (see explore #208 / design D3).
 */
export interface CategoryRepository {
    upsert(category: Category): Promise<Category>;
    bulkUpsert(categories: Category[]): Promise<BulkUpsertResult>;
    find(filter: Record<string, unknown>, pagination?: Pagination): Promise<Category[]>;
    findById(id: Identity): Promise<Category | null>;
    delete(id: Identity): Promise<Category | null>;
}
