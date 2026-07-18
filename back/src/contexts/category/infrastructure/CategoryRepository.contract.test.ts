import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Category } from '../domain/Category';
import { CategoryRepository } from '../application/ports/CategoryRepository';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { MongooseCategoryRepository } from './MongooseCategoryRepository';
import CategoryModel from './CategoryModel';

/**
 * Fresh contract test for `category` (task 2.10) — deliberately NOT reusing
 * `_example`'s `ExampleItemRepository.contract.test.ts` `runContract` helper,
 * which is hard-typed to `ExampleItemRepository`/`ExampleItem` (concrete
 * types baked into its signature, not generic over `<TEntity, TId, TRepo>`).
 * Runs the same assertions against both adapters (InMemory + real Mongoose
 * via `mongodb-memory-server`, no mocked Mongoose calls), mirroring the
 * Fase 1 principle from explore #208 / design's Testing Strategy.
 */
interface RepositoryLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const runCategoryContract = (
    suiteName: string,
    makeRepo: () => CategoryRepository,
    lifecycle: RepositoryLifecycle = {},
): void => {
    describe(suiteName, () => {
        if (lifecycle.beforeAll) {
            beforeAll(lifecycle.beforeAll);
        }
        if (lifecycle.afterAll) {
            afterAll(lifecycle.afterAll);
        }
        if (lifecycle.beforeEach) {
            beforeEach(lifecycle.beforeEach);
        }

        it('upserts by Tag: saving twice with the same Tag updates instead of duplicating', async () => {
            const repo = makeRepo();
            const first = await repo.upsert(
                Category.create({ Description: 'Monthly rent', Name: 'Rent (first)', Type: 'fijo', Tag: 'contract-rent-tag' }),
            );
            const second = await repo.upsert(
                Category.create({ Description: 'Monthly rent renamed', Name: 'Rent (renamed)', Type: 'fijo', Tag: 'contract-rent-tag' }),
            );

            expect(second.id?.equals(first.id!)).toBe(true);
            expect(second.name).toBe('Rent (renamed)');

            const all = await repo.find({ Tag: 'contract-rent-tag' });
            expect(all).toHaveLength(1);
        });

        it('upserts by Name when Tag is absent', async () => {
            const repo = makeRepo();
            const first = await repo.upsert(
                Category.create({ Description: 'Utilities (first)', Name: 'contract-utilities-name', Type: 'variable' }),
            );
            const second = await repo.upsert(
                Category.create({ Description: 'Utilities (updated)', Name: 'contract-utilities-name', Type: 'variable' }),
            );

            expect(second.id?.equals(first.id!)).toBe(true);
            expect(second.description).toBe('Utilities (updated)');
        });

        it('bulkUpsert reports upsertedCount for a batch of new categories and persists all of them', async () => {
            const repo = makeRepo();

            const result = await repo.bulkUpsert([
                Category.create({ Description: 'Bulk A', Name: 'Bulk A', Type: 'variable', Tag: 'contract-bulk-a' }),
                Category.create({ Description: 'Bulk B', Name: 'Bulk B', Type: 'fijo', Tag: 'contract-bulk-b' }),
            ]);

            expect(result.upsertedCount).toBe(2);
            expect(result.matchedCount).toBe(0);
            expect(Object.keys(result.upsertedIds).sort()).toEqual(['0', '1']);

            const persistedA = await repo.find({ Tag: 'contract-bulk-a' });
            const persistedB = await repo.find({ Tag: 'contract-bulk-b' });
            expect(persistedA).toHaveLength(1);
            expect(persistedB).toHaveLength(1);
        });

        it('bulkUpsert reports matchedCount/modifiedCount when re-saving an existing key', async () => {
            const repo = makeRepo();
            await repo.bulkUpsert([
                Category.create({ Description: 'first', Name: 'Repeat', Type: 'variable', Tag: 'contract-bulk-repeat' }),
            ]);

            const result = await repo.bulkUpsert([
                Category.create({ Description: 'updated', Name: 'Repeat', Type: 'variable', Tag: 'contract-bulk-repeat' }),
            ]);

            expect(result.upsertedCount).toBe(0);
            expect(result.matchedCount).toBe(1);
            expect(result.modifiedCount).toBe(1);
        });

        it('find honors an equality filter and pagination', async () => {
            const repo = makeRepo();
            await repo.upsert(Category.create({ Description: 'A', Name: 'contract-page-a', Type: 'variable', Tag: 'contract-page-a' }));
            await repo.upsert(Category.create({ Description: 'B', Name: 'contract-page-b', Type: 'variable', Tag: 'contract-page-b' }));
            await repo.upsert(Category.create({ Description: 'C', Name: 'contract-page-c', Type: 'fijo', Tag: 'contract-page-other' }));

            const filtered = await repo.find({ Type: 'variable' });
            const filteredPageOnes = filtered.filter((category) => category.name.startsWith('contract-page-'));
            expect(filteredPageOnes.length).toBeGreaterThanOrEqual(2);

            const paginated = await repo.find({ Tag: 'contract-page-a' }, { skip: 0, limit: 1 });
            expect(paginated).toHaveLength(1);
            expect(paginated[0].name).toBe('contract-page-a');

            const emptyPage = await repo.find({ Tag: 'contract-page-a' }, { skip: 1, limit: 1 });
            expect(emptyPage).toHaveLength(0);
        });

        it('findById returns null for an id that was never saved', async () => {
            const repo = makeRepo();

            const found = await repo.findById(
                (await repo.upsert(Category.create({ Description: 'x', Name: 'contract-findbyid-seed', Type: 'variable' }))).id!,
            );
            expect(found).not.toBeNull();

            const { Identity } = await import('../../../shared/domain/Identity');
            const neverSaved = await repo.findById(Identity.create(Identity.generate()));
            expect(neverSaved).toBeNull();
        });

        it('round-trips Color through upsert and find/findById', async () => {
            const repo = makeRepo();
            const saved = await repo.upsert(
                Category.create({ Description: 'Colorful', Name: 'contract-color', Type: 'variable', Tag: 'contract-color-tag', Color: 'red' }),
            );

            expect(saved.color).toBe('red');

            const found = await repo.findById(saved.id!);
            expect(found?.color).toBe('red');

            const [viaFind] = await repo.find({ Tag: 'contract-color-tag' });
            expect(viaFind.color).toBe('red');
        });

        it('reads back Color as empty string for a legacy-shape category saved without Color', async () => {
            const repo = makeRepo();
            const saved = await repo.upsert(
                Category.create({ Description: 'Legacy', Name: 'contract-legacy-color', Type: 'variable', Tag: 'contract-legacy-color-tag' }),
            );

            expect(saved.color).toBe('');

            const found = await repo.findById(saved.id!);
            expect(found?.color).toBe('');
        });

        it('delete removes the category so it can no longer be found, and returns the deleted entity', async () => {
            const repo = makeRepo();
            const created = await repo.upsert(Category.create({ Description: 'to delete', Name: 'contract-to-delete', Type: 'variable' }));

            const deleted = await repo.delete(created.id!);
            expect(deleted?.name).toBe('contract-to-delete');

            const found = await repo.findById(created.id!);
            expect(found).toBeNull();
        });
    });
};

runCategoryContract('InMemoryCategoryRepository', () => new InMemoryCategoryRepository());

let mongod: MongoMemoryServer;

runCategoryContract('MongooseCategoryRepository', () => new MongooseCategoryRepository(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'category-repository-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await CategoryModel.deleteMany({});
    },
});
