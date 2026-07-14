import { BulkWriteResult } from 'mongodb';
import { Identity } from '../../../shared/domain/Identity';
import { Category } from '../domain/Category';
import { BulkUpsertResult, CategoryRepository, Pagination } from '../application/ports/CategoryRepository';
import { CategoryMapper } from './CategoryMapper';
import CategoryModel, { CategoryDocument } from './CategoryModel';

/**
 * Real adapter. The ONLY place in the codebase aware of the mongodb driver's
 * `BulkWriteResult` type — it maps it to the application-layer
 * `BulkUpsertResult` DTO internally, so the port and every use case stay
 * driver-free (design D3).
 */
export class MongooseCategoryRepository implements CategoryRepository {
    private readonly mapper = new CategoryMapper();

    async upsert(category: Category): Promise<Category> {
        const document = this.mapper.toPersistence(category);
        const filter = category.naturalKey();

        const updated = await CategoryModel.findOneAndUpdate(filter, document, { upsert: true, new: true }).lean();

        return this.mapper.toDomain(updated as CategoryDocument);
    }

    async bulkUpsert(categories: Category[]): Promise<BulkUpsertResult> {
        const operations = categories.map((category) => ({
            updateOne: {
                filter: category.naturalKey(),
                update: { $set: this.mapper.toPersistence(category) },
                upsert: true,
            },
        }));

        const result: BulkWriteResult = await CategoryModel.bulkWrite(operations);

        return {
            insertedCount: result.insertedCount,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            deletedCount: result.deletedCount,
            upsertedCount: result.upsertedCount,
            upsertedIds: this.stringifyIdMap(result.upsertedIds),
            insertedIds: this.stringifyIdMap(result.insertedIds),
        };
    }

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<Category[]> {
        const query = CategoryModel.find(filter);

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        const documents = await query.lean();

        return documents.map((document) => this.mapper.toDomain(document as CategoryDocument));
    }

    async findById(id: Identity): Promise<Category | null> {
        const document = await CategoryModel.findById(id.toObjectId()).lean();

        return document ? this.mapper.toDomain(document as CategoryDocument) : null;
    }

    async delete(id: Identity): Promise<Category | null> {
        const document = await CategoryModel.findByIdAndDelete(id.toObjectId()).lean();

        return document ? this.mapper.toDomain(document as CategoryDocument) : null;
    }

    private stringifyIdMap(idMap: Record<number, unknown>): Record<number, string> {
        return Object.fromEntries(Object.entries(idMap).map(([index, id]) => [index, String(id)]));
    }
}
